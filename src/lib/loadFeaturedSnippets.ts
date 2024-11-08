import * as ts from "typescript";

export async function loadFeaturedSnippets() {
  try {
    const snippetsModule = await import("@tscircuit/featured-snippets");
    const snippets = [];

    for (const [name, snippet] of Object.entries(snippetsModule)) {
      if (!snippet.code) {
        console.warn(`Snippet ${name} does not have a code property.`);
        continue;
      }

      // Create a TypeScript program
      const sourceFile = ts.createSourceFile(
        name,
        snippet.code,
        ts.ScriptTarget.ESNext,
        true
      );

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
                code: snippet.code,
                types: content,
                ...snippet,
              });
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
      });

      // Emit the declaration file
      program.emit();
    }

    return snippets;
  } catch (error) {
    console.error("Error loading featured snippets:", error);
    return [];
  }
}
