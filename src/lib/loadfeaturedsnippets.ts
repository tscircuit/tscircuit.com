import * as ts from "typescript"
import { CodeRunner } from "@tscircuit/prompt-benchmarks"

// Define the type for a snippet
interface Snippet {
  name: string
  code: string
  types: string
}

// Function to run a snippet using CodeRunner
async function runSnippet(snippetCode: string) {
  const runner = new CodeRunner()
  try {
    const result = await runner.run(snippetCode)
    console.log("Snippet Output:", result)
    return result
  } catch (error) {
    console.error("Error running snippet:", error)
    return null
  }
}

export async function loadFeaturedSnippets(): Promise<Snippet[]> {
  try {
    const { snippetsVfs }: { snippetsVfs: { [key: string]: string } } =
      await import("@tscircuit/featured-snippets")

    console.log("Snippets VFS:", snippetsVfs)

    const snippets: Snippet[] = []

    for (const [name, code] of Object.entries(snippetsVfs)) {
      if (typeof code !== "string") {
        console.warn(`Snippet ${name} does not have a valid code property.`)
        continue
      }

      // Run the snippet code
      const output = await runSnippet(code)
      console.log(`Output for ${name}:`, output)

      snippets.push({ name, code, types: "javascript" }) // Adjust types as necessary
    }

    console.log("Loaded Snippets:", snippets)
    return snippets
  } catch (error) {
    console.error("Error loading featured snippets:", error)
    return []
  }
}
