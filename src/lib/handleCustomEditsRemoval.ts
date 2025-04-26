import { FileName } from "@/components/package-port/CodeEditorHeader"

export const handleCustomEditsRemoval = (
  files: Record<string, string>,
  updateFileContent: (filename: FileName, content: string) => void,
  toast: (options: {
    title: string
    description: string
    variant?: "default" | "destructive"
  }) => void,
  entrypointFileName: FileName = "index.tsx",
  isSchematicWarning: boolean = false,
) => {
  try {
    let currentContent = files[entrypointFileName]
    const componentRegex = /<[a-zA-Z][^>]*>/g

    // Remove coordinates based on warning type
    let modifiedContent = currentContent.replace(componentRegex, (match) => {
      if (isSchematicWarning) {
        return match
          .replace(/\s+schX=\{[\s\S]*?\}/g, "")
          .replace(/\s+schY=\{[\s\S]*?\}/g, "")
      } else {
        return match
          .replace(/\s+pcbX=\{[\s\S]*?\}/g, "")
          .replace(/\s+pcbY=\{[\s\S]*?\}/g, "")
      }
    })

    if (modifiedContent === currentContent) {
      toast({
        title: "No Changes Made",
        description: "No components found with coordinates to remove.",
        variant: "destructive",
      })
      return
    }

    updateFileContent(entrypointFileName, modifiedContent)

    toast({
      title: isSchematicWarning
        ? "Schematic Coordinates Removed"
        : "PCB Coordinates Removed",
      description: `Successfully removed ${isSchematicWarning ? "schematic" : "PCB"} coordinates from components.`,
      variant: "default",
    })
  } catch (error) {
    toast({
      title: "Removal Error",
      description:
        error instanceof Error
          ? error.message
          : "Failed to remove custom coordinates. Please check the file and remove manually.",
      variant: "destructive",
    })
  }
}
