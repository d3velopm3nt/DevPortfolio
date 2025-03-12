import express from 'express';
import { captureWebsiteThumbnail } from '../services/screenshotService';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/thumbnail', async (req, res) => {
  try {
    console.log('Generating thumbnail...');
    const { projectId, websiteUrl } = req.body;
    
    if (!projectId || !websiteUrl) {
      return res.status(400).json({ error: 'Project ID and website URL are required' });
    }
    
    // Authenticate the request
    const { data: { user } } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1]);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Verify the user has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }
    
    // Generate and upload thumbnail
    const thumbnailUrl = await captureWebsiteThumbnail(websiteUrl, projectId);
    
    // Update project with thumbnail URL
    const { error: updateError } = await supabase
      .from('projects')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('id', projectId);
    
    if (updateError) {
      return res.status(500).json({ error: 'Failed to update project with thumbnail URL' });
    }
    
    return res.json({ thumbnailUrl });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return res.status(500).json({ error: 'Failed to generate thumbnail' });
  }
});

export default router; 