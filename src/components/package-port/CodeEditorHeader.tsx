import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { handleManualEditsImportWithSupportForMultipleFiles } from "@/lib/handleManualEditsImportWithSupportForMultipleFiles"
import { useToast } from "@/hooks/use-toast"
import { useEditorComponentImport } from "@/hooks/use-editor-component-import"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertTriangle,
  PanelRightClose,
  Bot,
  FileText,
  Package,
  MoreHorizontal,
} from "lucide-react"
import { checkIfManualEditsImported } from "@/lib/utils/checkIfManualEditsImported"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ICreateFileProps, ICreateFileResult } from "@/hooks/useFileManagement"
export type FileName = string

interface CodeEditorHeaderProps {
  currentFile: FileName | null
  files: Record<FileName, string>
  updateFileContent: (filename: FileName | null, content: string) => void
  fileSidebarState: ReturnType<typeof useState<boolean>>
  handleFileChange: (filename: FileName) => void
  entrypointFileName?: string
  appendNewFile: (path: string, content: string) => void
  isLoadingFiles: boolean
  createFile: (props: ICreateFileProps) => ICreateFileResult
  aiAutocompleteState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
}

export const CodeEditorHeader: React.FC<CodeEditorHeaderProps> = ({
  currentFile,
  files,
  updateFileContent,
  fileSidebarState,
  isLoadingFiles = true,
  handleFileChange,
  entrypointFileName = "index.tsx",
  createFile,
  aiAutocompleteState,
}) => {
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [aiAutocompleteEnabled, setAiAutocompleteEnabled] = aiAutocompleteState
  const { importComponentDialog, openImportDialog } = useEditorComponentImport({
    currentFile,
    files,
    updateFileContent,
    createFile,
  })

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
      <div className="flex items-center gap-2 px-2 border-b md:py-2 border-gray-200">
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
              <SelectValue
                placeholder={
                  Object.keys(files).filter(
                    (filename) => !isHiddenFile(filename),
                  ).length > 0
                    ? "Select file"
                    : isLoadingFiles
                      ? "Loading files..."
                      : "No files"
                }
              />
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

        <div className="flex items-center gap-1 ml-auto">
          {checkIfManualEditsImported(files, currentFile || "") && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:bg-red-50 px-2"
                    onClick={() =>
                      handleManualEditsImportWithSupportForMultipleFiles(
                        files,
                        updateFileContent,
                        entrypointFileName,
                        toast,
                      )
                    }
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span className="ml-1 hidden lg:inline">File Error</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Manual edits exist but have not been imported. Click to fix.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAiAutocompleteEnabled((prev) => !prev)
                  }}
                  className={`relative px-2 ${aiAutocompleteEnabled ? "text-black" : "text-gray-500 group hover:text-black"}`}
                >
                  <Bot className="h-4 w-4" />
                  {!aiAutocompleteEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-[1.8px] bg-gray-500 group-hover:bg-black rotate-45 rounded-full" />
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle AI autocomplete for code suggestions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="hidden md:flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openImportDialog()}
                    className="px-2"
                  >
                    <Package className="h-4 w-4 lg:hidden" />
                    <span className="hidden lg:inline">Import</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Import components from tscircuit or JLCPCB</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleFormatFile}
                    className="px-2"
                  >
                    <FileText className="h-4 w-4 lg:hidden" />
                    <span className="hidden lg:inline">Format</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Format the current file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="px-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    openImportDialog()
                  }}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleFormatFile()
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Format
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {importComponentDialog}
      </div>
    </>
  )
}

export default CodeEditorHeader
