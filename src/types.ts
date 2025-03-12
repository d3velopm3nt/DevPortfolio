import { CropIcon as IconProps } from 'lucide-react';

export interface Technology {
  id: Key | null | undefined;
  name: string;
  type: TechStackSection;
  color: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
}

export type TechStackSection = 
  | 'language'
  | 'frontend'
  | 'backend'
  | 'state'
  | 'auth'
  | 'database'
  | 'visualization'
  | 'deployment'
  | 'interactive'
  | 'testing';

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: Technology[];
  githubUrl?: string;
  liveUrl?: string;
  application?: {
    id: string;
    name: string;
  };
  platforms?: ProjectPlatform[];
}

export interface Platform {
  id: string;
  name: string;
  description: string;
  icon_name?: string;
}

export interface OperatingSystem {
  id: string;
  platform_id: string;
  name: string;
  version: string;
}

export interface ProjectPlatform {
  id: string;
  project_id: string;
  platform_id: string;
  operating_system_id: string;
  platform: Platform;
  operating_system: OperatingSystem;
}

export interface TechStackCategory {
  id: TechStackSection;
  title: string;
  description: string;
  color: string;
  icon: React.ComponentType<IconProps>;
}