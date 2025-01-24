import {
  ReactOriginal,
  TypescriptOriginal,
  JavascriptOriginal,
  PythonOriginal,
  JavaOriginal,
  RustOriginal,
  GoOriginal,
  NodejsOriginal,
  NextjsOriginal,
  VueOriginal,
  AngularjsOriginal,
  SvelteOriginal,
  ExpressOriginal,
  NestjsOriginal,
  FastapiOriginal,
  SpringOriginal,
  ReduxOriginal,
  ZustandOriginal,
  PostgresqlOriginal,
  MongodbOriginal,
  RedisOriginal,
  SupabaseOriginal,
  FirebaseOriginal,
  Auth0Original,
  GraphqlOriginal,
  D3jsOriginal,
  ThreejsOriginal,
  ChartjsOriginal,
  DockerOriginal,
  KubernetesOriginal,
  JestOriginal,
  CypressOriginal,
  WebpackOriginal,
  VitejsOriginal,
  TailwindcssPlain,
  PrismaOriginal,
} from 'devicons-react';
import { Technology } from '../types';

export const technologies: Technology[] = [
  // Languages
  {
    name: 'TypeScript',
    type: 'language',
    color: 'bg-[#3178C6] text-white',
    icon: TypescriptOriginal
  },
  {
    name: 'JavaScript',
    type: 'language',
    color: 'bg-[#F7DF1E] text-black',
    icon: JavascriptOriginal
  },
  {
    name: 'Python',
    type: 'language',
    color: 'bg-[#3776AB] text-white',
    icon: PythonOriginal
  },
  {
    name: 'Java',
    type: 'language',
    color: 'bg-[#007396] text-white',
    icon: JavaOriginal
  },
  {
    name: 'Rust',
    type: 'language',
    color: 'bg-[#000000] text-white',
    icon: RustOriginal
  },
  {
    name: 'Go',
    type: 'language',
    color: 'bg-[#00ADD8] text-white',
    icon: GoOriginal
  },

  // Frontend Frameworks
  {
    name: 'React',
    type: 'frontend',
    color: 'bg-[#61DAFB] text-black',
    icon: ReactOriginal
  },
  {
    name: 'Next.js',
    type: 'frontend',
    color: 'bg-black text-white',
    icon: NextjsOriginal
  },
  {
    name: 'Vue',
    type: 'frontend',
    color: 'bg-[#4FC08D] text-white',
    icon: VueOriginal
  },
  {
    name: 'Angular',
    type: 'frontend',
    color: 'bg-[#DD0031] text-white',
    icon: AngularjsOriginal
  },
  {
    name: 'Svelte',
    type: 'frontend',
    color: 'bg-[#FF3E00] text-white',
    icon: SvelteOriginal
  },
  {
    name: 'TailwindCSS',
    type: 'frontend',
    color: 'bg-[#06B6D4] text-white',
    icon: TailwindcssPlain
  },

  // Backend
  {
    name: 'Node.js',
    type: 'backend',
    color: 'bg-[#339933] text-white',
    icon: NodejsOriginal
  },
  {
    name: 'Express',
    type: 'backend',
    color: 'bg-[#000000] text-white',
    icon: ExpressOriginal
  },
  {
    name: 'NestJS',
    type: 'backend',
    color: 'bg-[#E0234E] text-white',
    icon: NestjsOriginal
  },
  {
    name: 'FastAPI',
    type: 'backend',
    color: 'bg-[#009688] text-white',
    icon: FastapiOriginal
  },
  {
    name: 'Spring',
    type: 'backend',
    color: 'bg-[#6DB33F] text-white',
    icon: SpringOriginal
  },
  {
    name: 'GraphQL',
    type: 'backend',
    color: 'bg-[#E10098] text-white',
    icon: GraphqlOriginal
  },

  // State Management
  {
    name: 'Redux',
    type: 'state',
    color: 'bg-[#764ABC] text-white',
    icon: ReduxOriginal
  },
  {
    name: 'Zustand',
    type: 'state',
    color: 'bg-[#764ABC] text-white',
    icon: ZustandOriginal
  },

  // Authentication
  {
    name: 'Supabase Auth',
    type: 'auth',
    color: 'bg-[#3ECF8E] text-white',
    icon: SupabaseOriginal
  },
  {
    name: 'Firebase Auth',
    type: 'auth',
    color: 'bg-[#FFCA28] text-black',
    icon: FirebaseOriginal
  },
  {
    name: 'Auth0',
    type: 'auth',
    color: 'bg-[#EB5424] text-white',
    icon: Auth0Original
  },

  // Database
  {
    name: 'PostgreSQL',
    type: 'database',
    color: 'bg-[#336791] text-white',
    icon: PostgresqlOriginal
  },
  {
    name: 'MongoDB',
    type: 'database',
    color: 'bg-[#47A248] text-white',
    icon: MongodbOriginal
  },
  {
    name: 'Redis',
    type: 'database',
    color: 'bg-[#DC382D] text-white',
    icon: RedisOriginal
  },
  {
    name: 'Supabase',
    type: 'database',
    color: 'bg-[#3ECF8E] text-white',
    icon: SupabaseOriginal
  },
  {
    name: 'Prisma',
    type: 'database',
    color: 'bg-[#2D3748] text-white',
    icon: PrismaOriginal
  },

  // Visualization
  {
    name: 'D3.js',
    type: 'visualization',
    color: 'bg-[#F9A03C] text-white',
    icon: D3jsOriginal
  },
  {
    name: 'Three.js',
    type: 'visualization',
    color: 'bg-[#000000] text-white',
    icon: ThreejsOriginal
  },
  {
    name: 'Chart.js',
    type: 'visualization',
    color: 'bg-[#FF6384] text-white',
    icon: ChartjsOriginal
  },

  // Deployment & Version Control
  {
    name: 'Docker',
    type: 'deployment',
    color: 'bg-[#2496ED] text-white',
    icon: DockerOriginal
  },
  {
    name: 'Kubernetes',
    type: 'deployment',
    color: 'bg-[#326CE5] text-white',
    icon: KubernetesOriginal
  },

  // Testing
  {
    name: 'Jest',
    type: 'testing',
    color: 'bg-[#C21325] text-white',
    icon: JestOriginal
  },
  {
    name: 'Cypress',
    type: 'testing',
    color: 'bg-[#17202C] text-white',
    icon: CypressOriginal
  },

  // Interactive Features
  {
    name: 'Webpack',
    type: 'interactive',
    color: 'bg-[#8DD6F9] text-black',
    icon: WebpackOriginal
  },
  {
    name: 'Vite',
    type: 'interactive',
    color: 'bg-[#646CFF] text-white',
    icon: VitejsOriginal
  }
];