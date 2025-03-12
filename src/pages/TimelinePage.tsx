import React, { useEffect, useState } from "react";
import { Timeline } from "../components/Timeline";
import { SearchBar } from "../components/SearchBar";
import { Technology } from "../types";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

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

export function TimelinePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<Technology[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
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
            technologies (*)
          ),
          application:applications (
            id,
            name
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(
        data.map((project) => ({
          ...project,
          technologies: project.project_technologies.map(
            (pt: any) => pt.technologies,
          ),
          application: project.application,
        })),
      );
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  // Get all unique technologies from projects
  const availableTechs = React.useMemo(() => {
    const techMap = new Map<string, Technology>();
    projects.forEach((project) => {
      project.technologies.forEach((tech) => {
        if (!techMap.has(tech.name)) {
          techMap.set(tech.name, tech);
        }
      });
    });
    return Array.from(techMap.values());
  }, [projects]);

  const handleTechToggle = (tech: Technology) => {
    setSelectedTechs((prev) =>
      prev.some((t) => t.name === tech.name)
        ? prev.filter((t) => t.name !== tech.name)
        : [...prev, tech],
    );
  };

  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some((tech) =>
          tech.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesTechs =
        selectedTechs.length === 0 ||
        selectedTechs.every((selectedTech) =>
          project.technologies.some((tech) => tech.name === selectedTech.name),
        );

      return matchesSearch && matchesTechs;
    });
  }, [searchTerm, selectedTechs, projects]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Project Timeline
      </h1>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedTechs={selectedTechs}
        onTechToggle={handleTechToggle}
        availableTechs={availableTechs}
      />

      {filteredProjects.length > 0 ? (
        <Timeline projects={filteredProjects} />
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No projects found. Try adjusting your filters or add some projects!
        </div>
      )}
    </div>
  );
}
