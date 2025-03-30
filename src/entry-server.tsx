import React from "react"
import ReactDOMServer from "react-dom/server"
import { HelmetProvider, HelmetServerState } from 'react-helmet-async'
import App from "./App"
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Function to inject helmet data into HTML
const injectHelmetData = (html: string, helmet: HelmetServerState) => {
  if (!helmet) return html;

  // Get all helmet pieces
  const { title, meta, link, script } = helmet;

  // Find the head closing tag
  const headClosingTagPosition = html.indexOf('</head>');
  
  if (headClosingTagPosition === -1) return html;

  // Inject all helmet content right before the head closing tag
  return html.slice(0, headClosingTagPosition) +
    (title?.toString() || '') +
    (meta?.toString() || '') +
    (link?.toString() || '') +
    (script?.toString() || '') +
    html.slice(headClosingTagPosition);
};

export function render() {
  const helmetContext = {} as { helmet: HelmetServerState }
  
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <App />
      </HelmetProvider>
    </React.StrictMode>,
  )
  
  return { 
    html,
    helmet: helmetContext.helmet
  }
}

// For vercel integration
export async function renderPage(
  url: string,
  template: string
): Promise<string> {
  // Render the app
  const { html, helmet } = render();
  
  // If we're on a route like /author/snippetName, use SSR to inject the meta tags
  if (url.match(/\/[^\/]+\/[^\/]+$/)) {
    // Replace the root div with our rendered HTML
    const renderedHTML = template.replace(
      '<div id="root" class="loaderanimation" style="visibility: hidden;"></div>',
      `<div id="root" class="loaderanimation" style="visibility: hidden;">${html}</div>`
    );
    
    // Inject helmet data
    return injectHelmetData(renderedHTML, helmet);
  }
  
  // For other routes, just replace the root div
  return template.replace(
    '<div id="root" class="loaderanimation" style="visibility: hidden;"></div>',
    `<div id="root" class="loaderanimation" style="visibility: hidden;">${html}</div>`
  );
}