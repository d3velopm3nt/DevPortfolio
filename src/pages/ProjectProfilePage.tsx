import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Github,
  ExternalLink,
  Edit,
  Trash2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { ProjectCard } from "../components/ProjectCard";
import { EditProjectModal } from "../components/EditProjectModal";
import { useGitHubAuth } from "../hooks/useGitHubAuth";

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
  github_repositories?: {
    id: string;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    language: string;
  }[];
}

export function ProjectProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isConnected, providerToken } = useGitHubAuth();
  const [showRepoModal, setShowRepoModal] = useState(false);

  const fetchProject = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          project_technologies (
            technologies (
              name,
              type,
              color
            )
          ),
          github_repositories (
            id,
            name,
            full_name,
            description,
            html_url,
            language
          )
        `,
        )
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setProject({
        ...data,
        technologies: data.project_technologies.map(
          (pt: any) => pt.technologies,
        ),
        github_repositories: data.github_repositories,
      });
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      navigate("/projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
        {error || "Project not found"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Edit className="w-5 h-5" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      {/* Project Card */}
      <ProjectCard project={project} showViewMore={false} />

      {/* Edit Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProjectUpdated={() => {
          fetchProject();
          setIsEditModalOpen(false);
        }}
        projectId={project.id}
      />

      {/* GitHub Repositories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Github className="w-6 h-6" />
            GitHub Repositories
          </h2>
          {isConnected && (
            <button
              onClick={() => setShowRepoModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              <Plus className="w-4 h-4" />
              Link Repository
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project?.github_repositories?.map((repo) => (
            <div
              key={repo.id}
              className="border dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {repo.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/github/repositories/${repo.id}`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    View Details
                  </a>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
              {repo.language && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {repo.language}
                </div>
              )}
            </div>
          ))}

          {(!project?.github_repositories ||
            project.github_repositories.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No repositories linked to this project yet.
            </div>
          )}
        </div>
      </div>

      {/* Repository Link Modal */}
      {showRepoModal && (
        <RepositoryLinkModal
          projectId={project?.id}
          onClose={() => setShowRepoModal(false)}
          onLink={fetchProject}
        />
      )}
    </div>
  );
}

function RepositoryLinkModal({
  projectId,
  onClose,
  onLink,
}: {
  projectId: string;
  onClose: () => void;
  onLink: () => void;
}) {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    isConnected,
    isLoading: isAuthLoading,
    providerToken,
  } = useGitHubAuth();

  useEffect(() => {
    if (!isAuthLoading && isConnected && providerToken) {
      fetchAvailableRepositories();
    }
  }, [isAuthLoading, isConnected, providerToken]);

  const fetchAvailableRepositories = async () => {
    try {
      if (!providerToken) {
        throw new Error("GitHub token not found");
      }

      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100",
        {
          headers: {
            Authorization: `token ${providerToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "GitHub authentication failed. Please reconnect your GitHub account.",
          );
        }
        throw new Error(`Failed to fetch repositories: ${response.status}`);
      }

      const repos = await response.json();
      setRepositories(repos);
      setError(null);
    } catch (err) {
      console.error("Error fetching repositories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load repositories",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkRepository = async (repo: any) => {
    try {
      const { error: repoError } = await supabase
        .from("github_repositories")
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          github_id: repo.id,
          project_id: projectId,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          topics: repo.topics,
          is_private: repo.private,
        });

      if (repoError) throw repoError;
      onLink();
      onClose();
    } catch (err) {
      setError("Failed to link repository");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Link GitHub Repository
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="flex items-start justify-between p-4 border dark:border-gray-700 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {repo.description}
                  </p>
                </div>
                <button
                  onClick={() => handleLinkRepository(repo)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                >
                  Link
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
