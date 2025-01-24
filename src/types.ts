export interface Technology {
  name: string;
  type: 'language' | 'framework' | 'library' | 'tool';
  color: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  technologies: Technology[];
  githubUrl?: string;
  liveUrl?: string;
}