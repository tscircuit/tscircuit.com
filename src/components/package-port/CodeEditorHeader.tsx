import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { handleManualEditsImportWithSupportForMultipleFiles } from "@/lib/handleManualEditsImportWithSupportForMultipleFiles"
import { useImportPackageDialog } from "@/components/dialogs/import-package-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertTriangle, PanelRightClose, Bot } from "lucide-react"
import { checkIfManualEditsImported } from "@/lib/utils/checkIfManualEditsImported"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"
import { Package } from "fake-snippets-api/lib/db/schema"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ImportComponentDialog } from "@/components/RunframeJLCPCB"

export type FileName = string

// Add ComponentSearchResult type
interface ComponentSearchResult {
  name: string
  partNumber?: string
  source: "jlcpcb" | "tscircuit.com"
  owner?: string
}

interface CodeEditorHeaderProps {
  currentFile: FileName | null
  files: Record<FileName, string>
  updateFileContent: (filename: FileName | null, content: string) => void
  fileSidebarState: ReturnType<typeof useState<boolean>>
  handleFileChange: (filename: FileName) => void
  entrypointFileName?: string
}

export const CodeEditorHeader: React.FC<CodeEditorHeaderProps> = ({
  currentFile,
  files,
  updateFileContent,
  fileSidebarState,
  handleFileChange,
  entrypointFileName = "index.tsx",
}) => {
  const { Dialog: ImportPackageDialog, openDialog: openImportDialog } =
    useImportPackageDialog()
  const { toast } = useToast()
  const axios = useAxios()
  const [, navigate] = useLocation()
  const session = useGlobalStore((s) => s.session)
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [aiAutocompleteEnabled, setAiAutocompleteEnabled] = useState(false)
  const [isRunframeImportOpen, setIsRunframeImportOpen] = useState(false)

  
  const importJLCPCBComponent = async (partNumber: string) => {
    if (!partNumber.startsWith("C") || partNumber.length < 2) {
      toast({
        title: "Invalid Part Number",
        description:
          "JLCPCB part numbers should start with 'C' and be at least 2 characters long.",
        variant: "destructive",
      })
      return { success: false }
    }

    try {
      const response = await axios.post("/packages/generate_from_jlcpcb", {
        jlcpcb_part_number: partNumber,
      })

      if (!response.data.ok) {
        toast({
          title: "Import Failed",
          description: "Failed to generate package from JLCPCB part",
          variant: "destructive",
        })
        return { success: false }
      }

      const { package: generatedPackage } = response.data

      toast({
        title: "Import Successful",
        description: "JLCPCB component has been imported successfully.",
      })

      // Navigate to the new editor with the import 
      navigate(`/editor?package_id=${generatedPackage.package_id}`,{replace: true} )
      setTimeout(() => {
  window.location.reload()
}, 100)
      return { success: true }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred"

      if (error.status === 404) {
        errorMessage = `Component with JLCPCB part number ${partNumber} not found`
      } else if (error.status === 409) {
        errorMessage = `Component ${partNumber} already exists in your profile`
      } else {
        errorMessage =
          error?.data?.message || error?.data?.error?.message || errorMessage
      }

      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      })

      return { success: false }
    }
  }

  const handleImportComponent = async (component: ComponentSearchResult) => {
    if (component.source === "jlcpcb") {
      // Handle JLCPCB import - trigger the same import process as JLCPCBImportDialog
      if (component.partNumber) {
        await importJLCPCBComponent(component.partNumber)
      } else {
        toast({
          title: "Missing Part Number",
          description: "JLCPCB component is missing a part number",
          variant: "destructive",
        })
      }
    } else if (component.source === "tscircuit.com") {
      //tscircuit.com package add import statement
      const importStatement = `import { ${component.name} } from "@tsci/${component.owner}.${component.name}"\n`
      const currentContent = files[currentFile || entrypointFileName] || ""
      updateFileContent(currentFile || entrypointFileName, importStatement + currentContent)
    }
  }

  const handleFormatFile = useCallback(() => {
    if (!window.prettier || !window.prettierPlugins) return
    if (!currentFile) return
    try {
      const currentContent = files[currentFile]
      let fileExtension = currentFile.split(".").pop()?.toLowerCase()
      if (currentContent.trim().length === 0) {
        toast({
          title: "Empty file",
          description: "Cannot format an empty file.",
        })
        return
      }
      if (!fileExtension) {
        toast({
          title: "Cannot determine file type",
          description: "Unable to format file without an extension.",
        })
        return
      }

      if (["readme"].includes(currentFile.toLowerCase())) {
        fileExtension = "md"
      }

      if (fileExtension === currentFile.toLowerCase()) {
        toast({
          title: "Cannot determine file type",
          description: "Unable to format file without an extension.",
        })
        return
      }

      // Handle JSON formatting separately
      if (fileExtension === "json") {
        try {
          const jsonObj = JSON.parse(currentContent)
          const formattedJson = JSON.stringify(jsonObj, null, 2)
          updateFileContent(currentFile, formattedJson)
        } catch (jsonError) {
          toast({
            title: "Invalid JSON",
            description: "Failed to format JSON: invalid syntax.",
            variant: "destructive",
          })
        }
        return
      }

      const parserMap: Record<string, string> = {
        js: "babel",
        jsx: "babel",
        ts: "typescript",
        tsx: "typescript",
        md: "markdown",
        markdown: "markdown",
      }

      const parser = parserMap[fileExtension] || "tsx"
      const formattedCode = window.prettier.format(currentContent, {
        semi: false,
        parser: parser,
        plugins: window.prettierPlugins,
      })

      updateFileContent(currentFile, formattedCode)
    } catch (error) {
      console.error("Formatting error:", error)
      if (
        error instanceof Error &&
        error.message.includes("No parser could be inferred")
      ) {
        toast({
          title: "Unsupported File Type",
          description: `Formatting not supported for .${currentFile.split(".").pop()?.toLowerCase()} files. Tried default parser.`,
        })
      } else {
        toast({
          title: "Formatting error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to format the code. Please check for syntax errors.",
          variant: "destructive",
        })
      }
    }
  }, [currentFile, files, toast, updateFileContent])

  return (
    <>
      <div className="flex items-center gap-2 px-2 border-b border-gray-200">
        <button
          className={`text-gray-400 scale-90 p-0 transition-[width,opacity] duration-300 ease-in-out overflow-hidden ${
            sidebarOpen
              ? "w-0 pointer-events-none opacity-0"
              : "w-6 opacity-100"
          }`}
          onClick={() => setSidebarOpen(true)}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <PanelRightClose />
          </div>
        </button>
        <div>
          <Select value={currentFile || ""} onValueChange={handleFileChange}>
            <SelectTrigger
              className={`h-7 w-32 sm:w-48 px-3 bg-white select-none transition-[margin] duration-300 ease-in-out ${
                sidebarOpen ? "-ml-2" : "-ml-1"
              }`}
            >
              <SelectValue placeholder="Select file" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(files)
                .filter(
                  (filename) =>
                    !isHiddenFile(
                      filename.startsWith("/") ? filename.slice(1) : filename,
                    ),
                )
                .map((filename) => (
                  <SelectItem className="py-1" key={filename} value={filename}>
                    <span
                      className={`text-xs pr-1 block truncate ${
                        sidebarOpen
                          ? "max-w-[8rem] sm:max-w-[12rem]"
                          : "max-w-[12rem] sm:max-w-[16rem]"
                      }`}
                    >
                      {filename}
                    </span>
                  </SelectItem>
                ))}
              {currentFile &&
                Object.keys(files).includes(currentFile) &&
                isHiddenFile(
                  currentFile.startsWith("/")
                    ? currentFile.slice(1)
                    : currentFile,
                ) && (
                  <SelectItem className="select-none py-1" value={currentFile}>
                    <span
                      className={`text-xs pr-1 block truncate ${
                        sidebarOpen
                          ? "max-w-[8rem] sm:max-w-[12rem]"
                          : "max-w-[12rem] sm:max-w-[16rem]"
                      }`}
                    >
                      {currentFile}
                    </span>
                  </SelectItem>
                )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center overflow-x-hidden gap-2 px-2 py-1 ml-auto">
          {checkIfManualEditsImported(files, currentFile || "") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:bg-red-50"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  File Error
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() =>
                    handleManualEditsImportWithSupportForMultipleFiles(
                      files,
                      updateFileContent,
                      entrypointFileName,
                      toast,
                    )
                  }
                >
                  Manual edits exist but have not been imported. (Click to fix)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setAiAutocompleteEnabled(!aiAutocompleteEnabled)
                  }
                  className={`relative bg-transparent ${aiAutocompleteEnabled ? "text-gray-600 bg-gray-50" : "text-gray-400"}`}
                >
                  <Bot className="h-4 w-4" />
                  {!aiAutocompleteEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-0.5 bg-gray-400 rotate-45 rounded-full" />
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle AI autocomplete for code suggestions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsRunframeImportOpen(true)}
          >
            Import
          </Button>
          <Button size="sm" variant="ghost" onClick={handleFormatFile}>
            Format
          </Button>
        </div>
        <ImportPackageDialog
          onPackageSelected={(pkg: Package) => {
            const newContent = `import {} from "@tsci/${pkg.owner_github_username}.${pkg.unscoped_name}"\n${files[currentFile || ""]}`
            updateFileContent(currentFile, newContent)
          }}
        />
        <ImportComponentDialog
          isOpen={isRunframeImportOpen}
          onClose={() => setIsRunframeImportOpen(false)}
          onImport={handleImportComponent}
        />
      </div>
    </>
  )
}

export default CodeEditorHeader
