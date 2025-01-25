/*
  # Seed Tech Feed Data

  1. Resources
    - Adds sample resources like libraries, frameworks and tools
  2. Tech Feed Posts
    - Creates example posts of different types (article, tutorial, news, resource)
    - Links posts with technologies and resources
  3. Info Blocks
    - Adds rich content blocks to posts with various types of content
*/

-- Insert resources
INSERT INTO resources (id, name, type, description, website_url, github_url, documentation_url) VALUES
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'React Query', 'library', 'Powerful data synchronization for React applications', 'https://tanstack.com/query', 'https://github.com/tanstack/query', 'https://tanstack.com/query/latest/docs/react/overview'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Next.js', 'framework', 'The React framework for production', 'https://nextjs.org', 'https://github.com/vercel/next.js', 'https://nextjs.org/docs'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Vite', 'tool', 'Next generation frontend tooling', 'https://vitejs.dev', 'https://github.com/vitejs/vite', 'https://vitejs.dev/guide/');

-- Link resources with technologies
INSERT INTO resource_technologies (resource_id, technology_id)
SELECT 
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  id
FROM technologies 
WHERE name IN ('React', 'TypeScript');

INSERT INTO resource_technologies (resource_id, technology_id)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  id
FROM technologies 
WHERE name IN ('React', 'TypeScript', 'Node.js');

INSERT INTO resource_technologies (resource_id, technology_id)
SELECT 
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid,
  id
FROM technologies 
WHERE name IN ('TypeScript', 'Node.js');

-- Insert tech feed posts
WITH first_user AS (
  SELECT id FROM profiles LIMIT 1
)
INSERT INTO tech_feed_posts (id, user_id, title, content, type, resource_id, created_at) VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    (SELECT id FROM first_user),
    'Building Modern React Apps with TypeScript and Vite',
    'Learn how to set up a new React project using Vite and TypeScript, with best practices for type safety and performance.',
    'tutorial',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid,
    NOW() - INTERVAL '2 days'
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid,
    (SELECT id FROM first_user),
    'Introducing React Query v5',
    'Exciting new features and improvements in the latest version of React Query, including better TypeScript support and reduced bundle size.',
    'news',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    NOW() - INTERVAL '1 day'
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid,
    (SELECT id FROM first_user),
    'Next.js App Router: A Deep Dive',
    'An in-depth exploration of the new App Router in Next.js 13+, covering file-system based routing, layouts, and server components.',
    'article',
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    NOW()
  );

-- Link posts with technologies
INSERT INTO tech_feed_post_technologies (post_id, technology_id)
SELECT 
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
  id
FROM technologies 
WHERE name IN ('React', 'TypeScript', 'Vite');

INSERT INTO tech_feed_post_technologies (post_id, technology_id)
SELECT 
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid,
  id
FROM technologies 
WHERE name IN ('React', 'TypeScript');

INSERT INTO tech_feed_post_technologies (post_id, technology_id)
SELECT 
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid,
  id
FROM technologies 
WHERE name IN ('React', 'TypeScript', 'Next.js');

-- Add info blocks and items to posts
INSERT INTO tech_feed_post_info_blocks (id, post_id, title, description, type, order_index) VALUES
  -- Tutorial post blocks
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Project Setup',
    'Setting up a new Vite project with React and TypeScript',
    'code',
    0
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Configuration',
    'Configuring TypeScript and ESLint',
    'code',
    1
  ),
  -- News post blocks
  (
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'::uuid,
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid,
    'Key Features',
    'Overview of new features in React Query v5',
    'text',
    0
  ),
  (
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'::uuid,
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid,
    'Migration Guide',
    'Steps to upgrade from v4 to v5',
    'link',
    1
  ),
  -- Article post blocks
  (
    'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a18'::uuid,
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid,
    'Understanding the App Router',
    'Key concepts of the new routing system',
    'text',
    0
  ),
  (
    'f3eebc99-9c0b-4ef8-bb6d-6bb9bd380a19'::uuid,
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::uuid,
    'Example Implementation',
    'Real-world example of App Router usage',
    'code',
    1
  );

-- Add items to blocks
INSERT INTO tech_feed_post_info_items (id, block_id, type, content, order_index) VALUES
  -- Tutorial post items
  (
    'f4eebc99-9c0b-4ef8-bb6d-6bb9bd380a20'::uuid,
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid,
    'code',
    'npm create vite@latest my-react-app -- --template react-ts',
    0
  ),
  (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a21'::uuid,
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::uuid,
    'text',
    'This command creates a new Vite project with React and TypeScript template.',
    1
  ),
  (
    'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::uuid,
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15'::uuid,
    'code',
    '// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}',
    0
  ),
  -- News post items
  (
    'f7eebc99-9c0b-4ef8-bb6d-6bb9bd380a23'::uuid,
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'::uuid,
    'text',
    '• Improved TypeScript support with better type inference\n• Smaller bundle size through code optimization\n• New suspense features for better loading states\n• Enhanced devtools for debugging',
    0
  ),
  (
    'f8eebc99-9c0b-4ef8-bb6d-6bb9bd380a24'::uuid,
    'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a17'::uuid,
    'link',
    'https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5',
    0
  ),
  -- Article post items
  (
    'f9eebc99-9c0b-4ef8-bb6d-6bb9bd380a25'::uuid,
    'f2eebc99-9c0b-4ef8-bb6d-6bb9bd380a18'::uuid,
    'text',
    'The App Router introduces a new paradigm for building React applications with Next.js. It leverages React Server Components by default and provides a more intuitive way to handle layouts, loading states, and error boundaries.',
    0
  ),
  (
    'faeebc99-9c0b-4ef8-bb6d-6bb9bd380a26'::uuid,
    'f3eebc99-9c0b-4ef8-bb6d-6bb9bd380a19'::uuid,
    'code',
    '// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// app/page.tsx
export default async function Home() {
  const data = await getData()
  return <main>{/* Your content */}</main>
}',
    0
  );