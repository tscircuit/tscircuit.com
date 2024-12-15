import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useImportSnippetDialog } from "./dialogs/import-snippet-dialog"
import { useToast } from "@/hooks/use-toast"
import { FootprintDialog } from "./FootprintDialog"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { AlertTriangle } from "lucide-react"

export type FileName = "index.tsx" | "manual-edits.json"

interface CodeEditorHeaderProps {
  currentFile: FileName
  files: Record<FileName, string>
  handleFileChange: (filename: FileName) => void
  updateFileContent: (filename: FileName, content: string) => void
  cursorPosition: number | null
}

export const CodeEditorHeader = ({
  currentFile,
  files,
  handleFileChange,
  updateFileContent,
  cursorPosition,
}: CodeEditorHeaderProps) => {
  const { Dialog: ImportSnippetDialog, openDialog: openImportDialog } =
    useImportSnippetDialog()
  const [footprintDialogOpen, setFootprintDialogOpen] = useState(false)
  const { toast } = useToast()

  // Check if manual-edits.json has any content
  const [hasManualEdits, setHasManualEdits] = useState(false)

  useEffect(() => {
    setHasManualEdits(files["manual-edits.json"].length > 0)
  }, [files["manual-edits.json"]])

  const formatCurrentFile = () => {
    if (!window.prettier || !window.prettierPlugins) return

    try {
      const currentContent = files[currentFile]

      if (currentFile.endsWith(".json")) {
        try {
          const jsonObj = JSON.parse(currentContent)
          const formattedJson = JSON.stringify(jsonObj, null, 2)
          updateFileContent(currentFile, formattedJson)
        } catch (jsonError) {
          throw new Error("Invalid JSON content")
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
  }

  const importRegex =
    /import\s+(?:\*\s+as\s+)?([a-zA-Z_$][\w$]*)\s+from\s+["']\.\/manual-edits\.json["'];?/
  const hasManualEditsImported = importRegex.test(files["index.tsx"])
  const ShowErrorDropdown = hasManualEdits && !hasManualEditsImported

  const handleManualEditsImport = () => {
    try {
      let currentContent = files["index.tsx"]
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

      modifiedContent = modifiedContent.replace(
        groupSubcircuitRegex,
        (match) =>
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
        {ShowErrorDropdown && (
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
                Manual edits exist but have not been imported.
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
              Footprint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button size="sm" variant="ghost" onClick={() => openImportDialog()}>
          Import
        </Button>
        <Button size="sm" variant="ghost" onClick={formatCurrentFile}>
          Format
        </Button>
      </div>
      <ImportSnippetDialog
        onSnippetSelected={(snippet) => {
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
