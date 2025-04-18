import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { handleManualEditsImport } from "@/lib/handleManualEditsImport"
import { useImportSnippetDialog } from "@/components/dialogs/import-snippet-dialog"
import { useToast } from "@/hooks/use-toast"
import { FootprintDialog } from "@/components/FootprintDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle, PanelRightClose } from "lucide-react"
import { checkIfManualEditsImported } from "@/lib/utils/checkIfManualEditsImported"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"

export type FileName = string

interface CodeEditorHeaderProps {
  currentFile: FileName
  files: Record<FileName, string>
  updateFileContent: (filename: FileName, content: string) => void
  cursorPosition: number | null
  fileSidebarState: ReturnType<typeof useState<boolean>>
  handleFileChange: (filename: FileName) => void
}

export const CodeEditorHeader: React.FC<CodeEditorHeaderProps> = ({
  currentFile,
  files,
  updateFileContent,
  cursorPosition,
  fileSidebarState,
  handleFileChange,
}) => {
  const { Dialog: ImportSnippetDialog, openDialog: openImportDialog } =
    useImportSnippetDialog()
  const [footprintDialogOpen, setFootprintDialogOpen] = useState(false)
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
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

  return (
    <>
      <div className="flex items-center gap-2 px-2 border-b border-gray-200">
        <button
          className={`text-gray-400 scale-90 transition-opacity duration-200 ${sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          onClick={() => setSidebarOpen(true)}
        >
          <PanelRightClose />
        </button>
        <div>
          <Select value={currentFile} onValueChange={handleFileChange}>
            <SelectTrigger className="h-7 px-3 bg-white">
              <SelectValue placeholder="Select file" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(files)
                .filter((filename) => !isHiddenFile(filename))
                .map((filename) => (
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
          currentFile={currentFile as `${string}.${string}`}
          open={footprintDialogOpen}
          onOpenChange={setFootprintDialogOpen}
          updateFileContent={updateFileContent}
          files={files}
          cursorPosition={cursorPosition}
        />
      </div>
    </>
  )
}

export default CodeEditorHeader
