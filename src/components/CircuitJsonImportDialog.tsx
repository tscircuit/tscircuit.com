import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import { convertCircuitJsonToTscircuit } from "circuit-json-to-tscircuit"

interface CircuitJsonImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const isValidURL = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function CircuitJsonImportDialog({
  open,
  onOpenChange,
}: CircuitJsonImportDialogProps) {
  const [externalCircuitJsonUrl, setexternalCircuitJsonUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const axios = useAxios()
  const { toast } = useToast()
  const [, navigate] = useLocation()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const session = useGlobalStore((s) => s.session)

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

    if (file) {
      try {
        const fileText = await file.text()
        importedCircuitJson = JSON.parse(fileText)
      } catch (err) {
        setError("Error reading JSON file. Please ensure it is valid.")
        return
      }
    } else if (isValidURL(externalCircuitJsonUrl)) {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(externalCircuitJsonUrl, {
          headers: { Accept: "application/json" },
        })

        if (!response.ok) {
          throw new Error("Network response was not ok")
        }

        importedCircuitJson = await response.json()
      } catch (error) {
        console.error("Error importing Circuit Json:", error)
        toast({
          title: "Import Failed",
          description: "Failed to import the Circuit Json from the URL.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    } else {
      toast({
        title: "Invalid Input",
        description: "Please provide a valid JSON file or URL.",
        variant: "destructive",
      })
      return
    }
    let tscircuit
    try {
      tscircuit = convertCircuitJsonToTscircuit(importedCircuitJson as any, {
        componentName: "circuit",
      })
      console.info(tscircuit)
    } catch {
      toast({
        title: "Import Failed",
        description: "Invalid JSON was provided.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const newSnippetData = {
        snippet_type: importedCircuitJson.type ?? "board",
        circuit_json: importedCircuitJson,
        code: tscircuit,
      }
      const response = await axios
        .post("/snippets/create", newSnippetData)
        .catch((e) => e)
      const { snippet, message } = response.data
      if (message) {
        setError(message)
        setIsLoading(false)
        return
      }
      toast({
        title: "Import Successful",
        description: "Circuit Json has been imported successfully.",
      })
      onOpenChange(false)
      navigate(`/editor?snippet_id=${snippet.snippet_id}`)
    } catch (error) {
      console.error("Error importing Circuit Json:", error)
      toast({
        title: "Import Failed",
        description: "Failed to import the Circuit Json. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Circuit JSON</DialogTitle>
        </DialogHeader>
        <div className="pb-4">
          <Input
            type="url"
            className="mt-3"
            placeholder="Paste the URL to import the Circuit JSON (e.g. https://example.com/circuit.json)."
            value={externalCircuitJsonUrl}
            onChange={(e) => setexternalCircuitJsonUrl(e.target.value)}
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
                className="hidden" // Hide the default file input
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
