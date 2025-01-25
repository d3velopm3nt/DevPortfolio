import React, { useState, useEffect } from 'react';
import { X, Loader2, Check, Library, PenTool as Tool, Code2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Technology } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

interface Resource {
  id: string;
  name: string;
  type: 'library' | 'tool' | 'framework';
  website_url: string;
  github_url: string;
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'article' as const,
    technologies: [] as string[],
    resource: null as string | null
  });
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    type: 'library' as const,
    website_url: '',
    github_url: '',
    technologies: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      fetchTechnologies();
      fetchResources();
    }
  }, [isOpen]);

  const fetchTechnologies = async () => {
    try {
      const { data, error } = await supabase
        .from('technologies')
        .select('*')
        .order('name');

      if (error) throw error;
      setTechnologies(data);
    } catch (err) {
      console.error('Error fetching technologies:', err);
    }
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name');

      if (error) throw error;
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create post
      const { data: post, error: postError } = await supabase
        .from('tech_feed_posts')
        .insert([{
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          type: formData.type,
          resource_id: formData.resource
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Add technologies
      if (formData.technologies.length > 0) {
        const { error: techError } = await supabase
          .from('tech_feed_post_technologies')
          .insert(
            formData.technologies.map(techId => ({
              post_id: post.id,
              technology_id: techId
            }))
          );

        if (techError) throw techError;
      }

      onPostCreated();
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create resource
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .insert([{
          name: resourceForm.name,
          type: resourceForm.type,
          website_url: resourceForm.website_url,
          github_url: resourceForm.github_url
        }])
        .select()
        .single();

      if (resourceError) throw resourceError;

      // Add technologies
      if (resourceForm.technologies.length > 0) {
        const { error: techError } = await supabase
          .from('resource_technologies')
          .insert(
            resourceForm.technologies.map(techId => ({
              resource_id: resource.id,
              technology_id: techId
            }))
          );

        if (techError) throw techError;
      }

      await fetchResources();
      setFormData(prev => ({ ...prev, resource: resource.id }));
      setIsAddingResource(false);
    } catch (err) {
      console.error('Error creating resource:', err);
      setError('Failed to create resource');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Post
            </h2>
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

          {isAddingResource ? (
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as 'library' | 'tool' | 'framework' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="library">Library</option>
                  <option value="tool">Tool</option>
                  <option value="framework">Framework</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={resourceForm.website_url}
                  onChange={(e) => setResourceForm({ ...resourceForm, website_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={resourceForm.github_url}
                  onChange={(e) => setResourceForm({ ...resourceForm, github_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technologies
                </label>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => {
                        setResourceForm(prev => ({
                          ...prev,
                          technologies: prev.technologies.includes(tech.id)
                            ? prev.technologies.filter(id => id !== tech.id)
                            : [...prev.technologies, tech.id]
                        }));
                      }}
                      className={`${tech.color} px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
                        resourceForm.technologies.includes(tech.id)
                          ? 'opacity-100'
                          : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      {tech.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddingResource(false)}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Resource
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Post Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'article' | 'tutorial' | 'news' | 'resource' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="article">Article</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="news">News</option>
                  <option value="resource">Resource</option>
                </select>
              </div>

              {formData.type === 'resource' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Resource
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingResource(true)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      Add New Resource
                    </button>
                  </div>
                  <select
                    value={formData.resource || ''}
                    onChange={(e) => setFormData({ ...formData, resource: e.target.value || null })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={formData.type === 'resource'}
                  >
                    <option value="">Select Resource</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} ({resource.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technologies
                </label>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
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
                      className={`${tech.color} px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
                        formData.technologies.includes(tech.id)
                          ? 'opacity-100'
                          : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      {tech.name}
                    </button>
                  ))}
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Post
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}