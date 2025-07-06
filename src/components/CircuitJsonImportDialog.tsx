import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import { convertCircuitJsonToTscircuit } from "circuit-json-to-tscircuit"
import { useCreatePackageMutation } from "@/hooks/use-create-package-mutation"
import { generateRandomPackageName } from "@/lib/utils/package-utils"
import { useCreatePackageReleaseMutation } from "@/hooks/use-create-package-release-mutation"
import { useCreatePackageFilesMutation } from "@/hooks/use-create-package-files-mutation"

interface CircuitJsonImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const isValidJSON = (code: string) => {
  try {
    JSON.parse(code)
    return true
  } catch {
    return false
  }
}

export function CircuitJsonImportDialog({
  open,
  onOpenChange,
}: CircuitJsonImportDialogProps) {
  const [circuitJson, setcircuitJson] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loggedInUser = useGlobalStore((s) => s.session)
  const { toast } = useToast()
  const axios = useAxios()
  const [, navigate] = useLocation()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const createPackageMutation = useCreatePackageMutation()
  const { mutate: createRelease } = useCreatePackageReleaseMutation({
    onSuccess: () => {
      toast({
        title: "Package released",
        description: "Your package has been released successfully.",
      })
    },
  })

  const createPackageFilesMutation = useCreatePackageFilesMutation({
    onSuccess: () => {
      toast({
        title: "Package files created",
        description: "Your package files have been created successfully.",
      })
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/json") {
      setFile(selectedFile)
    } else {
      setError("Please select a valid JSON file.")
    }
  }

  const handleImport = async () => {
    let importedCircuitJson

    const parseJson = async (jsonString: string) => {
      try {
        return JSON.parse(jsonString)
      } catch {
        throw new Error("Invalid JSON format.")
      }
    }

    const handleError = (message: string) => {
      toast({
        title: "Import Failed",
        description: message,
        variant: "destructive",
      })
      setIsLoading(false)
    }

    const handleSuccess = (message: string) => {
      toast({
        title: "Success",
        description: message,
      })
    }

    try {
      if (file) {
        const fileText = await file.text()
        importedCircuitJson = await parseJson(fileText)
      } else if (isValidJSON(circuitJson)) {
        setIsLoading(true)
        setError(null)
        importedCircuitJson = await parseJson(circuitJson)
      } else {
        handleError("Please provide a valid JSON content or file.")
        return
      }

      const tscircuitComponentContent = convertCircuitJsonToTscircuit(
        importedCircuitJson as any,
        {
          componentName: "circuit",
        },
      )
      console.info(tscircuitComponentContent)

      await createPackageMutation.mutateAsync(
        {
          name: `${loggedInUser?.github_username}/${generateRandomPackageName()}`,
          description: "Imported from Circuit JSON",
        },
        {
          onSuccess: (newPackage) => {
            handleSuccess("Package has been created successfully.")
            createRelease(
              {
                package_name_with_version: `${newPackage.name}@latest`,
              },
              {
                onSuccess: (release) => {
                  createPackageFilesMutation
                    .mutateAsync({
                      file_path: "index.tsx",
                      content_text: tscircuitComponentContent,
                      package_release_id: release.package_release_id,
                    })
                    .then(() => {
                      navigate(`/editor?package_id=${newPackage.package_id}`)
                    })
                },
                onError: (error) => {
                  setError(error)
                  handleError("Failed to create package release.")
                },
              },
            )
          },
          onError: (error) => {
            setError(error)
            handleError("Failed to create package.")
          },
          onSettled: () => {
            setIsLoading(false)
            onOpenChange(false)
          },
        },
      )
    } catch (error) {
      console.error("Error importing Circuit Json:", error)
      handleError(
        "The Circuit JSON appears to be invalid or malformed. Please check the format and try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault()
      if (!isLoading && isLoggedIn && (circuitJson.trim() || file)) {
        handleImport()
      }
    }
  }

  const handleDialogKeyDown = (event: React.KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      !event.ctrlKey &&
      !event.metaKey &&
      event.target !== document.querySelector("textarea")
    ) {
      event.preventDefault()
      if (!isLoading && isLoggedIn && (circuitJson.trim() || file)) {
        handleImport()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onKeyDown={handleDialogKeyDown}>
        <DialogHeader>
          <DialogTitle>Import Circuit JSON</DialogTitle>
          <DialogDescription>
            Use this dialog to import a Circuit JSON file or paste the JSON
            content directly.
          </DialogDescription>
        </DialogHeader>
        <div className="pb-4">
          <Textarea
            className="mt-3"
            placeholder="Paste the Circuit JSON."
            value={circuitJson}
            onChange={(e) => setcircuitJson(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!!file}
          />
          <div className="mt-4 flex flex-col gap-2">
            <label
              htmlFor="file-input"
              className="block text-sm font-medium text-gray-700"
            >
              Upload JSON File
            </label>
            <div className="flex items-center gap-4">
              <input
                id="file-input"
                type="file"
                accept="application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="px-4 py-2 bg-slate-900 text-slate-50 rounded-lg shadow cursor-pointer hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90 transition-all duration-200"
              >
                Choose File
              </label>
            </div>
            {file && (
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">
                  Selected file:
                </span>{" "}
                {file.name}
              </p>
            )}
          </div>

          {error && <p className="bg-red-100 p-2 mt-2 pre-wrap">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isLoading || !isLoggedIn}>
            {!isLoggedIn
              ? "Must be logged in for JSON import"
              : isLoading
                ? "Importing..."
                : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
