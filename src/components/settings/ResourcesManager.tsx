import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Library, PenTool as Tool, Code2, Cloud, Plug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface ResourceType {
  id: string;
  name: string;
  description: string;
  icon_name: string;
}

interface Resource {
  id: string;
  name: string;
  description: string;
  type_id: string;
  type: ResourceType;
  website_url: string;
  github_url: string;
  documentation_url: string;
  technologies: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export function ResourcesManager() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingType, setEditingType] = useState<ResourceType | null>(null);

  const [resourceForm, setResourceForm] = useState({
    name: '',
    description: '',
    type_id: '',
    website_url: '',
    github_url: '',
    documentation_url: '',
    technologies: [] as string[]
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    icon_name: 'library'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesResponse, typesResponse] = await Promise.all([
        supabase
          .from('resources')
          .select(`
            *,
            type:resource_types(*),
            resource_technologies(
              technologies(*)
            )
          `)
          .order('name'),
        supabase
          .from('resource_types')
          .select('*')
          .order('name')
      ]);

      if (resourcesResponse.error) throw resourcesResponse.error;
      if (typesResponse.error) throw typesResponse.error;

      setResources(resourcesResponse.data.map(resource => ({
        ...resource,
        technologies: resource.resource_technologies.map((rt: any) => rt.technologies)
      })));
      setResourceTypes(typesResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const resourceData = {
        name: resourceForm.name,
        description: resourceForm.description,
        type_id: resourceForm.type_id,
        website_url: resourceForm.website_url,
        github_url: resourceForm.github_url,
        documentation_url: resourceForm.documentation_url
      };

      const { data: resource, error: resourceError } = editingResource
        ? await supabase
            .from('resources')
            .update(resourceData)
            .eq('id', editingResource.id)
            .select()
            .single()
        : await supabase
            .from('resources')
            .insert([resourceData])
            .select()
            .single();

      if (resourceError) throw resourceError;

      // Update technologies
      if (editingResource) {
        await supabase
          .from('resource_technologies')
          .delete()
          .eq('resource_id', editingResource.id);
      }

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

      await fetchData();
      handleCloseResourceModal();
    } catch (err) {
      console.error('Error saving resource:', err);
      setError('Failed to save resource');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitType = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = editingType
        ? await supabase
            .from('resource_types')
            .update(typeForm)
            .eq('id', editingType.id)
        : await supabase
            .from('resource_types')
            .insert([typeForm]);

      if (error) throw error;

      await fetchData();
      handleCloseTypeModal();
    } catch (err) {
      console.error('Error saving resource type:', err);
      setError('Failed to save resource type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    if (!window.confirm(`Are you sure you want to delete ${resource.name}?`)) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resource.id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Failed to delete resource');
    }
  };

  const handleDeleteType = async (type: ResourceType) => {
    if (!window.confirm(`Are you sure you want to delete ${type.name}? This will affect all resources of this type.`)) return;

    try {
      const { error } = await supabase
        .from('resource_types')
        .delete()
        .eq('id', type.id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting resource type:', err);
      setError('Failed to delete resource type');
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      description: resource.description || '',
      type_id: resource.type_id,
      website_url: resource.website_url || '',
      github_url: resource.github_url || '',
      documentation_url: resource.documentation_url || '',
      technologies: resource.technologies.map(t => t.id)
    });
    setIsAddModalOpen(true);
  };

  const handleEditType = (type: ResourceType) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      description: type.description || '',
      icon_name: type.icon_name || 'library'
    });
    setIsTypeModalOpen(true);
  };

  const handleCloseResourceModal = () => {
    setIsAddModalOpen(false);
    setEditingResource(null);
    setResourceForm({
      name: '',
      description: '',
      type_id: '',
      website_url: '',
      github_url: '',
      documentation_url: '',
      technologies: []
    });
  };

  const handleCloseTypeModal = () => {
    setIsTypeModalOpen(false);
    setEditingType(null);
    setTypeForm({
      name: '',
      description: '',
      icon_name: 'library'
    });
  };

  const getTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'library':
        return Library;
      case 'tool':
        return Tool;
      case 'code':
        return Code2;
      case 'cloud':
        return Cloud;
      case 'plug':
        return Plug;
      default:
        return Library;
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
      {/* Resource Types Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resource Types</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage the types of resources available in your portfolio
            </p>
          </div>
          <button
            onClick={() => setIsTypeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-5 h-5" />
            Add Type
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resourceTypes.map((type) => {
            const TypeIcon = getTypeIcon(type.icon_name);
            return (
              <div
                key={type.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{type.name}</h3>
                    {type.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditType(type)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteType(type)}
                    className="p-1 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resources Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resources</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage libraries, tools, and other resources used in your projects
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {resources.map((resource) => {
            const TypeIcon = getTypeIcon(resource.type.icon_name);
            return (
              <div
                key={resource.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
                      <TypeIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {resource.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {resource.type.name}
                        </span>
                        {resource.technologies.length > 0 && (
                          <>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                              {resource.technologies.map((tech) => (
                                <span
                                  key={tech.id}
                                  className={`${tech.color} px-2 py-0.5 rounded-full text-xs`}
                                >
                                  {tech.name}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditResource(resource)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource)}
                      className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {resource.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {resource.description}
                  </p>
                )}

                <div className="flex gap-4">
                  {resource.website_url && (
                    <a
                      href={resource.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Website
                    </a>
                  )}
                  {resource.documentation_url && (
                    <a
                      href={resource.documentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Documentation
                    </a>
                  )}
                  {resource.github_url && (
                    <a
                      href={resource.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resource Type Modal */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingType ? 'Edit Resource Type' : 'Add Resource Type'}
                </h2>
                <button
                  onClick={handleCloseTypeModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitType} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={typeForm.name}
                    onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={typeForm.description}
                    onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Icon
                  </label>
                  <select
                    value={typeForm.icon_name}
                    onChange={(e) => setTypeForm({ ...typeForm, icon_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="library">Library</option>
                    <option value="tool">Tool</option>
                    <option value="code">Code</option>
                    <option value="cloud">Cloud</option>
                    <option value="plug">Plugin</option>
                  </select>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseTypeModal}
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingType ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingResource ? 'Edit Resource' : 'Add Resource'}
                </h2>
                <button
                  onClick={handleCloseResourceModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitResource} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
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
                    value={resourceForm.type_id}
                    onChange={(e) => setResourceForm({ ...resourceForm, type_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Type</option>
                    {resourceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Documentation URL
                    </label>
                    <input
                      type="url"
                      value={resourceForm.documentation_url}
                      onChange={(e) => setResourceForm({ ...resourceForm, documentation_url: e.target.value })}
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
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseResourceModal}
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingResource ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}