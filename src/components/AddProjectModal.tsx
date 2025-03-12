import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Technology, TechStackSection, ProjectPlatform } from "../types";
import { techCategories } from "../data/techCategories";
import { supabase } from "../lib/supabase";
import { technologies } from "../data/technologies";
import { PlatformSelector } from "./projects/PlatformSelector";
import { requestThumbnailGeneration } from "../services/thumbnailService";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
  applicationId?: string;
}

interface Application {
  id: string;
  name: string;
}

export function AddProjectModal({
  isOpen,
  onClose,
  onProjectAdded,
  applicationId,
}: AddProjectModalProps) {
  const [currentStep, setCurrentStep] = useState<
    "details" | "tech" | "platforms"
  >("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<Technology[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<ProjectPlatform[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | undefined
  >(applicationId);
  const [expandedCategories, setExpandedCategories] = useState<
    TechStackSection[]
  >(["language"]);

  useEffect(() => {
    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen]);

  const fetchApplications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === "details") {
      setCurrentStep("tech");
      return;
    }
    if (currentStep === "tech") {
      setCurrentStep("platforms");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            user_id: user.id,
            application_id: selectedApplicationId,
            title,
            description,
            github_url: githubUrl,
            live_url: liveUrl,
          },
        ])
        .select()
        .single();

      if (projectError) throw projectError;

      // Add technologies - only if there are selected technologies
      if (selectedTechs.length > 0) {
        const techInserts = selectedTechs
          .filter((tech) => tech.id) // Ensure we only include techs with IDs
          .map((tech) => ({
            project_id: project.id,
            technology_id: tech.id,
          }));

        if (techInserts.length > 0) {
          const { error: techError } = await supabase
            .from("project_technologies")
            .insert(techInserts);

          if (techError) throw techError;
        }
      }

      // Add platforms - only if there are selected platforms
      if (selectedPlatforms.length > 0) {
        const platformInserts = selectedPlatforms.map((platform) => ({
          project_id: project.id,
          platform_id: platform.platform_id,
          operating_system_id: platform.operating_system_id,
        }));

        const { error: platformError } = await supabase
          .from("project_platforms")
          .insert(platformInserts);

        if (platformError) throw platformError;
      }

      // Generate thumbnail if live URL is provided
      if (liveUrl) {
        // Don't await this - let it happen in the background
        requestThumbnailGeneration(project.id, liveUrl)
          .then(thumbnailUrl => {
            console.log("Thumbnail generated:", thumbnailUrl);
          })
          .catch(err => {
            console.error("Error during thumbnail generation:", err);
          });
      }

      onProjectAdded();
      onClose();
    } catch (err) {
      console.error("Error adding project:", err);
      setError("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTechToggle = (tech: Technology) => {
    setSelectedTechs((prev) =>
      prev.some((t) => t.name === tech.name)
        ? prev.filter((t) => t.name !== tech.name)
        : [...prev, tech],
    );
  };

  const handleClose = () => {
    setCurrentStep("details");
    setTitle("");
    setDescription("");
    setGithubUrl("");
    setLiveUrl("");
    setSelectedTechs([]);
    setSelectedPlatforms([]);
    setExpandedCategories(["language"]);
    onClose();
  };

  const toggleCategory = (categoryId: TechStackSection) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add New Project
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step{" "}
                {currentStep === "details"
                  ? "1"
                  : currentStep === "tech"
                    ? "2"
                    : "3"}{" "}
                of 3
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
            {currentStep === "details" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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

                {applications.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Application (Optional)
                    </label>
                    <select
                      value={selectedApplicationId || ""}
                      onChange={(e) =>
                        setSelectedApplicationId(e.target.value || undefined)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">No Application</option>
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
            )}

            {currentStep === "tech" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tech Stack
                </h3>

                <div className="space-y-2">
                  {techCategories.map((category) => {
                    const categoryTechs = technologies.filter(
                      (tech) => tech.type === category.id,
                    );
                    const isExpanded = expandedCategories.includes(category.id);
                    const selectedCount = selectedTechs.filter(
                      (tech) => tech.type === category.id,
                    ).length;

                    return (
                      <div
                        key={category.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`w-full flex items-center justify-between p-4 ${
                            isExpanded
                              ? "border-b border-gray-200 dark:border-gray-700"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.color}`}>
                              <category.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {category.title}
                                {selectedCount > 0 && (
                                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    ({selectedCount} selected)
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {category.description}
                              </p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-4 flex flex-wrap gap-2">
                            {categoryTechs.map((tech) => (
                              <button
                                key={tech.name}
                                type="button"
                                onClick={() => handleTechToggle(tech)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                                  selectedTechs.some(
                                    (t) => t.name === tech.name,
                                  )
                                    ? tech.color
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                              >
                                {selectedTechs.some(
                                  (t) => t.name === tech.name,
                                ) ? (
                                  <X className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                                {tech.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === "platforms" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Platforms & Operating Systems
                </h3>
                <PlatformSelector
                  projectId={null}
                  selectedPlatforms={selectedPlatforms}
                  onPlatformsChange={setSelectedPlatforms}
                />
              </div>
            )}

            <div className="flex justify-end gap-4">
              {currentStep !== "details" && (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep(
                      currentStep === "platforms" ? "tech" : "details",
                    )
                  }
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
                ) : currentStep === "platforms" ? (
                  "Create Project"
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
