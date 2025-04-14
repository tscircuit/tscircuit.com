import { Input } from "@/components/ui/input"
import { useEffect, useMemo, useState } from "react"
import { parseFootprintParams } from "@/lib/utils/parseFootprintParams"
import ParametersEditor from "@/components/ParametersEditor"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp, getFootprintNamesByType } from "@tscircuit/footprinter"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { FileName } from "@/components/p/CodeEditorHeader"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, Check } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"

interface FootprintDialogProps {
  currentFile: FileName
  open: boolean
  onOpenChange: (open: boolean) => void
  updateFileContent: (filename: FileName, content: string) => void
  files: Record<string, string>
  cursorPosition?: number | null
}

const PARAM_NAMES: any = {
  p: "Pitch",
  w: "Width",
  num_pins: "Number of Pins",
  pl: "Pad Length",
  pw: "Pad Width",
  id: "Inner Diameter",
  od: "Outer Diameter",
}

export const FootprintDialog = ({
  currentFile,
  open,
  onOpenChange,
  updateFileContent,
  files,
  cursorPosition,
}: FootprintDialogProps) => {
  const [footprintString, setFootprintString] = useState("")
  const [footprintName, setFootprintName] = useState("")
  const [previewSvg, setPreviewSvg] = useState<string | null>(null)
  const [chipName, setChipName] = useState("")
  const [footprintNameError, setFootprintNameError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const { normalFootprintNames } = getFootprintNamesByType()

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [copied])

  const params: any = useMemo(() => {
    try {
      return fp.string(footprintString).json()
    } catch (error) {
      return null
    }
  }, [footprintName, footprintString])

  const updateFootprintString = (baseName: string, currentParams: any) => {
    try {
      const parsedParams = parseFootprintParams(currentParams)

      if (parsedParams.missing && Array.isArray(parsedParams.missing)) {
        parsedParams.missing =
          parsedParams.missing.length > 0
            ? `missing(${parsedParams.missing.join(",")})`
            : "missing()"
      }

      if (
        parsedParams.grid === "0x0" ||
        parsedParams.grid === "0x" ||
        /^(\d+x0|0x\d+)$/.test(parsedParams.grid as string)
      ) {
        delete parsedParams.grid
      }

      const paramsString = Object.entries(parsedParams)
        .filter(([key]) => key !== "fn" && key !== "num_pins")
        .map(([key, val]) => {
          if (typeof val === "boolean") return val ? key : ""
          if (key === "missing") return val
          return `${key}${val}`
        })
        .filter((item) => item !== "")
        .join("_")

      const newFootprintString = paramsString
        ? `${baseName}_${paramsString}`
        : baseName
      setFootprintString(newFootprintString)
      handleFootprintPreview(newFootprintString)
    } catch (error) {
      console.error("Error updating footprint string:", error)
    }
  }

  const updateParam = (
    paramName: string,
    value: string | number | boolean | string[],
  ) => {
    try {
      let currentParams = parseFootprintParams({ ...params })
      if (paramName === "num_pins") {
        if (Number(value) < 1) value = 1
        if (Number(value) > 4000) value = 4000
        const baseNameWithoutNumber = footprintName.replace(/\d+$/, "")
        const newName = `${baseNameWithoutNumber}${value}`
        updateFootprintString(newName, currentParams)
        return
      }

      currentParams[paramName] = value
      if (currentParams.missing && Array.isArray(currentParams.missing)) {
        currentParams.missing =
          currentParams.missing.length > 0
            ? `missing(${currentParams.missing.join(",")})`
            : "missing()"
      }
      currentParams = parseFootprintParams(currentParams)
      const pinMatch = footprintString.match(/\d+(?=(_|$))/)
      const pinNumber = pinMatch ? pinMatch[0] : ""
      const baseNameWithoutNumber = footprintName.replace(/\d+$/, "")
      const nameWithNumber = pinNumber
        ? `${baseNameWithoutNumber}${pinNumber}`
        : footprintName

      updateFootprintString(nameWithNumber, currentParams)
    } catch (error) {
      console.error("Error updating parameter:", error)
    }
  }

  const handleFootprintPreview = async (str: string) => {
    try {
      const circuitJson = fp.string(str).circuitJson()
      const svg = convertCircuitJsonToPcbSvg(circuitJson)
      setFootprintNameError(false)
      setPreviewSvg(svg)
      setError(null)
    } catch (error) {
      setFootprintNameError(true)
      setPreviewSvg(null)
      setError(
        error instanceof Error
          ? error.message
          : "Invalid footprint configuration",
      )
    }
  }

  const handleInsertFootprint = () => {
    try {
      const tsxCode = `\n
    <chip
      name="${chipName}"
      footprint="${footprintString}"
    />\n`
      const currentContent = files[currentFile]

      if (cursorPosition !== undefined && cursorPosition !== null) {
        const newContent =
          currentContent.slice(0, cursorPosition) +
          tsxCode +
          currentContent.slice(cursorPosition)
        updateFileContent(currentFile, newContent)
      } else {
        // No cursor position, look for </board> tag
        const boardClosingTagIndex = currentContent.lastIndexOf("</board>")

        if (boardClosingTagIndex !== -1) {
          // Insert before the closing board tag
          const newContent =
            currentContent.slice(0, boardClosingTagIndex) +
            tsxCode +
            currentContent.slice(boardClosingTagIndex)
          updateFileContent(currentFile, newContent)
        } else {
          const lastParenIndex = currentContent.lastIndexOf(")")

          if (lastParenIndex !== -1) {
            const newContent =
              currentContent.slice(0, lastParenIndex) +
              tsxCode +
              currentContent.slice(lastParenIndex)
            updateFileContent(currentFile, newContent)
          } else {
            // If no closing parenthesis found, append to end of file
            updateFileContent(currentFile, currentContent + tsxCode)
          }
        }
      }

      setChipName("")
    } catch (error) {
      console.error("Error inserting footprint:", error)
      toast({
        title: "Error",
        description: "Failed to insert footprint",
        variant: "destructive",
      })
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(footprintString)
      setCopied(true)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1160px] h-full flex flex-col overflow-x-scroll">
        <DialogHeader>
          <DialogTitle>Insert Chip</DialogTitle>
          <DialogDescription>
            Choose a footprint type and configure its parameters. The footprint
            will be inserted at your cursor position.
          </DialogDescription>
        </DialogHeader>
        <div className="w-fit h-fit flex gap-4 pt-4">
          <div className="space-y-4 min-w-[280px]">
            <div>
              <label className="text-sm font-medium">Chip Name</label>
              <Input
                value={chipName}
                onChange={(e) => setChipName(e.target.value)}
                placeholder="Enter chip name (e.g., U1)..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Footprint Name</label>
              <Combobox
                value={footprintName}
                onChange={(value) => {
                  setFootprintName(value)
                  try {
                    let newParams = fp.string(value).json()
                    updateFootprintString(value, newParams)
                  } catch (error) {
                    console.error("Error updating footprint string:", error)
                    setFootprintString(value)
                    handleFootprintPreview(value)
                  }
                }}
                options={normalFootprintNames}
                placeholder="Select footprint..."
                searchPlaceholder="Search footprints..."
                emptyText="No footprints found."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Footprint String</label>
              <div className="flex items-center justify-center mt-1 gap-1">
                <Input
                  readOnly
                  value={footprintString}
                  onChange={(e) => {
                    setFootprintString(e.target.value)
                    handleFootprintPreview(e.target.value)
                  }}
                  placeholder="Complete footprint string..."
                  className={`bg-gray-50 text-gray-500 ${footprintNameError && "bg-red-50 border-red-200"}`}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  className={`shrink-0 ${copied && "text-green-500 border-green-500"}`}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {params && (
              <ParametersEditor
                params={params}
                updateParam={updateParam}
                paramNames={PARAM_NAMES}
              />
            )}
            <Button
              onClick={() => {
                handleInsertFootprint()
                onOpenChange(false)
              }}
              disabled={!footprintString || !chipName}
              className="w-full"
            >
              Insert Footprint
            </Button>
          </div>
          <div className="flex flex-col">
            <div className="rounded-xl overflow-hidden w-[800px] h-[600px]">
              {previewSvg && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewSvg,
                  }}
                />
              )}
            </div>
            {error && (
              <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
