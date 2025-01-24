import { Project } from '../types';
import {
  ReactOriginal,
  TypescriptOriginal,
  NodejsOriginal,
  PostgresqlOriginal,
  NextjsOriginal,
  PrismaOriginal,
  TailwindcssPlain,
  StripeOriginal,
} from 'devicons-react';

export const projects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with real-time inventory management and payment processing.',
    imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1600',
    technologies: [
      { 
        name: 'React',
        type: 'framework',
        color: 'bg-[#61DAFB] text-black',
        icon: ReactOriginal
      },
      { 
        name: 'TypeScript',
        type: 'language',
        color: 'bg-[#3178C6] text-white',
        icon: TypescriptOriginal
      },
      { 
        name: 'Node.js',
        type: 'language',
        color: 'bg-[#339933] text-white',
        icon: NodejsOriginal
      },
      { 
        name: 'PostgreSQL',
        type: 'tool',
        color: 'bg-[#336791] text-white',
        icon: PostgresqlOriginal
      },
      { 
        name: 'Stripe',
        type: 'library',
        color: 'bg-[#635BFF] text-white',
        icon: StripeOriginal
      },
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
      { 
        name: 'Next.js',
        type: 'framework',
        color: 'bg-black text-white',
        icon: NextjsOriginal
      },
      { 
        name: 'TypeScript',
        type: 'language',
        color: 'bg-[#3178C6] text-white',
        icon: TypescriptOriginal
      },
      { 
        name: 'Prisma',
        type: 'tool',
        color: 'bg-[#2D3748] text-white',
        icon: PrismaOriginal
      },
      { 
        name: 'TailwindCSS',
        type: 'framework',
        color: 'bg-[#06B6D4] text-white',
        icon: TailwindcssPlain
      },
    ],
    githubUrl: 'https://github.com/username/task-app'
  }
];