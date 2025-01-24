import React, { useState } from 'react';
import { Code2, Boxes, Wrench, Library, Package, Sparkles } from 'lucide-react';
import { projects } from '../data/projects';
import { Technology } from '../types';
import { techCategories } from '../data/techCategories';
import { technologies } from '../data/technologies';
import { AddProjectModal } from './AddProjectModal';

export function Dashboard() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // Get all unique technologies from projects
  const techsByType = React.useMemo(() => {
    const acc: Record<string, Set<Technology>> = {};
    techCategories.forEach(category => {
      acc[category.id] = new Set(
        technologies.filter(tech => tech.type === category.id)
      );
    });
    return acc;
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="px-8 py-12 md:px-12 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                Developer Dashboard
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your Tech Stack Overview
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A comprehensive view of your technical expertise across different domains.
            </p>
            <button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              <Package className="w-5 h-5" />
              Add New Project
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Projects', value: projects.length, icon: Package, color: 'text-blue-600 dark:text-blue-400' },
          { 
            label: 'Technologies', 
            value: Object.values(techsByType).reduce((acc, techs) => acc + techs.size, 0), 
            icon: Code2,
            color: 'text-purple-600 dark:text-purple-400'
          },
          { 
            label: 'Categories', 
            value: techCategories.length, 
            icon: Boxes,
            color: 'text-indigo-600 dark:text-indigo-400'
          },
        ].map((stat) => (
          <div key={`stat-${stat.label}`} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Technology Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techCategories.map((category) => (
          <div key={`category-${category.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <category.icon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.title}
              </h2>
              <div className="ml-auto px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                {techsByType[category.id]?.size || 0}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(techsByType[category.id] || []).map((tech) => (
                <div
                  key={`${category.id}-${tech.name}`}
                  className={`${tech.color} inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-transform hover:scale-105`}
                >
                  {tech.icon && <tech.icon size={18} />}
                  <span>{tech.name}</span>
                </div>
              ))}
              {(!techsByType[category.id] || techsByType[category.id].size === 0) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No technologies added yet
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onProjectAdded={() => {
          // Refresh projects data
          setIsAddProjectModalOpen(false);
        }}
      />
    </div>
  );
}