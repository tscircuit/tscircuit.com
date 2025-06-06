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
import { Input } from "@/components/ui/input"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import { PrefetchPageLink } from "./PrefetchPageLink"

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
  const [hasBeenImportedToAccountAlready, setHasBeenImportedToAccountAlready] =
    useState<boolean>(false)
  const axios = useAxios()
  const { toast } = useToast()
  const [, navigate] = useLocation()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const session = useGlobalStore((s) => s.session)

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
    setHasBeenImportedToAccountAlready(false)

    try {
      const response = await axios.post("/packages/generate_from_jlcpcb", {
        jlcpcb_part_number: partNumber,
      })
      if (!response.data.ok) {
        setError("Failed to generate package from JLCPCB part")
        setIsLoading(false)
        return
      }

      const { package: generatedPackage } = response.data

      toast({
        title: "Import Successful",
        description: "JLCPCB component has been imported successfully.",
      })

      onOpenChange(false)
      navigate(`/editor?package_id=${generatedPackage.package_id}`)
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError(`Component with JLCPCB part number ${partNumber} not found`)
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError("Failed to import the JLCPCB component. Please try again.")
        toast({
          title: "Import Failed",
          description:
            "Failed to import the JLCPCB component. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from JLCPCB</DialogTitle>
          <DialogDescription>
            Enter the JLCPCB part number to import the component.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
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
            disabled={isLoading}
            onChange={(e) => {
              setPartNumber(e.target.value)
              setError(null)
              setHasBeenImportedToAccountAlready(false)
            }}
          />
          {error && !hasBeenImportedToAccountAlready && (
            <p className="bg-red-100 p-2 mt-2 pre-wrap">{error}</p>
          )}

          {error && !hasBeenImportedToAccountAlready && (
            <div className="flex justify-end mt-2">
              <Button
                variant="default"
                onClick={() => {
                  const issueTitle = `[${partNumber}] Failed to import from JLCPCB`
                  const issueBody = `I tried to import the part number ${partNumber} from JLCPCB, but it failed. Here's the error I got:\n\`\`\`\n${error}\n\`\`\`\n\nCould be an issue in \`fetchEasyEDAComponent\` or \`convertRawEasyEdaToTs\``
                  const issueLabels = "snippets,good first issue"
                  const url = `https://github.com/tscircuit/easyeda-converter/issues/new?title=${encodeURIComponent(
                    issueTitle,
                  )}&body=${encodeURIComponent(
                    issueBody,
                  )}&labels=${encodeURIComponent(issueLabels)}`
                  window.open(url, "_blank")
                }}
              >
                File Issue on GitHub (prefilled)
              </Button>
            </div>
          )}

          {hasBeenImportedToAccountAlready && (
            <p className="p-2 mt-2 pre-wrap text-md text-green-600">
              This part number has already been imported to your profile.{" "}
              <PrefetchPageLink
                className="text-blue-500 hover:underline"
                href={`/${session?.github_username}/${partNumber}`}
              >
                View it here
              </PrefetchPageLink>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isLoading || !isLoggedIn}>
            {!isLoggedIn
              ? "You must be logged in to import from JLCPCB"
              : isLoading
                ? "Importing..."
                : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
