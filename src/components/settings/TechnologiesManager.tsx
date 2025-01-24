import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Check, Code2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { techCategories } from '../../data/techCategories';
import { Technology } from '../../types';

interface TechnologyFormData {
  name: string;
  type: string;
  color: string;
  description: string;
}

export function TechnologiesManager() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [formData, setFormData] = useState<TechnologyFormData>({
    name: '',
    type: techCategories[0].id,
    color: 'bg-blue-500/10 text-blue-600',
    description: ''
  });

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
      setError('Failed to load technologies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnologies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = editingTech
        ? await supabase
            .from('technologies')
            .update({
              name: formData.name,
              type: formData.type,
              color: formData.color,
              description: formData.description
            })
            .eq('id', editingTech.id)
        : await supabase
            .from('technologies')
            .insert([formData]);

      if (error) throw error;

      await fetchTechnologies();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving technology:', err);
      setError('Failed to save technology');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tech: Technology) => {
    if (!window.confirm(`Are you sure you want to delete ${tech.name}?`)) return;

    try {
      const { error } = await supabase
        .from('technologies')
        .delete()
        .eq('id', tech.id);

      if (error) throw error;
      await fetchTechnologies();
    } catch (err) {
      console.error('Error deleting technology:', err);
      setError('Failed to delete technology');
    }
  };

  const handleEdit = (tech: Technology) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      type: tech.type,
      color: tech.color,
      description: tech.description || ''
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTech(null);
    setFormData({
      name: '',
      type: techCategories[0].id,
      color: 'bg-blue-500/10 text-blue-600',
      description: ''
    });
  };

  if (isLoading && !isAddModalOpen) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Technologies</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage the technologies available in your portfolio
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          <Plus className="w-5 h-5" />
          Add Technology
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {technologies.map((tech) => (
          <div
            key={tech.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${tech.color}`}>
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{tech.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{tech.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/technology/${encodeURIComponent(tech.name)}`}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
              <button
                onClick={() => handleEdit(tech)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(tech)}
                className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingTech ? 'Edit Technology' : 'Add Technology'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {techCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color Theme
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="bg-blue-500/10 text-blue-600">Blue</option>
                    <option value="bg-purple-500/10 text-purple-600">Purple</option>
                    <option value="bg-green-500/10 text-green-600">Green</option>
                    <option value="bg-red-500/10 text-red-600">Red</option>
                    <option value="bg-yellow-500/10 text-yellow-600">Yellow</option>
                    <option value="bg-pink-500/10 text-pink-600">Pink</option>
                    <option value="bg-indigo-500/10 text-indigo-600">Indigo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
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
                        {editingTech ? 'Update' : 'Create'}
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