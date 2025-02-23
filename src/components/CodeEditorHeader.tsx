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
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { AlertTriangle } from "lucide-react"
import { checkIfManualEditsImported } from "@/lib/utils/checkIfManualEditsImported"
import { handleManualEditsImport } from "@/lib/handleManualEditsImport"
import { formatCode } from "@/lib/utils/formatCurrentFile"

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

  const formatCurrentFile = () => {
    const formattedContent = formatCode({
      currentFile,
      currentContent: files[currentFile],
    })
    if (formattedContent) {
      updateFileContent(currentFile, formattedContent)
    } else {
      toast({
        title: "Formatting error",
        description:
          "Failed to format the code. Please check for syntax errors.",
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
                onClick={() =>
                  handleManualEditsImport(files, updateFileContent, toast)
                }
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
