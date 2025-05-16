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
import { createUseDialog } from "./create-use-dialog"

const CreateFileDialog = ({
  handleCreateFile,
  open,
  onOpenChange,
  newFileName,
  setNewFileName,
  onFileSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleCreateFile: (props: CreateFileProps) => void
  newFileName: string
  setNewFileName: (newFileName: string) => void
  onFileSelect: (fileName: string) => void
}) => {
  const [errorMessage, setErrorMessage] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setNewFileName(e.target.value.trim())
          }}
        />
        <Button
          onClick={() =>
            handleCreateFile({
              newFileName,
              setErrorMessage,
              setIsModalOpen: onOpenChange,
              onFileSelect,
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
  )
}

export const useCreateFileDialog = createUseDialog(CreateFileDialog)
