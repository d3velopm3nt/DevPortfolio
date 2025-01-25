import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code2, Package, Users, Plus, Loader2, X, Check, Library, Box, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { technologies } from '../data/technologies';
import { ProjectCard } from '../components/ProjectCard';
import { InfoBlockEditor } from '../components/tech/InfoBlockEditor';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  technologies: any[];
}

interface InfoBlock {
  id: string;
  title: string;
  description: string;
  type: 'library' | 'package' | 'framework' | 'blog' | 'social_media';
  items: InfoItem[];
}

interface InfoItem {
  id: string;
  type: 'text' | 'image' | 'link';
  content: string;
  order_index: number;
}

export function TechnologyProfilePage() {
  const { techName } = useParams<{ techName: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [infoBlocks, setInfoBlocks] = useState<InfoBlock[]>([]);
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<InfoBlock | null>(null);
  const [blockForm, setBlockForm] = useState({
    title: '',
    description: '',
    type: 'library' as InfoBlock['type'],
    items: [] as InfoItem[]
  });

  // First get the technology ID from our technologies data
  const [technologyId, setTechnologyId] = useState<string | null>(null);
  const technology = technologies.find(t => t.name === techName);

  // Get the technology ID when component mounts
  useEffect(() => {
    const fetchTechnologyId = async () => {
      if (!technology) return;

      try {
        const { data, error } = await supabase
          .from('technologies')
          .select('id')
          .eq('name', technology.name)
          .single();

        if (error) throw error;
        setTechnologyId(data.id);
      } catch (err) {
        console.error('Error fetching technology ID:', err);
        setError('Failed to load technology information');
      }
    };

    fetchTechnologyId();
  }, [technology]);

  useEffect(() => {
    if (technologyId) {
      fetchData();
    }
  }, [technologyId]);

  const fetchData = async () => {
    if (!technologyId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch projects using this technology
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_technologies!inner (
            technology_id,
            technologies (*)
          )
        `)
        .eq('project_technologies.technology_id', technologyId);

      if (projectsError) throw projectsError;

      // Fetch info blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('tech_info_blocks')
        .select(`
          *,
          tech_info_items (*)
        `)
        .eq('technology_id', technologyId)
        .order('created_at', { ascending: false });

      if (blocksError) throw blocksError;

      // Transform projects data to include all technologies
      const transformedProjects = projectsData.map(project => ({
        ...project,
        technologies: project.project_technologies.map((pt: any) => pt.technologies)
      }));

      setProjects(transformedProjects);
      setInfoBlocks(blocksData.map((block: any) => ({
        ...block,
        items: block.tech_info_items.sort((a: any, b: any) => a.order_index - b.order_index)
      })));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBlock = async () => {
    if (!technologyId) return;

    try {
      // Create or update the block
      const { data: block, error: blockError } = editingBlock
        ? await supabase
            .from('tech_info_blocks')
            .update({
              title: blockForm.title,
              description: blockForm.description,
              type: blockForm.type
            })
            .eq('id', editingBlock.id)
            .select()
            .single()
        : await supabase
            .from('tech_info_blocks')
            .insert([{
              technology_id: technologyId,
              title: blockForm.title,
              description: blockForm.description,
              type: blockForm.type
            }])
            .select()
            .single();

      if (blockError) throw blockError;

      // Delete existing items if editing
      if (editingBlock) {
        await supabase
          .from('tech_info_items')
          .delete()
          .eq('block_id', editingBlock.id);
      }

      // Create items
      if (blockForm.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('tech_info_items')
          .insert(
            blockForm.items.map((item, index) => ({
              block_id: block.id,
              type: item.type,
              content: item.content,
              order_index: index
            }))
          );

        if (itemsError) throw itemsError;
      }

      await fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving block:', err);
      setError('Failed to save info block');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!window.confirm('Are you sure you want to delete this info block?')) return;

    try {
      const { error } = await supabase
        .from('tech_info_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting block:', err);
      setError('Failed to delete info block');
    }
  };

  const handleEditBlock = (block: InfoBlock) => {
    setEditingBlock(block);
    setBlockForm({
      title: block.title,
      description: block.description,
      type: block.type,
      items: block.items
    });
    setIsAddBlockModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddBlockModalOpen(false);
    setEditingBlock(null);
    setBlockForm({
      title: '',
      description: '',
      type: 'library',
      items: []
    });
  };

  const getBlockIcon = (type: InfoBlock['type']) => {
    switch (type) {
      case 'library':
        return Library;
      case 'package':
        return Box;
      case 'framework':
        return Code2;
      case 'blog':
      case 'social_media':
        return Globe;
      default:
        return Code2;
    }
  };

  if (!technology) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
        Technology not found
      </div>
    );
  }

  const Icon = technology.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Technology Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className={`p-4 rounded-xl ${technology.color}`}>
              {Icon && <Icon size={48} />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {technology.name}
              </h1>
              <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  <span className="capitalize">{technology.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>{projects.length} Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{Math.floor(Math.random() * 1000) + 100} Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Blocks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Resources & Information
              </h2>
              <button
                onClick={() => setIsAddBlockModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                <Plus className="w-5 h-5" />
                Add Info Block
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {infoBlocks.map((block) => {
                const BlockIcon = getBlockIcon(block.type);
                return (
                  <div
                    key={block.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-700">
                          <BlockIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {block.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {block.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditBlock(block)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Code2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {block.items.map((item) => {
                        if (item.type === 'text') {
                          return (
                            <p key={item.id} className="text-gray-600 dark:text-gray-300">
                              {item.content}
                            </p>
                          );
                        }
                        if (item.type === 'image') {
                          return (
                            <img
                              key={item.id}
                              src={item.content}
                              alt=""
                              className="rounded-lg max-w-full h-auto"
                            />
                          );
                        }
                        if (item.type === 'link') {
                          return (
                            <a
                              key={item.id}
                              href={item.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              <Globe className="w-4 h-4" />
                              {item.content}
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Projects Using {technology.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Info Block Modal */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingBlock ? 'Edit Info Block' : 'Add Info Block'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={blockForm.title}
                    onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={blockForm.description}
                    onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={blockForm.type}
                    onChange={(e) => setBlockForm({ ...blockForm, type: e.target.value as InfoBlock['type'] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="library">Library</option>
                    <option value="package">Package</option>
                    <option value="framework">Framework</option>
                    <option value="blog">Blog</option>
                    <option value="social_media">Social Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Items
                  </label>
                  <InfoBlockEditor
                    items={blockForm.items}
                    onChange={(items) => setBlockForm({ ...blockForm, items })}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBlock}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingBlock ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}