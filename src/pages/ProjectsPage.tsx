import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Search, Loader2, AppWindow, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProjectCard } from '../components/ProjectCard';
import { AddProjectModal } from '../components/AddProjectModal';

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  created_at: string;
  technologies: Array<{
    name: string;
    type: string;
    color: string;
  }>;
  application?: {
    id: string;
    name: string;
  };
}

interface Application {
  id: string;
  name: string;
  description: string;
}

export function ProjectsPage() {
  const { id: applicationId } = useParams<{ id: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch application details if we have an applicationId
      if (applicationId) {
        const { data: appData, error: appError } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (appError) throw appError;
        setApplication(appData);
      }

      // Build the query for projects
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_technologies (
            technologies (
              name,
              type,
              color
            )
          ),
          application:applications (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      // If we have an applicationId, filter by it
      if (applicationId) {
        query = query.eq('application_id', applicationId);
      }

      const { data: projectsData, error: projectsError } = await query;

      if (projectsError) throw projectsError;

      setProjects(projectsData.map(project => ({
        ...project,
        technologies: project.project_technologies.map((pt: any) => pt.technologies),
        application: project.application
      })));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.technologies.some(tech => 
      tech.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        {applicationId ? (
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Applications
          </Link>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              {application ? <AppWindow className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {application ? application.name : 'Projects'}
              </h1>
              {application && (
                <p className="text-gray-600 dark:text-gray-400">
                  {application.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
          {filteredProjects.length === 0 && !isLoading && (
            <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
              No projects found. Start by adding a new project!
            </div>
          )}
        </div>
      )}

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProjectAdded={() => {
          fetchData();
          setIsAddModalOpen(false);
        }}
        applicationId={applicationId}
      />
    </div>
  );
}