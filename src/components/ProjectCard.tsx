import React, { useState } from 'react';
import { ExternalLink, Github, Code2, Layout, Server, Database, Lock, BarChart2, GitBranch, TestTube2, AppWindow, ChevronDown, ChevronUp } from 'lucide-react';
import { Project } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  showViewMore?: boolean;
}

export function ProjectCard({ project, showViewMore = true }: ProjectCardProps) {
  const navigate = useNavigate();
  const [showFullStack, setShowFullStack] = useState(false);
  
  // Group technologies by type, safely handling null/undefined values
  const techsByType = React.useMemo(() => {
    const grouped = project.technologies.reduce((acc, tech) => {
      if (tech && tech.type) {
        if (!acc[tech.type]) {
          acc[tech.type] = [];
        }
        acc[tech.type].push(tech);
      }
      return acc;
    }, {} as Record<string, typeof project.technologies>);
    return grouped;
  }, [project.technologies]);

  // Get icon for tech type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'language':
        return Code2;
      case 'frontend':
        return Layout;
      case 'backend':
        return Server;
      case 'database':
        return Database;
      case 'auth':
        return Lock;
      case 'visualization':
        return BarChart2;
      case 'deployment':
        return GitBranch;
      case 'testing':
        return TestTube2;
      default:
        return Code2;
    }
  };

  const handleTechClick = (e: React.MouseEvent, techName: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/technology/${encodeURIComponent(techName)}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
      {project.image_url && (
        <img 
          src={project.image_url} 
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
            {project.application && (
              <Link
                to={`/applications/${project.application.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-sm mb-3 hover:bg-indigo-100 dark:hover:bg-indigo-900/70"
              >
                <AppWindow className="w-4 h-4" />
                {project.application.name}
              </Link>
            )}
            <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
          </div>
          <div className="flex gap-2">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="View Code"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Live Demo"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Compact Tech Stack View */}
        {!showFullStack && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => tech && (
                <button
                  key={tech.name}
                  onClick={(e) => handleTechClick(e, tech.name)}
                  className={`${tech.color} px-2 py-1 rounded-full text-sm hover:opacity-80 transition-opacity cursor-pointer`}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Full Tech Stack View */}
        {showFullStack && (
          <div className="space-y-4">
            {Object.entries(techsByType).map(([type, techs]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {React.createElement(getTypeIcon(type), { size: 16 })}
                  <span className="capitalize">{type}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech) => tech && (
                    <button
                      key={tech.name}
                      onClick={(e) => handleTechClick(e, tech.name)}
                      className={`${tech.color} px-2 py-1 rounded-full text-sm hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                      {tech.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setShowFullStack(!showFullStack)}
          className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          {showFullStack ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Full Stack
            </>
          )}
        </button>

        {showViewMore && (
          <div className="mt-6">
            <Link
              to={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              View Details
              <ExternalLink size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}