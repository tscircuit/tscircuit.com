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

interface CodeEditorHeaderProps {
  currentFile: string
  files: Record<string, string>
  handleFileChange: (filename: string) => void
  updateFileContent: (filename: string, content: string) => void
}

export const CodeEditorHeader = ({
  currentFile,
  files,
  handleFileChange,
  updateFileContent,
}: CodeEditorHeaderProps) => {
  const { Dialog: ImportSnippetDialog, openDialog: openImportDialog } =
    useImportSnippetDialog()
  const { toast } = useToast()

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
    </div>
  )
}

export default CodeEditorHeader
