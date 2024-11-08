import * as ts from "typescript"

// Define the type for a snippet
interface Snippet {
  name: string
  code: string
  types: string
  // Add other properties as needed
}

// Define the expected structure of the imported module
interface SnippetModule {
  [key: string]: string // Assuming each key maps to a string of code
}

export async function loadFeaturedSnippets(): Promise<Snippet[]> {
  try {
    const { snippetsVfs }: { snippetsVfs: { [key: string]: string } } =
      await import("@tscircuit/featured-snippets")
    const snippets: Snippet[] = []

    for (const [name, code] of Object.entries(snippetsVfs)) {
      if (typeof code !== "string") {
        console.warn(`Snippet ${name} does not have a valid code property.`)
        continue
      }

      // Create a TypeScript program
      const sourceFile = ts.createSourceFile(
        name,
        code,
        ts.ScriptTarget.ESNext,
        true,
      )

      const program = ts.createProgram({
        rootNames: [name],
        options: {
          declaration: true,
          emitDeclarationOnly: true,
          module: ts.ModuleKind.CommonJS,
        },
        host: {
          getSourceFile: (fileName) =>
            fileName === name ? sourceFile : undefined,
          writeFile: (fileName, content) => {
            if (fileName.endsWith(".d.ts")) {
              snippets.push({
                name,
                code,
                types: content,
              })
            }
          },
          getDefaultLibFileName: () => "lib.d.ts",
          useCaseSensitiveFileNames: () => true,
          getCanonicalFileName: (fileName) => fileName,
          getCurrentDirectory: () => "",
          getNewLine: () => "\n",
          fileExists: (fileName) => fileName === name,
          readFile: () => undefined,
          directoryExists: () => true,
          getDirectories: () => [],
        },
      })

      // Emit the declaration file
      program.emit()
    }

    return snippets
  } catch (error) {
    console.error("Error loading featured snippets:", error)
    return []
  }
}
