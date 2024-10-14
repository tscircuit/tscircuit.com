// Prettier is injected into the global scope inside index.html
declare global {
  interface Window {
    prettier: {
      format: (code: string, options: any) => string
    }
    prettierPlugins: any
  }
}
