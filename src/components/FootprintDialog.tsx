import { Input } from "./ui/input"
import { useEffect, useMemo, useState } from "react"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "@tscircuit/footprinter"
import { useToast } from "../hooks/use-toast"
import { Button } from "./ui/button"
import { FileName } from "./CodeEditorHeader"
import parse from "html-react-parser"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Copy, Check } from "lucide-react"
import { Combobox } from "./ui/combobox"

interface FootprintDialogProps {
  currentFile: FileName
  open: boolean
  onOpenChange: (open: boolean) => void
  updateFileContent: (filename: FileName, content: string) => void
  files: Record<string, string>
  cursorPosition?: number | null
}

export const FootprintDialog = ({
  currentFile,
  open,
  onOpenChange,
  updateFileContent,
  files,
  cursorPosition,
}: FootprintDialogProps) => {
  const [footprinterString, setFootprinterString] = useState("")
  const [footprinterName, setFootprinterName] = useState("")
  const [previewSvg, setPreviewSvg] = useState<string | null>(null)
  const [chipName, setChipName] = useState("")
  const [footprintNameError, setFootprintNameError] = useState(false)
  const [copied, setCopied] = useState(false)
  const footprintNames = fp.getFootprintNames()
  const { toast } = useToast()
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })

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
      return fp.string(footprinterString).json()
    } catch (error) {
      return null
    }
  }, [footprinterName, footprinterString])

  const updateFootprintString = (baseName: string, currentParams: any) => {
    try {
      const paramsString = Object.entries(currentParams)
        .filter(([key]) => key !== "fn" && key !== "num_pins")
        .map(([key, val]) => {
          if (typeof val === "boolean") return val ? key : ""
          return `${key}${val}`
        })
        .filter((item) => item !== "")
        .join("_")

      const newFootprinterString = paramsString
        ? `${baseName}_${paramsString}`
        : baseName
      setFootprinterString(newFootprinterString)
      handleFootprinterPreview(newFootprinterString)
    } catch (error) {
      console.error("Error updating footprint string:", error)
    }
  }

  const updateParam = (paramName: string, value: string | number | boolean) => {
    try {
      const currentParams = params
      if (paramName === "num_pins") {
        if (Number(value) < 1) value = 1
        if (Number(value) > 4000) value = 4000
        const baseNameWithoutNumber = footprinterName.replace(/\d+$/, "")
        const newName = `${baseNameWithoutNumber}${value}`
        setFootprinterName(newName)
        updateFootprintString(newName, currentParams)
        return
      }

      currentParams[paramName] = value
      updateFootprintString(footprinterName, currentParams)
    } catch (error) {
      console.error("Error updating parameter:", error)
    }
  }

  const handleFootprinterPreview = async (str: string) => {
    try {
      const circuitJson = fp.string(str).circuitJson()
      const svg = convertCircuitJsonToPcbSvg(circuitJson)
      setFootprintNameError(false)
      setPreviewSvg(svg)
    } catch (error) {
      setFootprintNameError(true)
      setPreviewSvg(null)
    }
  }

  const handleInsertFootprint = () => {
    try {
      const tsxCode = `\n
    <chip
      name="${chipName}"
      footprint="${footprinterString}"
      pcbX={${position.x}}
      pcbY={${position.y}}
    />`
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
      await navigator.clipboard.writeText(footprinterString)
      setCopied(true)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1160px] h-full flex flex-col">
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
              <label className="text-sm font-medium">Position</label>
              <div className="flex gap-2 mt-1">
                <div className="flex gap-2 items-center flex-1">
                  <label className="text-sm">x:</label>
                  <Input
                    type="number"
                    value={position?.x ?? 0}
                    onChange={(e) =>
                      setPosition((prev) => ({
                        ...prev,
                        x: Number(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                </div>
                <div className="flex gap-2 items-center flex-1">
                  <label className="text-sm">y:</label>
                  <Input
                    type="number"
                    value={position?.y ?? 0}
                    onChange={(e) =>
                      setPosition((prev) => ({
                        ...prev,
                        y: Number(e.target.value),
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Footprinter Name</label>
              <Combobox
                value={footprinterName}
                onChange={(value) => {
                  setFootprinterName(value)
                  try {
                    const newParams = fp.string(value).json()
                    updateFootprintString(value, newParams)
                  } catch (error) {
                    console.error("Error updating footprint string:", error)
                    setFootprinterString(value)
                    handleFootprinterPreview(value)
                  }
                }}
                options={footprintNames}
                placeholder="Select footprint..."
                searchPlaceholder="Search footprints..."
                emptyText="No footprints found."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Footprinter String</label>
              <div className="flex items-center justify-center mt-1 gap-1">
                <Input
                  readOnly
                  value={footprinterString}
                  onChange={(e) => {
                    setFootprinterString(e.target.value)
                    handleFootprinterPreview(e.target.value)
                  }}
                  placeholder="Complete footprinter string..."
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
            <div>
              <label className="text-sm font-medium">Number of Pins</label>
              <Input
                type="number"
                min="1"
                max="10000"
                onChange={(e) => {
                  let value = Number(e.target.value)
                  if (value < 1) value = 0
                  if (value > 4000) value = 4000
                  if (footprinterName.match(/\d+$/)) return
                  const newName = `${footprinterName}${value ? value : ""}`
                  try {
                    const newParams = fp.string(newName).json()
                    updateFootprintString(newName, newParams)
                  } catch (error) {
                    console.error("Error updating footprint string:", error)
                    setFootprinterString(newName)
                    handleFootprinterPreview(newName)
                  }
                }}
                placeholder="Enter number of pins..."
                className="mt-1"
              />
            </div>
            {params && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Parameters</label>
                {Object.entries(params)
                  .filter(([key]) => key !== "fn")
                  .map(([key]) => (
                    <div key={key} className="flex gap-2 items-center">
                      <label className="text-sm">{key}:</label>
                      {typeof params[key] === "boolean" ? (
                        <input
                          type="checkbox"
                          checked={params[key]}
                          onChange={(e) => updateParam(key, e.target.checked)}
                          className="h-4 w-4"
                        />
                      ) : (
                        <Input
                          type={
                            typeof params[key] === "number" ? "number" : "text"
                          }
                          value={params[key]}
                          onChange={(e) => updateParam(key, e.target.value)}
                          className="flex-1"
                        />
                      )}
                    </div>
                  ))}
              </div>
            )}
            <Button
              onClick={() => {
                handleInsertFootprint()
                onOpenChange(false)
              }}
              disabled={!footprinterString || !chipName}
              className="w-full"
            >
              Insert Footprint
            </Button>
          </div>
          <div className="rounded-xl overflow-hidden w-[800px] h-[600px]">
            {previewSvg && <div>{parse(previewSvg)}</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
