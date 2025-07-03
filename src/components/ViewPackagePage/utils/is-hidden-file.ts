export const isHiddenFile = (filePath: string): boolean => {
  if (filePath.startsWith("/")) {
    filePath = filePath.slice(1)
  }

  // Normalize the path to handle both Unix and Windows paths
  const normalizedPath = filePath.replace(/\\/g, "/")

  // Common patterns for files to hide
  const hiddenPatterns = [
    // Lock files
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
    /\.pnpm-store/,
    /bun\.lockb/,
    /bun\.lock/,

    // Generated directories
    /^dist\//,
    /^build\//,
    /^out\//,
    /^\.next\//,
    /^\.nuxt\//,
    /^\.output\//,

    // Config files
    /\.env(\.[^/]*)?$/,
    /\.eslintrc(\.[^/]*)?$/,
    /\.prettierrc(\.[^/]*)?$/,
    /\.babelrc$/,
    /tsconfig\.json$/,
    /jest\.config\.[^/]*$/,
    /vite\.config\.[^/]*$/,
    /next\.config\.[^/]*$/,
    /webpack\.config\.[^/]*$/,
    /rollup\.config\.[^/]*$/,

    // Cache and temp directories
    /^\.cache\//,
    /^node_modules\//,
    /^\.git\//,
    /^\.github\//,
    /^\.husky\//,
    /^\.vscode\//,
    /^\.idea\//,

    // Misc
    /\.DS_Store$/,
    /Thumbs\.db$/,
    /\.log$/,
  ]

  return hiddenPatterns.some((pattern) => pattern.test(normalizedPath))
}
