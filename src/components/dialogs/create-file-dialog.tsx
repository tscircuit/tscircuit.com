import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateFileProps } from "../package-port/CodeAndPreview"

export const useCreateFileDialog = (handleCreateFile: (props: CreateFileProps) => void) => {
  const [open, setOpen] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileContent, setNewFileContent] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  return useMemo(
    () => ({
      openDialog: () => {
        setOpen(true)
      },
      closeDialog: () => {
        setOpen(false)
      },
      Dialog: () => (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogClose />
            <DialogTitle className="text-lg font-medium text-center">
              Create New File
            </DialogTitle>
            <DialogDescription className="text-sm text-center text-gray-500">
              Enter the name and content for the new file you wish to create.
            </DialogDescription>
            <Input
              spellCheck={false}
              autoComplete="off"
              placeholder="File Name"
              value={newFileName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewFileName(e.target.value.trim())
              }
            />
            <Button
              onClick={() =>
                handleCreateFile({
                  newFileName,
                  newFileContent,
                  setErrorMessage,
                  setIsModalOpen: setOpen,
                  onFileSelect: () => {},
                  setNewFileName,
                })
              }
            >
              Create
            </Button>
            {errorMessage && (
              <p className="text-red-500 text-md font-bold text-center break-all">
                {errorMessage}
              </p>
            )}
          </DialogContent>
        </Dialog>
      ),
      open,
    }),
    [open, newFileName, newFileContent, errorMessage],
  )
}
