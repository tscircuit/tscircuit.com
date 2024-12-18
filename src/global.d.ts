import ts from "typescript"
import * as Babel from "@babel/standalone"

// Prettier,Typescript,Babel is injected into the global scope inside index.html
declare global {
  interface Window {
    prettier: {
      format: (code: string, options: any) => string
    }
    prettierPlugins: any

    ts: ts
    Babel: Babel
  }
}
