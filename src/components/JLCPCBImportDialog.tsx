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

interface ImportState {
  isLoading: boolean
  error: string | null
  existingComponent: {
    partNumber: string
    username: string
  } | null
}

interface JLCPCBResponse {
  ok: boolean
  package: {
    package_id: string
  }
}

interface APIError {
  status: number
  response?: {
    data?: {
      message?: string
      existing_part_number?: string
      part_number?: string
      error?: {
        message?: string
      }
    }
  }
  data?: {
    message?: string
    existing_part_number?: string
    part_number?: string
    error?: {
      message?: string
    }
  }
}

const extractErrorMessage = (error: APIError): string => {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.data?.error?.message ||
    "An unexpected error occurred"
  )
}

const extractExistingPartNumber = (
  error: APIError,
  fallback: string,
): string => {
  return error?.data?.message || error?.data?.error?.message || fallback
}

const useJLCPCBImport = () => {
  const [state, setState] = useState<ImportState>({
    isLoading: false,
    error: null,
    existingComponent: null,
  })

  const axios = useAxios()
  const { toast } = useToast()
  const [, navigate] = useLocation()
  const session = useGlobalStore((s) => s.session)

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      existingComponent: null,
    })
  }

  const importComponent = async (partNumber: string) => {
    if (!partNumber.startsWith("C") || partNumber.length < 2) {
      toast({
        title: "Invalid Part Number",
        description:
          "JLCPCB part numbers should start with 'C' and be at least 2 characters long.",
        variant: "destructive",
      })
      return { success: false }
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      existingComponent: null,
    }))

    try {
      const response = await axios.post<JLCPCBResponse>(
        "/packages/generate_from_jlcpcb",
        {
          jlcpcb_part_number: partNumber,
        },
      )

      if (!response.data.ok) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to generate package from JLCPCB part",
        }))
        return { success: false }
      }

      const { package: generatedPackage } = response.data

      toast({
        title: "Import Successful",
        description: "JLCPCB component has been imported successfully.",
      })

      navigate(`/editor?package_id=${generatedPackage.package_id}`)
      return { success: true }
    } catch (error: any) {
      const apiError = error as APIError

      if (apiError.status === 404) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: `Component with JLCPCB part number ${partNumber} not found`,
        }))
      } else if (apiError.status === 409) {
        const existingPartNumber = extractExistingPartNumber(
          apiError,
          partNumber,
        )
        setState((prev) => ({
          ...prev,
          isLoading: false,
          existingComponent: {
            partNumber: existingPartNumber,
            username: session?.github_username || "",
          },
        }))
      } else {
        const errorMessage = extractErrorMessage(apiError)
        setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))

        toast({
          title: "Import Failed",
          description: errorMessage,
          variant: "destructive",
        })
      }

      return { success: false }
    }
  }

  return {
    ...state,
    importComponent,
    resetState,
  }
}

export function JLCPCBImportDialog({
  open,
  onOpenChange,
}: JLCPCBImportDialogProps) {
  const [partNumber, setPartNumber] = useState("")
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))

  const { isLoading, error, existingComponent, importComponent, resetState } =
    useJLCPCBImport()

  const handleImport = async () => {
    const result = await importComponent(partNumber)
    if (result.success) {
      onOpenChange(false)
    }
  }

  const handleInputChange = (value: string) => {
    setPartNumber(value)
    resetState()
  }

  const createGitHubIssue = () => {
    const issueTitle = `[${partNumber}] Failed to import from JLCPCB`
    const issueBody = `I tried to import the part number ${partNumber} from JLCPCB, but it failed. Here's the error I got:\n\`\`\`\n${error}\n\`\`\`\n\nCould be an issue in \`fetchEasyEDAComponent\` or \`convertRawEasyEdaToTs\``
    const issueLabels = "snippets,good first issue"
    const url = `https://github.com/tscircuit/easyeda-converter/issues/new?title=${encodeURIComponent(
      issueTitle,
    )}&body=${encodeURIComponent(issueBody)}&labels=${encodeURIComponent(issueLabels)}`
    window.open(url, "_blank")
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
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !isLoading &&
                isLoggedIn &&
                partNumber.trim()
              ) {
                handleImport()
              }
            }}
          />

          {error && !existingComponent && (
            <>
              <p className="bg-red-100 p-2 mt-2 pre-wrap">{error}</p>
              <div className="flex justify-end mt-2">
                <Button variant="default" onClick={createGitHubIssue}>
                  File Issue on GitHub (prefilled)
                </Button>
              </div>
            </>
          )}

          {existingComponent && (
            <p className="p-2 mt-2 pre-wrap text-md text-green-600">
              This part number has already been imported to your profile.{" "}
              <PrefetchPageLink
                className="text-blue-500 hover:underline"
                href={`/${existingComponent.username}/${existingComponent.partNumber}`}
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
