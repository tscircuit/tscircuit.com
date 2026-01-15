import { ToasterToast } from "@/hooks/use-toast"
import { PackageFile } from "@/types/package"

export function handleFormatFile({
  files,
  currentFile,
  updateFileContent,
  toast,
}: {
  files: PackageFile[]
  currentFile: string | null
  updateFileContent: (path: string, content: string) => void
  toast: (toastData: ToasterToast) => string
}) {
  if (!window.prettier || !window.prettierPlugins) return
  if (!currentFile) return

  const currentFileObj = files.find((f) => f.path === currentFile)
  const currentContent = currentFileObj?.content

  if (!currentContent || currentContent.trim().length === 0) {
    toast({
      title: "Empty file",
      description: "Cannot format an empty file.",
    })
    return
  }

  let fileExtension = currentFile.split(".").pop()?.toLowerCase()

  if (!fileExtension || fileExtension === currentFile.toLowerCase()) {
    if (["readme"].includes(currentFile.toLowerCase())) {
      fileExtension = "md"
    } else {
      toast({
        title: "Cannot determine file type",
        description: "Unable to format file without an extension.",
      })
      return
    }
  }

  // Handle JSON formatting separately
  if (fileExtension === "json") {
    try {
      const jsonObj = JSON.parse(currentContent)
      const formattedJson = JSON.stringify(jsonObj, null, 2)
      updateFileContent(currentFile, formattedJson)
    } catch (jsonError) {
      toast({
        title: "Invalid JSON",
        description: "Failed to format JSON: invalid syntax.",
        variant: "destructive",
      })
    }
    return
  }

  const parserMap: Record<string, string> = {
    js: "babel",
    jsx: "babel",
    ts: "typescript",
    tsx: "typescript",
    md: "markdown",
    markdown: "markdown",
  }

  const parser = parserMap[fileExtension] || "tsx"

  try {
    const formattedCode = window.prettier.format(currentContent, {
      semi: false,
      parser: parser,
      plugins: window.prettierPlugins,
    })

    updateFileContent(currentFile, formattedCode)
  } catch (error) {
    console.error("Formatting error:", error)
    if (
      error instanceof Error &&
      error.message.includes("No parser could be inferred")
    ) {
      toast({
        title: "Unsupported File Type",
        description: `Formatting not supported for .${fileExtension} files. Tried default parser.`,
      })
    } else {
      toast({
        title: "Formatting error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to format the code. Please check for syntax errors.",
        variant: "destructive",
      })
    }
  }
}
