import React from 'react';
import { Code2, Boxes, Wrench, Library, Package, Sparkles } from 'lucide-react';
import { projects } from '../data/projects';
import { Technology } from '../types';

export function Dashboard() {
  const techsByType = projects.reduce((acc, project) => {
    project.technologies.forEach(tech => {
      if (!acc[tech.type]) {
        acc[tech.type] = new Set();
      }
      acc[tech.type].add(tech);
    });
    return acc;
  }, {} as Record<string, Set<Technology>>);

  const typeIcons = {
    language: Code2,
    framework: Boxes,
    library: Library,
    tool: Wrench,
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div className="px-8 py-12 md:px-12 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                Portfolio Dashboard
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Modern Web Development Portfolio
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A showcase of cutting-edge projects built with the latest technologies and best practices in web development.
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(techsByType).map(([type]) => {
                const Icon = typeIcons[type as keyof typeof typeIcons];
                return (
                  <div
                    key={`hero-type-${type}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                  </div>
                );
              })}
            </div>
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
            value: Object.keys(techsByType).length, 
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
        {Object.entries(techsByType).map(([type, techs]) => {
          const Icon = typeIcons[type as keyof typeof typeIcons];
          return (
            <div key={`category-${type}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </h2>
                <div className="ml-auto px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                  {techs.size}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(techs).map((tech) => (
                  <div
                    key={`${type}-${tech.name}`} // Changed key to include both type and name
                    className={`${tech.color} inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-transform hover:scale-105`}
                  >
                    {tech.icon && <tech.icon size={18} />}
                    <span>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}