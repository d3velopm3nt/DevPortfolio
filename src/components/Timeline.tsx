import React from "react";
import { Project } from "../types";
import { ProjectCard } from "./ProjectCard";
import { Calendar } from "lucide-react";

interface TimelineProps {
  projects: Project[];
}

export function Timeline({ projects }: TimelineProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-0 md:left-1/2 h-full w-0.5 bg-gray-200 transform -translate-x-1/2" />

      {projects.map((project, index) => (
        <div
          key={project.id}
          className={`mb-24 flex flex-col ${
            index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          } gap-16 relative`}
        >
          {/* Timeline dot */}
          <div className="absolute left-0 md:left-1/2 w-4 h-4 bg-indigo-600 rounded-full transform -translate-x-1/2 z-10" />

          {/* Date marker */}
          <div
            className={`absolute left-6 md:left-1/2 ${
              index % 2 === 0
                ? "md:translate-x-8"
                : "md:-translate-x-[calc(100%+2rem)]"
            } flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap`}
          >
            <Calendar size={16} />
            <span>Q{Math.floor(Math.random() * 4) + 1} 2023</span>
          </div>

          {/* Project card wrapper */}
          <div
            className={`w-full md:w-[calc(50%-4rem)] ${
              index % 2 === 0 ? "md:text-right" : "md:text-left"
            } mt-8`}
          >
            <ProjectCard project={project} />
          </div>
        </div>
      ))}
    </div>
  );
}
