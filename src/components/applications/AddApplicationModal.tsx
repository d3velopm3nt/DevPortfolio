import React, { useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Technology } from '../../types';
import { techCategories } from '../../data/techCategories';
import { technologies } from '../../data/technologies';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationAdded: () => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
  technologies: Technology[];
}

export function AddApplicationModal({ isOpen, onClose, onApplicationAdded }: AddApplicationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'application' | 'project'>('application');
  const [projectData, setProjectData] = useState<ProjectFormData>({
    title: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    technologies: []
  });
  const [techStep, setTechStep] = useState(techCategories[0].id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 'application') {
      setCurrentStep('project');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create application
      const { data: app, error: appError } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          name,
          description,
          github_url: githubUrl,
          live_url: liveUrl
        }])
        .select()
        .single();

      if (appError) throw appError;

      // Create initial project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          application_id: app.id,
          title: projectData.title,
          description: projectData.description,
          github_url: projectData.githubUrl,
          live_url: projectData.liveUrl
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      // Add technologies to project
      if (projectData.technologies.length > 0) {
        const { error: techError } = await supabase
          .from('project_technologies')
          .insert(
            projectData.technologies.map(tech => ({
              project_id: project.id,
              technology_id: tech.id
            }))
          );

        if (techError) throw techError;
      }

      onApplicationAdded();
      onClose();
    } catch (err) {
      console.error('Error adding application:', err);
      setError('Failed to create application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTechToggle = (tech: Technology) => {
    setProjectData(prev => ({
      ...prev,
      technologies: prev.technologies.some(t => t.name === tech.name)
        ? prev.technologies.filter(t => t.name !== tech.name)
        : [...prev.technologies, tech]
    }));
  };

  const handleClose = () => {
    setCurrentStep('application');
    setName('');
    setDescription('');
    setGithubUrl('');
    setLiveUrl('');
    setProjectData({
      title: '',
      description: '',
      githubUrl: '',
      liveUrl: '',
      technologies: []
    });
    onClose();
  };

  if (!isOpen) return null;

  const currentCategory = techCategories.find(cat => cat.id === techStep)!;
  const availableTechs = technologies.filter(tech => tech.type === techStep);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentStep === 'application' ? 'Add Application' : 'Add Initial Project'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep === 'application' ? '1' : '2'} of 2
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 'application' ? (
              // Application Form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Live URL
                    </label>
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Project Form
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={projectData.title}
                      onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={projectData.description}
                      onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={projectData.githubUrl}
                        onChange={(e) => setProjectData({ ...projectData, githubUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Live URL
                      </label>
                      <input
                        type="url"
                        value={projectData.liveUrl}
                        onChange={(e) => setProjectData({ ...projectData, liveUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tech Stack</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {techCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setTechStep(category.id)}
                        className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                          techStep === category.id
                            ? category.color
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <category.icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{category.title}</span>
                      </button>
                    ))}
                  </div>

                  <div className={`p-6 rounded-xl ${currentCategory.color}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <currentCategory.icon className="w-6 h-6" />
                      <div>
                        <h4 className="font-semibold">{currentCategory.title}</h4>
                        <p className="text-sm opacity-80">{currentCategory.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {availableTechs.map((tech) => (
                        <button
                          key={tech.name}
                          type="button"
                          onClick={() => handleTechToggle(tech)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                            projectData.technologies.some(t => t.name === tech.name)
                              ? 'bg-white/20'
                              : 'bg-white/10 hover:bg-white/15'
                          }`}
                        >
                          {projectData.technologies.some(t => t.name === tech.name) ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          {tech.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              {currentStep === 'project' && (
                <button
                  type="button"
                  onClick={() => setCurrentStep('application')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
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
                    Creating...
                  </>
                ) : currentStep === 'application' ? (
                  'Next'
                ) : (
                  'Create Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}