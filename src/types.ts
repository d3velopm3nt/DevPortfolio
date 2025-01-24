import { CropIcon as IconProps } from 'lucide-react';

export interface Technology {
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
}

export interface TechStackCategory {
  id: TechStackSection;
  title: string;
  description: string;
  color: string;
  icon: React.ComponentType<IconProps>;
}