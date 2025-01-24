import { Project } from '../types';
import { technologies } from './technologies';

// Helper function to find technology by name
const getTech = (name: string) => technologies.find(t => t.name === name)!;

export const projects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with real-time inventory management and payment processing.',
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1600',
    technologies: [
      getTech('React'),
      getTech('TypeScript'),
      getTech('Node.js'),
      getTech('PostgreSQL'),
      getTech('Redux'),
      getTech('Docker'),
    ],
    githubUrl: 'https://github.com/username/ecommerce',
    liveUrl: 'https://ecommerce-demo.com'
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates and team features.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1600',
    technologies: [
      getTech('Next.js'),
      getTech('TypeScript'),
      getTech('Prisma'),
      getTech('TailwindCSS'),
      getTech('Supabase'),
      getTech('Jest'),
    ],
    githubUrl: 'https://github.com/username/task-app'
  }
];