import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { Technology, TechStackSection } from '../types';
import { techCategories } from '../data/techCategories';
import { supabase } from '../lib/supabase';
import { technologies } from '../data/technologies';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: () => void;
  projectId: string;
}

export function EditProjectModal({ isOpen, onClose, onProjectUpdated, projectId }: EditProjectModalProps) {
  const [currentStep, setCurrentStep] = useState<TechStackSection>('language');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techsData, setTechsData] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const { data, error } = await supabase
          .from('technologies')
          .select('id, name');
        
        if (error) throw error;

        const techMap = data.reduce((acc, tech) => {
          acc[tech.name] = tech.id;
          return acc;
        }, {} as Record<string, string>);

        setTechsData(techMap);
      } catch (err) {
        console.error('Error fetching technologies:', err);
      }
    };

    if (isOpen) {
      fetchTechnologies();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_technologies (
              technologies (
                id,
                name,
                type,
                color
              )
            )
          `)
          .eq('id', projectId)
          .single();

        if (error) throw error;

        setTitle(data.title);
        setDescription(data.description);
        setGithubUrl(data.github_url || '');
        setLiveUrl(data.live_url || '');
        setSelectedTechs(data.project_technologies.map((pt: any) => pt.technologies));
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project');
      }
    };

    if (isOpen && projectId) {
      fetchProject();
    }
  }, [isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Start a transaction by using RPC
      const { data: result, error: rpcError } = await supabase.rpc('update_project', {
        p_project_id: projectId,
        p_title: title,
        p_description: description,
        p_github_url: githubUrl,
        p_live_url: liveUrl,
        p_tech_names: selectedTechs.map(tech => tech.name)
      });

      if (rpcError) throw rpcError;

      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTechToggle = (tech: Technology) => {
    setSelectedTechs(prev => 
      prev.some(t => t.name === tech.name)
        ? prev.filter(t => t.name !== tech.name)
        : [...prev, tech]
    );
  };

  if (!isOpen) return null;

  const currentCategory = techCategories.find(cat => cat.id === currentStep)!;
  const availableTechs = technologies.filter(tech => tech.type === currentStep);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Project</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Live URL
                  </label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tech Stack</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {techCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCurrentStep(category.id)}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                      currentStep === category.id
                        ? category.color
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <category.icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{category.title}</span>
                  </button>
                ))}
              </div>

              <div className={`p-6 rounded-xl ${currentCategory.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <currentCategory.icon className="w-6 h-6" />
                  <div>
                    <h4 className="font-semibold">{currentCategory.title}</h4>
                    <p className="text-sm opacity-80">{currentCategory.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableTechs.map((tech) => (
                    <button
                      key={tech.name}
                      type="button"
                      onClick={() => handleTechToggle(tech)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                        selectedTechs.some(t => t.name === tech.name)
                          ? 'bg-white/20'
                          : 'bg-white/10 hover:bg-white/15'
                      }`}
                    >
                      {selectedTechs.some(t => t.name === tech.name) ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {tech.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}