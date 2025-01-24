import React from 'react';
import { Timeline } from '../components/Timeline';
import { SearchBar } from '../components/SearchBar';
import { projects } from '../data/projects';
import { Technology } from '../types';
import { useState } from 'react';

export function TimelinePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<Technology[]>([]);

  // Get all unique technologies from projects
  const availableTechs = React.useMemo(() => {
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

  const handleTechToggle = (tech: Technology) => {
    setSelectedTechs(prev => 
      prev.some(t => t.name === tech.name)
        ? prev.filter(t => t.name !== tech.name)
        : [...prev, tech]
    );
  };

  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => 
          tech.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesTechs = selectedTechs.length === 0 || 
        selectedTechs.every(selectedTech =>
          project.technologies.some(tech => tech.name === selectedTech.name)
        );

      return matchesSearch && matchesTechs;
    });
  }, [searchTerm, selectedTechs]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Timeline</h1>
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTechs={selectedTechs}
        onTechToggle={handleTechToggle}
        availableTechs={availableTechs}
      />

      <Timeline projects={filteredProjects} />
    </div>
  );
}