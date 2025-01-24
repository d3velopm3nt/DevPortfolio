import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Code2, Package, Users } from 'lucide-react';
import { technologies } from '../data/technologies';
import { projects } from '../data/projects';
import { ProjectCard } from '../components/ProjectCard';

export function TechnologyProfilePage() {
  const { techName } = useParams<{ techName: string }>();
  const navigate = useNavigate();

  const technology = technologies.find(t => t.name === techName);
  const relatedProjects = projects.filter(project => 
    project.technologies.some(tech => tech.name === techName)
  );

  if (!technology) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
        Technology not found
      </div>
    );
  }

  const Icon = technology.icon;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Technology Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className={`p-4 rounded-xl ${technology.color}`}>
              {Icon && <Icon size={48} />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {technology.name}
              </h1>
              <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  <span className="capitalize">{technology.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>{relatedProjects.length} Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{Math.floor(Math.random() * 1000) + 100} Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Description */}
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About {technology.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {getTechnologyDescription(technology.name)}
            </p>
          </div>
        </div>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Projects Using {technology.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getTechnologyDescription(techName: string): string {
  const descriptions: Record<string, string> = {
    'TypeScript': 'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.',
    'React': 'React is a JavaScript library for building user interfaces, particularly single-page applications where you need a fast, interactive user experience.',
    'Node.js': 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine, perfect for building fast, scalable network applications.',
    'Next.js': 'Next.js is a React framework that enables functionality like server-side rendering and static site generation for React based web applications.',
    'Vue': 'Vue.js is a progressive JavaScript framework used to build user interfaces and single-page applications.',
    'Angular': 'Angular is a platform for building mobile and desktop web applications using TypeScript/JavaScript and other languages.',
    'TailwindCSS': 'Tailwind CSS is a utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.',
    'PostgreSQL': 'PostgreSQL is a powerful, open source object-relational database system with over 30 years of active development.',
    'MongoDB': 'MongoDB is a source-available cross-platform document-oriented database program, classified as a NoSQL database.',
    'Redux': 'Redux is a predictable state container for JavaScript apps, helping you write applications that behave consistently.',
    'Docker': 'Docker is a platform designed to help developers build, share, and run container applications.',
    'Kubernetes': 'Kubernetes is an open-source container orchestration platform that automates many of the manual processes involved in deploying, managing, and scaling containerized applications.',
    'Jest': 'Jest is a delightful JavaScript Testing Framework with a focus on simplicity.',
    'GraphQL': 'GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data.',
    'Supabase': 'Supabase is an open source Firebase alternative providing all the backend features you need to build a product.',
    'Prisma': 'Prisma is a next-generation ORM that helps developers build faster and make fewer errors with an intuitive data model, automated migrations, type-safety & auto-completion.',
  };

  return descriptions[techName] || `${techName} is a powerful technology used in modern web development.`;
}