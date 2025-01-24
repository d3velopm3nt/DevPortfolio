import {
  Code2,
  Layout,
  Server,
  Database,
  Lock,
  BarChart2,
  Boxes,
  GitBranch,
  Sparkles,
  TestTube2
} from 'lucide-react';
import { TechStackCategory } from '../types';

export const techCategories: TechStackCategory[] = [
  {
    id: 'language',
    title: 'Languages',
    description: 'Core programming languages that power your applications',
    color: 'bg-blue-500/10 text-blue-600',
    icon: Code2
  },
  {
    id: 'frontend',
    title: 'Frontend Frameworks',
    description: 'Modern frameworks for building responsive user interfaces',
    color: 'bg-purple-500/10 text-purple-600',
    icon: Layout
  },
  {
    id: 'backend',
    title: 'Backend',
    description: 'Server-side technologies and APIs',
    color: 'bg-green-500/10 text-green-600',
    icon: Server
  },
  {
    id: 'state',
    title: 'State Management',
    description: 'Tools for managing application state and data flow',
    color: 'bg-yellow-500/10 text-yellow-600',
    icon: Boxes
  },
  {
    id: 'auth',
    title: 'Authentication',
    description: 'Security and user authentication solutions',
    color: 'bg-red-500/10 text-red-600',
    icon: Lock
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Data storage and management solutions',
    color: 'bg-indigo-500/10 text-indigo-600',
    icon: Database
  },
  {
    id: 'visualization',
    title: 'Visualization Tools',
    description: 'Libraries for data visualization and graphics',
    color: 'bg-pink-500/10 text-pink-600',
    icon: BarChart2
  },
  {
    id: 'deployment',
    title: 'Deployment & Version Control',
    description: 'Tools for deploying and managing code',
    color: 'bg-gray-500/10 text-gray-600',
    icon: GitBranch
  },
  {
    id: 'interactive',
    title: 'Interactive Features',
    description: 'Enhanced user interaction and experience',
    color: 'bg-orange-500/10 text-orange-600',
    icon: Sparkles
  },
  {
    id: 'testing',
    title: 'Performance & Testing',
    description: 'Tools for testing and optimizing applications',
    color: 'bg-teal-500/10 text-teal-600',
    icon: TestTube2
  }
];