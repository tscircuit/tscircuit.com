import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "@/lib/utils"
import { createUseDialog } from "./create-use-dialog"
import { useSnippet } from "@/hooks/use-snippet"

interface FilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  snippetId: string
}

export const FilesDialog: React.FC<FilesDialogProps> = ({
  open,
  onOpenChange,
  snippetId,
}) => {
  const { data: snippet } = useSnippet(snippetId)

  const files = {
    "dist/index.d.ts": snippet?.dts || "",
    "index.ts": snippet?.code || "",
    "dist/index.js": snippet?.compiled_js || "",
  }

  const [selectedFile, setSelectedFile] = useState<string | null>("index.ts")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Files</DialogTitle>
        </DialogHeader>
        <div className="flex flex-grow overflow-hidden">
          <div className="w-1/4 border-r">
            <ScrollArea className="h-full">
              {Object.keys(files).map((filePath) => (
                <div
                  key={filePath}
                  className={cn(
                    "px-4 py-2 cursor-pointer hover:bg-gray-100",
                    selectedFile === filePath && "bg-gray-200",
                  )}
                  onClick={() => setSelectedFile(filePath)}
                >
                  {filePath}
                </div>
              ))}
            </ScrollArea>
          </div>
          <div className="w-3/4 overflow-hidden">
            <ScrollArea className="h-full">
              <pre className="p-4 text-sm">
                {selectedFile ? files[selectedFile] : "Select a file"}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useFilesDialog = createUseDialog(FilesDialog)
