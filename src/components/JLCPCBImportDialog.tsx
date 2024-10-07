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

interface JLCPCBImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JLCPCBImportDialog({
  open,
  onOpenChange,
}: JLCPCBImportDialogProps) {
  const [partNumber, setPartNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const axios = useAxios()
  const { toast } = useToast()
  const [, navigate] = useLocation()

  const handleImport = async () => {
    if (!partNumber.startsWith("C")) {
      toast({
        title: "Invalid Part Number",
        description: "JLCPCB part numbers should start with 'C'.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await axios
        .post("/snippets/generate_from_jlcpcb", {
          jlcpcb_part_number: partNumber,
        })
        .catch((e) => e)
      const { snippet, error } = response.data
      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }
      toast({
        title: "Import Successful",
        description: "JLCPCB component has been imported successfully.",
      })
      onOpenChange(false)
      navigate(`/editor?snippet_id=${snippet.snippet_id}`)
    } catch (error) {
      console.error("Error importing JLCPCB component:", error)
      toast({
        title: "Import Failed",
        description: "Failed to import the JLCPCB component. Please try again.",
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
          <DialogTitle>Import from JLCPCB</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <a
            href="https://yaqwsx.github.io/jlcparts/#/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline opacity-80"
          >
            JLCPCB Part Search
          </a>
          <Input
            className="mt-3"
            placeholder="Enter JLCPCB part number (e.g., C46749)"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
          />
          {error && <p className="bg-red-100 p-2 mt-2 pre-wrap">{error}</p>}
          {error && (
            <div className="flex justify-end mt-2">
              <Button
                variant="default"
                onClick={() => {
                  const issueTitle = `[${partNumber}] Failed to import from JLCPCB`
                  const issueBody = `I tried to import the part number ${partNumber} from JLCPCB, but it failed. Here's the error I got:\n\`\`\`\n${error}\n\`\`\``
                  const issueLabels = "snippets,good first issue"
                  const url = `https://github.com/tscircuit/easyeda-converter/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=${encodeURIComponent(issueLabels)}`

                  // Open the issue in a new tab
                  window.open(url, "_blank")
                }}
              >
                File Issue on Github (prefilled)
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
