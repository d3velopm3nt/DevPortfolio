import React from 'react';
import { projects } from '../data/projects';
import { Technology } from '../types';
import { techCategories } from '../data/techCategories';

export function TechStackLayers() {
  // Get all unique technologies from projects
  const allTechnologies = React.useMemo(() => {
    const techMap = new Map<string, Technology>();
    projects.forEach(project => {
      project.technologies.forEach(tech => {
        if (!techMap.has(tech.name)) {
          techMap.set(tech.name, tech);
        }
      });
    });
    return Array.from(techMap.values());
  }, []);

  // Group technologies by category
  const techByCategory = React.useMemo(() => {
    const categories = techCategories.reduce((acc, category) => {
      acc[category.id] = [];
      return acc;
    }, {} as Record<string, Technology[]>);

    allTechnologies.forEach(tech => {
      if (categories[tech.type]) {
        categories[tech.type].push(tech);
      }
    });

    return categories;
  }, [allTechnologies]);

  return (
    <div className="grid gap-6">
      {techCategories.map((category) => (
        <div
          key={category.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${category.color}`}>
              <category.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {techByCategory[category.id]?.map((tech) => (
              <div
                key={tech.name}
                className={`${tech.color} px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-transform hover:scale-105`}
              >
                {tech.icon && <tech.icon size={16} />}
                {tech.name}
              </div>
            ))}
            {(!techByCategory[category.id] || techByCategory[category.id].length === 0) && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No technologies added yet
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}