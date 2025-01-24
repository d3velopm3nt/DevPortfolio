/*
  # Insert Technologies

  1. Changes
    - Insert all available technologies into the technologies table
    - Each technology has a unique ID and properties matching our frontend data
*/

-- Insert technologies
INSERT INTO technologies (name, type, color)
VALUES
  -- Languages
  ('TypeScript', 'language', 'bg-[#3178C6] text-white'),
  ('JavaScript', 'language', 'bg-[#F7DF1E] text-black'),
  ('Python', 'language', 'bg-[#3776AB] text-white'),
  ('Java', 'language', 'bg-[#007396] text-white'),
  ('Rust', 'language', 'bg-[#000000] text-white'),
  ('Go', 'language', 'bg-[#00ADD8] text-white'),

  -- Frontend Frameworks
  ('React', 'frontend', 'bg-[#61DAFB] text-black'),
  ('Next.js', 'frontend', 'bg-black text-white'),
  ('Vue', 'frontend', 'bg-[#4FC08D] text-white'),
  ('Angular', 'frontend', 'bg-[#DD0031] text-white'),
  ('Svelte', 'frontend', 'bg-[#FF3E00] text-white'),
  ('TailwindCSS', 'frontend', 'bg-[#06B6D4] text-white'),

  -- Backend
  ('Node.js', 'backend', 'bg-[#339933] text-white'),
  ('Express', 'backend', 'bg-[#000000] text-white'),
  ('NestJS', 'backend', 'bg-[#E0234E] text-white'),
  ('FastAPI', 'backend', 'bg-[#009688] text-white'),
  ('Spring', 'backend', 'bg-[#6DB33F] text-white'),
  ('GraphQL', 'backend', 'bg-[#E10098] text-white'),

  -- State Management
  ('Redux', 'state', 'bg-[#764ABC] text-white'),
  ('Zustand', 'state', 'bg-[#764ABC] text-white'),

  -- Authentication
  ('Supabase Auth', 'auth', 'bg-[#3ECF8E] text-white'),
  ('Firebase Auth', 'auth', 'bg-[#FFCA28] text-black'),
  ('Auth0', 'auth', 'bg-[#EB5424] text-white'),

  -- Database
  ('PostgreSQL', 'database', 'bg-[#336791] text-white'),
  ('MongoDB', 'database', 'bg-[#47A248] text-white'),
  ('Redis', 'database', 'bg-[#DC382D] text-white'),
  ('Supabase', 'database', 'bg-[#3ECF8E] text-white'),
  ('Prisma', 'database', 'bg-[#2D3748] text-white'),

  -- Visualization
  ('D3.js', 'visualization', 'bg-[#F9A03C] text-white'),
  ('Three.js', 'visualization', 'bg-[#000000] text-white'),
  ('Chart.js', 'visualization', 'bg-[#FF6384] text-white'),

  -- Deployment
  ('Docker', 'deployment', 'bg-[#2496ED] text-white'),
  ('Kubernetes', 'deployment', 'bg-[#326CE5] text-white'),

  -- Testing
  ('Jest', 'testing', 'bg-[#C21325] text-white'),
  ('Cypress', 'testing', 'bg-[#17202C] text-white'),

  -- Interactive Features
  ('Webpack', 'interactive', 'bg-[#8DD6F9] text-black'),
  ('Vite', 'interactive', 'bg-[#646CFF] text-white')
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  color = EXCLUDED.color;