import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code2, Layout, Plus, X, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Technology } from '../types';
import { techCategories } from '../data/techCategories';

interface TechStack {
  id: string;
  name: string;
  description: string;
  category: string;
  technologies: Technology[];
}

export function TechStackProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [techStack, setTechStack] = useState<TechStack | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Web',
    technologies: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [techStackResponse, technologiesResponse] = await Promise.all([
        id ? supabase
          .from('tech_stacks')
          .select(`
            *,
            tech_stack_technologies (
              technologies (*)
            )
          `)
          .eq('id', id)
          .single() : null,
        supabase
          .from('technologies')
          .select('*')
          .order('name')
      ]);

      if (techStackResponse?.error) throw techStackResponse.error;
      if (technologiesResponse.error) throw technologiesResponse.error;

      if (techStackResponse?.data) {
        const stack = {
          ...techStackResponse.data,
          technologies: techStackResponse.data.tech_stack_technologies.map((t: any) => t.technologies)
        };
        setTechStack(stack);
        setFormData({
          name: stack.name,
          description: stack.description || '',
          category: stack.category,
          technologies: stack.technologies.map(t => t.id)
        });
      }

      setTechnologies(technologiesResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load tech stack');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Create or update tech stack
      const { data: stack, error: stackError } = id
        ? await supabase
            .from('tech_stacks')
            .update({
              name: formData.name,
              description: formData.description,
              category: formData.category
            })
            .eq('id', id)
            .select()
            .single()
        : await supabase
            .from('tech_stacks')
            .insert([{
              name: formData.name,
              description: formData.description,
              category: formData.category
            }])
            .select()
            .single();

      if (stackError) throw stackError;

      // Update technologies
      if (id) {
        await supabase
          .from('tech_stack_technologies')
          .delete()
          .eq('tech_stack_id', id);
      }

      if (formData.technologies.length > 0) {
        const { error: techError } = await supabase
          .from('tech_stack_technologies')
          .insert(
            formData.technologies.map(techId => ({
              tech_stack_id: stack.id,
              technology_id: techId
            }))
          );

        if (techError) throw techError;
      }

      navigate('/settings');
    } catch (err) {
      console.error('Error saving tech stack:', err);
      setError('Failed to save tech stack');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Settings
        </button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            <Layout className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {id ? 'Edit Tech Stack' : 'Create Tech Stack'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {['Web', 'Mobile', 'Desktop', 'Backend', 'Data', 'DevOps'].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Technologies
              </h2>
              <div className="space-y-6">
                {techCategories.map((category) => {
                  const categoryTechs = technologies.filter(t => t.type === category.id);
                  return (
                    <div key={category.id} className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categoryTechs.map((tech) => (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                technologies: prev.technologies.includes(tech.id)
                                  ? prev.technologies.filter(id => id !== tech.id)
                                  : [...prev.technologies, tech.id]
                              }));
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                              formData.technologies.includes(tech.id)
                                ? tech.color
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {formData.technologies.includes(tech.id) ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            {tech.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preview
              </h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formData.name || 'Tech Stack Name'}
                </h3>
                {formData.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {formData.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map(techId => {
                    const tech = technologies.find(t => t.id === techId);
                    if (!tech) return null;
                    return (
                      <div
                        key={tech.id}
                        className={`${tech.color} px-3 py-1 rounded-full text-sm flex items-center gap-1.5`}
                      >
                        <Code2 className="w-4 h-4" />
                        {tech.name}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {formData.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {id ? 'Update Tech Stack' : 'Create Tech Stack'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}