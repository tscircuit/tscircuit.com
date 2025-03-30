// Vercel Edge Function for dynamic route SSR with meta tags

import { renderPage } from '../src/entry-server';
import fs from 'fs';
import path from 'path';

// Cache the template HTML for better performance
let templateHTML = null;

export default async function handler(req, res) {
  try {
    // Load the template HTML if not already loaded
    if (!templateHTML) {
      const htmlPath = path.join(process.cwd(), 'index.html');
      templateHTML = fs.readFileSync(htmlPath, 'utf-8');
    }

    // Get the URL path from the request
    const url = req.url || '';
    
    // Check if this is a dynamic route that needs proper meta tags
    // This regex matches patterns like /author/snippetName
    if (url.match(/\/[^\/]+\/[^\/]+$/)) {
      // Render the page with dynamic meta tags
      const html = await renderPage(url, templateHTML);
      
      // Return the rendered HTML
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }
    
    // For other routes, continue with normal processing
    return res.nextMiddleware();
  } catch (error) {
    console.error('Error rendering page:', error);
    return res.status(500).send('Server Error');
  }
}

export const config = {
  // This configures the function to run at the edge
  runtime: 'edge',
  // Only run this for dynamic routes that need meta tags
  matcher: ['/:author/:snippetName*'],
};