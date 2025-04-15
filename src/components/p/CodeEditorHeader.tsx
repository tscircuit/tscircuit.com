import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useImportSnippetDialog } from "@/components/dialogs/import-snippet-dialog"
import { useToast } from "@/hooks/use-toast"
import { FootprintDialog } from "@/components/p/FootprintDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle } from "lucide-react"
import { checkIfManualEditsImported } from "@/lib/utils/checkIfManualEditsImported"

export type FileName = string

interface CodeEditorHeaderProps {
  currentFile: FileName
  files: Record<FileName, string>
  handleFileChange: (filename: FileName) => void
  updateFileContent: (filename: FileName, content: string) => void
  cursorPosition: number | null
}

export const CodeEditorHeader: React.FC<CodeEditorHeaderProps> = ({
  currentFile,
  files,
  handleFileChange,
  updateFileContent,
  cursorPosition,
}) => {
  const { Dialog: ImportSnippetDialog, openDialog: openImportDialog } =
    useImportSnippetDialog()
  const [footprintDialogOpen, setFootprintDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleFormatFile = useCallback(() => {
    if (!window.prettier || !window.prettierPlugins) return

    try {
      const currentContent = files[currentFile]

      if (currentFile.endsWith(".json")) {
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
          return
        }
        return
      }

      const formattedCode = window.prettier.format(currentContent, {
        semi: false,
        parser: "typescript",
        plugins: window.prettierPlugins,
      })

      updateFileContent(currentFile, formattedCode)
    } catch (error) {
      console.error("Formatting error:", error)
      toast({
        title: "Formatting error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to format the code. Please check for syntax errors.",
        variant: "destructive",
      })
    }
  }, [currentFile, files, toast, updateFileContent])

  const handleManualEditsImport = useCallback(() => {
    // Implement the logic to import manual edits from manual-edits.json
    // This will likely involve reading the file content and applying the edits to index.tsx
    // Since I don't have the actual implementation of handleManualEditsImport, I'll leave a placeholder here.

    if (!files["manual-edits.json"]) {
      toast({
        title: "Error",
        description: "manual-edits.json not found.",
        variant: "destructive",
      })
      return
    }

    const manualEditsContent = files["manual-edits.json"]

    // Find the target file.  If index.tsx doesn't exist, use the first .tsx file
    let targetFile = files["index.tsx"]
      ? "index.tsx"
      : Object.keys(files).find((filename) => filename.endsWith(".tsx"))
    if (!targetFile) {
      toast({
        title: "Error",
        description: "No target .tsx file found to apply manual edits to.",
        variant: "destructive",
      })
      return
    }

    const targetFileContent = files[targetFile]
    const manualEditsLines = manualEditsContent.split("\n")
    const targetFileLines = targetFileContent.split("\n")
    const mergedContent: string[] = []

    let editsApplied = 0

    manualEditsLines.forEach((editLine) => {
      const matchingIndex = targetFileLines.findIndex(
        (targetLine) => targetLine.trim() === editLine.trim(),
      )

      if (matchingIndex !== -1) {
        // Replace the line in the target file with the edit line
        mergedContent.push(editLine)
        targetFileLines.splice(matchingIndex, 1) // Remove the matched line
        editsApplied++
      } else {
        // Add the edit line to the merged content
        mergedContent.push(editLine)
      }
    })

    // Add any remaining lines from the target file to the merged content
    mergedContent.push(...targetFileLines)

    updateFileContent(targetFile, mergedContent.join("\n"))

    toast({
      title: "Manual Edits Imported",
      description: `Successfully imported ${editsApplied} manual edits into ${targetFile}`,
    })
  }, [files, toast, updateFileContent])

  return (
    <div className="flex items-center gap-2 px-2 border-b border-gray-200">
      <div>
        <Select value={currentFile} onValueChange={handleFileChange}>
          <SelectTrigger className="h-7 px-3 bg-white">
            <SelectValue placeholder="Select file" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(files).map((filename) => (
              <SelectItem className="py-1" key={filename} value={filename}>
                <span className="text-xs pr-1">{filename}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 px-2 py-1 ml-auto">
        {checkIfManualEditsImported(files) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 hover:bg-red-50"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Error
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={handleManualEditsImport}
              >
                Manual edits exist but have not been imported. (Click to fix)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost">
              Insert
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFootprintDialogOpen(true)}>
              Chip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="ghost" onClick={() => openImportDialog()}>
          Import
        </Button>
        <Button size="sm" variant="ghost" onClick={handleFormatFile}>
          Format
        </Button>
      </div>
      <ImportSnippetDialog
        onSnippetSelected={(snippet: any) => {
          const newContent = `import {} from "@tsci/${snippet.owner_name}.${snippet.unscoped_name}"\n${files[currentFile]}`
          updateFileContent(currentFile, newContent)
        }}
      />
      <FootprintDialog
        currentFile={currentFile}
        open={footprintDialogOpen}
        onOpenChange={setFootprintDialogOpen}
        updateFileContent={updateFileContent}
        files={files}
        cursorPosition={cursorPosition}
      />
    </div>
  )
}

export default CodeEditorHeader
