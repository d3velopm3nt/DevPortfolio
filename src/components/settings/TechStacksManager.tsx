import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Code2, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Technology } from '../../types';

interface TechStack {
  id: string;
  name: string;
  description: string;
  category: string;
  technologies: Technology[];
}

export function TechStacksManager() {
  const navigate = useNavigate();
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('tech_stacks')
        .select(`
          *,
          tech_stack_technologies (
            technologies (*)
          )
        `)
        .order('name');

      if (error) throw error;

      setTechStacks(data.map((stack: any) => ({
        ...stack,
        technologies: stack.tech_stack_technologies.map((t: any) => t.technologies)
      })));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load tech stacks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (stack: TechStack) => {
    if (!window.confirm(`Are you sure you want to delete ${stack.name}?`)) return;

    try {
      const { error } = await supabase
        .from('tech_stacks')
        .delete()
        .eq('id', stack.id);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting tech stack:', err);
      setError('Failed to delete tech stack');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tech Stacks</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage predefined technology combinations
          </p>
        </div>
        <Link
          to="/settings/tech-stacks/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          <Plus className="w-5 h-5" />
          Add Tech Stack
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {techStacks.map((stack) => (
          <div
            key={stack.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stack.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stack.description}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {stack.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/settings/tech-stacks/${stack.id}`)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(stack)}
                  className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {stack.technologies.map((tech) => (
                <div
                  key={tech.id}
                  className={`${tech.color} px-3 py-1 rounded-full text-sm flex items-center gap-1.5`}
                >
                  <Code2 className="w-4 h-4" />
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}