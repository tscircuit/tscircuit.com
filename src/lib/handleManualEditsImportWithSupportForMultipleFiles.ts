import { FileName } from "@/components/package-port/CodeEditorHeader"

export const handleManualEditsImportWithSupportForMultipleFiles = (
  files: Record<string, string>,
  updateFileContent: (filename: FileName, content: string) => void,
  entrypointFileName: FileName = "index.tsx",
  toast: (options: {
    title: string
    description: string
    variant?: "default" | "destructive"
  }) => void,
) => {
  console.log(
    "handleManualEditsImportWithSupportForMultipleFiles",
    entrypointFileName,
  )
  try {
    let currentContent = files[entrypointFileName]
    const importRegex =
      /import\s+(?:\*\s+as\s+)?([a-zA-Z_$][\w$]*)\s+from\s+["']\.\/manual-edits\.json["'];?/
    const match = importRegex.exec(currentContent)
    const importVariableName = match ? match[1] : "manualEdits"

    if (!match) {
      currentContent = `import ${importVariableName} from "./manual-edits.json";\n${currentContent}`
    }

    const boardRegex = /<board\b[^>]*>/gi
    const groupSubcircuitRegex = /<group\b[^>]*\bsubcircuit\b[^>]*>/gi

    let modifiedContent = currentContent.replace(boardRegex, (match) =>
      match.includes(`manualEdits={${importVariableName}}`)
        ? match
        : match.replace(">", ` manualEdits={${importVariableName}}>`),
    )

    modifiedContent = modifiedContent.replace(groupSubcircuitRegex, (match) =>
      match.includes(`manualEdits={${importVariableName}}`)
        ? match
        : match.replace(">", ` manualEdits={${importVariableName}}>`),
    )

    if (modifiedContent === currentContent) {
      toast({
        title: "No Manual Edits Applied",
        description:
          "No applicable <board> or <group subcircuit> tags were found to apply manual edits.",
        variant: "destructive",
      })
      return
    }

    updateFileContent("index.tsx", modifiedContent)

    toast({
      title: "Manual Edits Imported",
      description: "Successfully imported and applied manual edits.",
      variant: "default",
    })
  } catch (error) {
    console.log(error)
    toast({
      title: "Import Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to import manual edits. Please check the file and apply manually.",
      variant: "destructive",
    })
  }
}
