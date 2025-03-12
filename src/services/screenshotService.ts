import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY as string;

// Create Supabase client with service role key for admin access to storage
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function captureWebsiteThumbnail(url: string, projectId: string): Promise<string> {
  if (!url) {
    throw new Error('URL is required to capture thumbnail');
  }
  
  // Create a temporary file path
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'thumbnail-'));
  const screenshotPath = path.join(tempDir, 'screenshot.png');
  const thumbnailPath = path.join(tempDir, 'thumbnail.jpg');
  
  try {
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    // Navigate to the URL with timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Take screenshot
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();
    
    // Resize and optimize the image
    await sharp(screenshotPath)
      .resize(640, 400)
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    // Upload to Supabase storage
    const fileBuffer = await fs.readFile(thumbnailPath);
    const fileName = `project-thumbnails/${projectId}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('projects')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Failed to upload thumbnail: ${error.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('projects')
      .getPublicUrl(fileName);
    
    // Clean up temp files
    await fs.rm(tempDir, { recursive: true, force: true });
    
    return urlData.publicUrl;
  } catch (error) {
    // Clean up temp files even if there's an error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('Failed to clean up temp files:', cleanupError);
    }
    
    throw error;
  }
} 