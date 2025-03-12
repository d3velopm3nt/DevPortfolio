-- Allow authenticated users to upload thumbnails
CREATE POLICY "Allow authenticated users to upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = 'project-thumbnails'
);

-- Allow anyone to view thumbnails
CREATE POLICY "Allow public access to thumbnails"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = 'project-thumbnails'
);

-- Allow users to update their own project thumbnails
CREATE POLICY "Allow users to update their own project thumbnails"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = 'project-thumbnails'
);

-- Allow users to delete their own project thumbnails
CREATE POLICY "Allow users to delete their own project thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'projects' AND
  (storage.foldername(name))[1] = 'project-thumbnails'
); 