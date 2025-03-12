import React from "react";
import { Search, X } from "lucide-react";
import { Technology } from "../types";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTechs: Technology[];
  onTechToggle: (tech: Technology) => void;
  availableTechs: Technology[];
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  selectedTechs,
  onTechToggle,
  availableTechs,
}: SearchBarProps) {
  return (
    <div className="space-y-4 mb-8">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />

        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Selected Filters */}
      {selectedTechs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 py-1">Filters:</span>
          {selectedTechs.map((tech) => (
            <button
              key={`${tech.name}-selected`}
              onClick={() => onTechToggle(tech)}
              className={`${tech.color} px-3 py-1 rounded-full text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity`}
            >
              {tech.icon && <tech.icon size={16} />}
              {tech.name}
              <X size={14} />
            </button>
          ))}
        </div>
      )}

      {/* Available Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 py-1">Add filters:</span>
        {availableTechs
          .filter(
            (tech) =>
              !selectedTechs.some((selected) => selected.name === tech.name),
          )
          .map((tech) => (
            <button
              key={tech.name}
              onClick={() => onTechToggle(tech)}
              className={`${tech.color} px-3 py-1 rounded-full text-sm flex items-center gap-1.5 hover:opacity-90 transition-opacity opacity-60 hover:opacity-100`}
            >
              {tech.icon && <tech.icon size={16} />}
              {tech.name}
            </button>
          ))}
      </div>
    </div>
  );
}
