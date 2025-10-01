import React, { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { handleManualEditsImportWithSupportForMultipleFiles } from "@/lib/handleManualEditsImportWithSupportForMultipleFiles"
import { useImportComponentDialog } from "@/components/dialogs/import-component-dialog"
import { useToast } from "@/hooks/use-toast"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  JlcpcbComponentTsxLoadedPayload,
  KicadStringSelectedPayload,
  TscircuitPackageSelectedPayload,
} from "@tscircuit/runframe/runner"
import { ICreateFileProps, ICreateFileResult } from "@/hooks/useFileManagement"
import { useGlobalStore } from "@/hooks/use-global-store"
import { openJlcpcbImportIssue } from "@/hooks/use-jlcpcb-component-import"

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
  const { Dialog: ImportComponentDialog, openDialog: openImportDialog } =
    useImportComponentDialog()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = fileSidebarState
  const [aiAutocompleteEnabled, setAiAutocompleteEnabled] = aiAutocompleteState
  const session = useGlobalStore((s) => s.session)

  const jlcpcbProxyRequestHeaders = useMemo(() => {
    if (!session?.token) return undefined
    return {
      Authorization: `Bearer ${session.token}`,
    }
  }, [session?.token])

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

  const handleTscircuitPackageSelected = useCallback(
    async ({ fullPackageName }: TscircuitPackageSelectedPayload) => {
      if (!currentFile) {
        const message = "Select a file before importing a component."
        toast({
          title: "No file selected",
          description: message,
          variant: "destructive",
        })
        throw new Error(message)
      }

      const existingContent = files[currentFile] ?? ""
      const newContent = `import {} from "${fullPackageName}"\n${existingContent}`
      updateFileContent(currentFile, newContent)
      toast({
        title: "Component imported",
        description: `Added ${fullPackageName} to ${currentFile}.`,
      })
    },
    [currentFile, files, toast, updateFileContent],
  )

  const handleJlcpcbComponentTsxLoaded = useCallback(
    async ({ result, tsx }: JlcpcbComponentTsxLoadedPayload) => {
      const partNumber = result.component.partNumber || "component"

      try {
        const sanitizedBaseName = partNumber
          .toLowerCase()
          .replace(/[^a-z0-9_-]/gi, "-")
        let componentPath = `imports/${sanitizedBaseName}.tsx`
        let suffix = 1
        while (files[componentPath] || files[`./${componentPath}`]) {
          componentPath = `imports/${sanitizedBaseName}-${suffix}.tsx`
          suffix += 1
        }

        const createFileResult = createFile({
          newFileName: componentPath,
          content: tsx,
          onError: (error) => {
            throw error
          },
        })

        if (!createFileResult.newFileCreated) {
          throw new Error("Failed to create component file")
        }

        toast({
          title: "Component imported",
          description: `${partNumber} saved to ${componentPath}.`,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to import component from JLCPCB"

        toast({
          title: "JLCPCB import failed",
          description: (
            <div className="space-y-2">
              <p>{message}</p>
              <button
                className="text-sm text-blue-500 hover:underline"
                onClick={(event) => {
                  event.preventDefault()
                  openJlcpcbImportIssue(partNumber, message)
                }}
              >
                File issue on GitHub
              </button>
            </div>
          ),
          variant: "destructive",
        })

        throw new Error(message)
      }
    },
    [createFile, files, toast],
  )

  const handleKicadStringSelected = useCallback(
    async ({ footprint, result }: KicadStringSelectedPayload) => {
      try {
        await navigator.clipboard.writeText(footprint)
        toast({
          title: "KiCad footprint copied",
          description: `${result.footprint.qualifiedName} copied to clipboard.`,
        })
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to copy KiCad footprint to clipboard"
        toast({
          title: "KiCad import failed",
          description: message,
          variant: "destructive",
        })
        throw new Error(message)
      }
    },
    [toast],
  )

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
                  onClick={() => {
                    setAiAutocompleteEnabled((prev) => !prev)
                  }}
                  className={`relative group bg-transparent ${aiAutocompleteEnabled ? "text-gray-600 bg-gray-50" : "text-gray-400"}`}
                >
                  <Bot className="h-4 w-4" />
                  {!aiAutocompleteEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-0.5 group-hover:bg-slate-900 bg-gray-400 rotate-45 rounded-full" />
                    </div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle AI autocomplete for code suggestions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button size="sm" variant="ghost" onClick={() => openImportDialog()}>
            Import
          </Button>
          <Button size="sm" variant="ghost" onClick={handleFormatFile}>
            Format
          </Button>
        </div>
        <ImportComponentDialog
          onTscircuitPackageSelected={handleTscircuitPackageSelected}
          onJlcpcbComponentTsxLoaded={handleJlcpcbComponentTsxLoaded}
          onKicadStringSelected={handleKicadStringSelected}
          jlcpcbProxyRequestHeaders={jlcpcbProxyRequestHeaders}
        />
      </div>
    </>
  )
}

export default CodeEditorHeader
