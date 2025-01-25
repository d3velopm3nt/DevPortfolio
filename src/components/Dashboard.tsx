import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Package, 
  Sparkles,
  AppWindow,
  Monitor,
  Layout,
  Plus
} from 'lucide-react';
import { Technology, Platform } from '../types';
import { techCategories } from '../data/techCategories';
import { supabase } from '../lib/supabase';
import { AddProjectModal } from './AddProjectModal';

interface DashboardStats {
  projectCount: number;
  applicationCount: number;
  techCount: number;
  platformCount: number;
  techStackCount: number;
}

interface TechStack {
  id: string;
  name: string;
  description: string;
  category: string;
  technologies: Technology[];
  projectCount: number;
}

export function Dashboard() {
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    projectCount: 0,
    applicationCount: 0,
    techCount: 0,
    platformCount: 0,
    techStackCount: 0
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          project_technologies (
            technologies (*)
          ),
          project_platforms (
            platform:platforms (*)
          ),
          project_tech_stacks (
            tech_stack:tech_stacks (
              *,
              tech_stack_technologies (
                technologies (*)
              )
            )
          )
        `)
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      // Get applications count
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', user.id);

      if (appsError) throw appsError;

      // Extract unique technologies from projects
      const techMap = new Map<string, Technology>();
      projects.forEach(project => {
        project.project_technologies.forEach((pt: any) => {
          const tech = pt.technologies;
          if (!techMap.has(tech.id)) {
            techMap.set(tech.id, tech);
          }
        });
      });

      // Extract unique platforms from projects
      const platformMap = new Map<string, Platform>();
      projects.forEach(project => {
        project.project_platforms.forEach((pp: any) => {
          const platform = pp.platform;
          if (!platformMap.has(platform.id)) {
            platformMap.set(platform.id, platform);
          }
        });
      });

      // Extract and count tech stacks from projects
      const techStackMap = new Map<string, TechStack>();
      projects.forEach(project => {
        project.project_tech_stacks.forEach((pts: any) => {
          const stack = pts.tech_stack;
          if (!techStackMap.has(stack.id)) {
            techStackMap.set(stack.id, {
              ...stack,
              technologies: stack.tech_stack_technologies.map((t: any) => t.technologies),
              projectCount: 1
            });
          } else {
            const existing = techStackMap.get(stack.id)!;
            techStackMap.set(stack.id, {
              ...existing,
              projectCount: existing.projectCount + 1
            });
          }
        });
      });

      setStats({
        projectCount: projects.length,
        applicationCount: applications.length,
        techCount: techMap.size,
        platformCount: platformMap.size,
        techStackCount: techStackMap.size
      });

      setPlatforms(Array.from(platformMap.values()));
      setTechnologies(Array.from(techMap.values()));
      setTechStacks(Array.from(techStackMap.values()));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Group technologies by category
  const techsByCategory = React.useMemo(() => {
    const grouped = technologies.reduce((acc, tech) => {
      if (!acc[tech.type]) {
        acc[tech.type] = [];
      }
      acc[tech.type].push(tech);
      return acc;
    }, {} as Record<string, Technology[]>);
    return grouped;
  }, [technologies]);

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
              Your Development Portfolio
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              A comprehensive view of your projects, applications, and technical expertise.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                <Package className="w-5 h-5" />
                Add New Project
              </button>
              <Link
                to="/applications"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              >
                <AppWindow className="w-5 h-5" />
                View Applications
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Projects', value: stats.projectCount, icon: Package, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Applications', value: stats.applicationCount, icon: AppWindow, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Technologies', value: stats.techCount, icon: Code2, color: 'text-green-600 dark:text-green-400' },
          { label: 'Platforms', value: stats.platformCount, icon: Monitor, color: 'text-orange-600 dark:text-orange-400' },
          { label: 'Tech Stacks', value: stats.techStackCount, icon: Layout, color: 'text-pink-600 dark:text-pink-400' }
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

      {/* Tech Stacks */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400">
              <Layout className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Tech Stacks
            </h2>
          </div>
          <Link
            to="/settings/tech-stacks/new"
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Plus className="w-4 h-4" />
            Add Stack
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStacks.map((stack) => (
            <div
              key={stack.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {stack.name}
                </h3>
                <span className="px-2 py-0.5 text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
                  {stack.projectCount} {stack.projectCount === 1 ? 'project' : 'projects'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {stack.technologies.map((tech) => (
                  <div
                    key={tech.id}
                    className={`${tech.color} inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs`}
                  >
                    {tech.icon && <tech.icon size={12} />}
                    {tech.name}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stack.category}
              </div>
            </div>
          ))}
          {techStacks.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No tech stacks used in your projects yet
            </div>
          )}
        </div>
      </div>

      {/* Platforms */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
            <Monitor className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Platforms
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {platform.name}
              </div>
            </div>
          ))}
          {platforms.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No platforms used in your projects yet
            </div>
          )}
        </div>
      </div>

      {/* Technology Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techCategories.map((category) => {
          const categoryTechs = techsByCategory[category.id] || [];
          return (
            <div key={`category-${category.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.title}
                </h2>
                <div className="ml-auto px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                  {categoryTechs.length}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryTechs.map((tech) => (
                  <Link
                    key={`${category.id}-${tech.name}`}
                    to={`/technology/${encodeURIComponent(tech.name)}`}
                    className={`${tech.color} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-transform hover:scale-105`}
                  >
                    {tech.icon && <tech.icon size={16} />}
                    {tech.name}
                  </Link>
                ))}
                {categoryTechs.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No technologies used in your projects yet
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onProjectAdded={() => {
          fetchDashboardData();
          setIsAddProjectModalOpen(false);
        }}
      />
    </div>
  );
}