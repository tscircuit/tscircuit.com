import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "@/lib/utils"
import { createUseDialog } from "./create-use-dialog"
import { Button } from "../ui/button"
import { Download } from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface ViewTsFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

declare global {
  interface Window {
    __DEBUG_CODE_EDITOR_FS_MAP: Map<string, string>
  }
}

export const ViewTsFilesDialog: React.FC<ViewTsFilesDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [files, setFiles] = useState<Map<string, string>>(new Map())
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  useEffect(() => {
    if (open && window.__DEBUG_CODE_EDITOR_FS_MAP) {
      setFiles(window.__DEBUG_CODE_EDITOR_FS_MAP)
      if (window.__DEBUG_CODE_EDITOR_FS_MAP.size > 0) {
        setSelectedFile(Array.from(window.__DEBUG_CODE_EDITOR_FS_MAP.keys())[0])
      }
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>TypeScript Files</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const zip = new JSZip()
              files.forEach((content, filename) => {
                zip.file(filename, content)
              })
              const blob = await zip.generateAsync({ type: "blob" })
              saveAs(blob, "typescript-files.zip")
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </DialogHeader>
        <div className="flex flex-grow overflow-hidden">
          <div className="w-1/4 border-r">
            <ScrollArea className="h-full">
              {Array.from(files.keys()).map((filePath) => (
                <div
                  key={filePath}
                  className={cn(
                    "px-4 py-2 cursor-pointer hover:bg-gray-100 text-xs break-all",
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
              <pre className="p-4 text-xs whitespace-pre-wrap">
                {selectedFile ? files.get(selectedFile) : "Select a file"}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useViewTsFilesDialog = createUseDialog(ViewTsFilesDialog)
