import React, { useState, useEffect, useMemo, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "@/lib/utils"
import { createUseDialog } from "./create-use-dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import {
  Download,
  Search,
  File,
  Folder,
  Copy,
  Check,
  FileText,
  Code2,
  Menu,
} from "lucide-react"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { EditorView } from "codemirror"
import { EditorState } from "@codemirror/state"
import { autocompletion } from "@codemirror/autocomplete"
import { basicSetup } from "@/lib/codemirror/basic-setup"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { tsAutocomplete, tsFacet, tsSync } from "@valtown/codemirror-ts"
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs"
import { loadDefaultLibMap } from "@/lib/ts-lib-cache"
import tsModule from "typescript"

interface ViewTsFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialFile?: string
  initialLine?: number
}

interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileNode[]
  content?: string
}

export const ViewTsFilesDialog: React.FC<ViewTsFilesDialogProps> = ({
  open,
  onOpenChange,
  initialFile,
  initialLine,
}) => {
  const [files, setFiles] = useState<Map<string, string>>(new Map())
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [targetLine, setTargetLine] = useState<number | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [tsEnv, setTsEnv] = useState<ReturnType<
    typeof createVirtualTypeScriptEnvironment
  > | null>(null)

  const fileTree = useMemo(() => {
    const tree: FileNode[] = []
    const pathMap: Map<string, FileNode> = new Map()

    Array.from(files.keys()).forEach((originalFilePath) => {
      let filePath = originalFilePath
      if (filePath.startsWith("/")) {
        filePath = filePath.slice(1)
      }
      const parts = filePath.split("/")
      let currentPath = ""

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!pathMap.has(currentPath)) {
          const node: FileNode = {
            name: part,
            path: isFile ? originalFilePath : currentPath,
            type: isFile ? "file" : "folder",
            children: isFile ? undefined : [],
            content: isFile ? files.get(originalFilePath) : undefined,
          }

          pathMap.set(currentPath, node)

          if (index === 0) {
            tree.push(node)
          } else {
            const parentPath = parts.slice(0, index).join("/")
            const parent = pathMap.get(parentPath)
            if (parent?.children) {
              parent.children.push(node)
            }
          }
        }
      })
    })

    return tree
  }, [files])

  const filteredFiles = useMemo(() => {
    if (!searchTerm) return Array.from(files.keys())
    return Array.from(files.keys()).filter(
      (path) =>
        path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        files.get(path)?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [files, searchTerm])

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "ts":
      case "tsx":
        return <Code2 className="w-4 h-4 text-blue-500" />
      case "json":
        return <FileText className="w-4 h-4 text-yellow-500" />
      default:
        return <File className="w-4 h-4 text-gray-500" />
    }
  }

  const fileStats = useMemo(() => {
    const stats = {
      total: files.size,
      ts: 0,
      tsx: 0,
      json: 0,
      other: 0,
      totalSize: 0,
    }

    Array.from(files.entries()).forEach(([path, content]) => {
      const ext = path.split(".").pop()?.toLowerCase()
      stats.totalSize += content.length

      switch (ext) {
        case "ts":
          stats.ts++
          break
        case "tsx":
          stats.tsx++
          break
        case "json":
          stats.json++
          break
        default:
          stats.other++
          break
      }
    })

    return stats
  }, [files])

  useEffect(() => {
    if (!editorRef.current || !selectedFile) return

    const content = files.get(selectedFile) || ""
    const isJson = selectedFile.endsWith(".json")

    if (viewRef.current) {
      viewRef.current.destroy()
    }

    const extensions = [
      basicSetup,
      isJson ? json() : javascript({ typescript: true, jsx: true }),
      EditorState.readOnly.of(true),
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "14px",
        },
        ".cm-content": {
          padding: "16px",
          minHeight: "100%",
        },
        ".cm-focused": {
          outline: "none",
        },
        ".cm-editor": {
          height: "100%",
        },
        ".cm-scroller": {
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
        },
      }),
    ]

    if (
      tsEnv &&
      !isJson &&
      (selectedFile.endsWith(".ts") || selectedFile.endsWith(".tsx"))
    ) {
      extensions.push(
        tsFacet.of({
          env: tsEnv,
          path: selectedFile.startsWith("/")
            ? selectedFile.slice(1)
            : selectedFile,
        }),
        tsSync(),
        autocompletion({ override: [tsAutocomplete()] }),
        EditorView.domEventHandlers({
          click: (event, view) => {
            if (event.ctrlKey || event.metaKey) {
              const pos = view.posAtCoords({
                x: event.clientX,
                y: event.clientY,
              })
              if (pos !== null) {
                const path = selectedFile.startsWith("/")
                  ? selectedFile.slice(1)
                  : selectedFile
                const definitions =
                  tsEnv.languageService.getDefinitionAtPosition(path, pos)
                if (definitions && definitions.length > 0) {
                  const definition = definitions[0]
                  const definitionFileName = definition.fileName
                  if (definitionFileName && files.has(definitionFileName)) {
                    const definitionContent =
                      files.get(definitionFileName) || ""
                    const lines = definitionContent
                      .substring(0, definition.textSpan.start)
                      .split("\n")
                    const lineNumber = lines.length

                    setSelectedFile(definitionFileName)
                    setTargetLine(lineNumber)
                    return true
                  }
                }
              }
            }
            return false
          },
        }),
      )
    }

    const state = EditorState.create({
      doc: content,
      extensions,
    })

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    })

    if (targetLine && targetLine > 0) {
      const scrollToLine = () => {
        if (viewRef.current) {
          const doc = viewRef.current.state.doc
          if (targetLine <= doc.lines) {
            const line = doc.line(targetLine)

            const performScroll = () => {
              if (viewRef.current) {
                viewRef.current.dispatch({
                  selection: { anchor: line.from, head: line.to },
                  effects: EditorView.scrollIntoView(line.from, {
                    y: "center",
                  }),
                })

                setTimeout(() => {
                  if (viewRef.current) {
                    viewRef.current.dispatch({
                      effects: EditorView.scrollIntoView(line.from, {
                        y: "center",
                      }),
                    })

                    setTimeout(() => {
                      if (viewRef.current) {
                        viewRef.current.dispatch({
                          effects: EditorView.scrollIntoView(line.from, {
                            y: "center",
                          }),
                        })
                      }
                    }, 200)
                  }
                }, 150)
              }
            }

            requestAnimationFrame(performScroll)
          }
        }
      }

      // Extra delay when TypeScript environment is not ready or for large line numbers
      // This handles cases when triggered from CodeEditor.tsx with TypeScript definitions
      const isLargeLine = targetLine > 100
      const needsExtraDelay = !tsEnv || isLargeLine
      const initialDelay = needsExtraDelay ? 500 : 200

      setTimeout(scrollToLine, initialDelay)
      setTargetLine(null)
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [selectedFile, files, targetLine, tsEnv])

  useEffect(() => {
    if (open && window.__DEBUG_CODE_EDITOR_FS_MAP) {
      setFiles(window.__DEBUG_CODE_EDITOR_FS_MAP)

      if (window.__DEBUG_CODE_EDITOR_FS_MAP.size > 0) {
        let fileToSelect: string
        if (initialFile && window.__DEBUG_CODE_EDITOR_FS_MAP.has(initialFile)) {
          fileToSelect = initialFile
          if (initialLine) {
            setTargetLine(initialLine)
          }
        } else {
          fileToSelect = Array.from(window.__DEBUG_CODE_EDITOR_FS_MAP.keys())[0]
        }

        setSelectedFile(fileToSelect)

        let normalizedPath = fileToSelect
        if (normalizedPath.startsWith("/")) {
          normalizedPath = normalizedPath.slice(1)
        }
        const pathParts = normalizedPath.split("/")
        const foldersToExpand = new Set<string>()
        let currentPath = ""
        pathParts.slice(0, -1).forEach((part) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part
          foldersToExpand.add(currentPath)
        })
        setExpandedFolders(foldersToExpand)
      }
    }
  }, [open, initialFile, initialLine])

  useEffect(() => {
    if (files.size > 0) {
      const setupTsEnv = async () => {
        try {
          const libMap = await loadDefaultLibMap()
          const system = createSystem(new Map([...libMap, ...files]))
          const env = createVirtualTypeScriptEnvironment(system, [], tsModule)
          setTsEnv(env)
        } catch (error) {
          console.error("Failed to setup TypeScript environment:", error)
        }
      }
      setupTsEnv()
    }
  }, [files])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && selectedFile) {
        setSidebarOpen(false)
      } else if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [selectedFile])

  const copyToClipboard = async (content: string, filename: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(filename)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const downloadAllFiles = async () => {
    const zip = new JSZip()

    files.forEach((content, filename) => {
      let normalizedFilename = filename
      if (normalizedFilename.startsWith("/")) {
        normalizedFilename = normalizedFilename.slice(1)
      }

      zip.file(normalizedFilename, content)
    })

    try {
      const blob = await zip.generateAsync({ type: "blob" })
      saveAs(blob, "typescript-files.zip")
    } catch (error) {
      console.error("Error generating ZIP:", error)
    }
  }

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath)
      } else {
        newSet.add(folderPath)
      }
      return newSet
    })
  }

  const selectFile = (filePath: string) => {
    setSelectedFile(filePath)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm transition-colors",
            selectedFile === node.path &&
              "bg-blue-50 border-l-2 border-l-blue-500",
            level > 0 && "ml-4",
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path)
            } else {
              selectFile(node.path)
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              <Folder
                className={cn(
                  "w-4 h-4 text-gray-600",
                  expandedFolders.has(node.path) && "text-blue-600",
                )}
              />
              <span className="text-sm font-medium text-gray-700">
                {node.name}
              </span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {node.children?.length || 0}
              </Badge>
            </>
          ) : (
            <>
              {getFileIcon(node.name)}
              <span className="text-sm text-gray-800 flex-1 truncate">
                {node.name}
              </span>
              <span className="text-xs text-gray-500 ml-auto">
                {node.content
                  ? `${Math.round(node.content.length / 1024)}KB`
                  : "0KB"}
              </span>
            </>
          )}
        </div>
        {node.type === "folder" &&
          expandedFolders.has(node.path) &&
          node.children && (
            <div>{renderFileTree(node.children, level + 1)}</div>
          )}
      </div>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex !w-full flex-col transition-all duration-300",
          "!max-w-6xl !w-[80vw] h-[85vh] max-h-[90vh]",
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-4">
            <DialogTitle className="text-xl font-semibold">
              TypeScript Files
            </DialogTitle>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline">{fileStats.total} files</Badge>
              <Badge variant="outline">
                {Math.round(fileStats.totalSize / 1024)}KB total
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={downloadAllFiles}>
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Download All</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden gap-4">
          <div
            className={cn(
              "flex flex-col border-r bg-gray-50/50 transition-all duration-200",
              sidebarOpen ? "w-80 md:w-80 sm:w-64" : "w-0 overflow-hidden",
              "md:relative absolute md:z-0 z-10 md:bg-gray-50/50 bg-white md:shadow-none shadow-lg",
            )}
          >
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div className="p-3 border-b">
              <div className="flex flex-wrap gap-1">
                {fileStats.ts > 0 && (
                  <Badge variant="secondary">{fileStats.ts} .ts</Badge>
                )}
                {fileStats.tsx > 0 && (
                  <Badge variant="secondary">{fileStats.tsx} .tsx</Badge>
                )}
                {fileStats.json > 0 && (
                  <Badge variant="secondary">{fileStats.json} .json</Badge>
                )}
                {fileStats.other > 0 && (
                  <Badge variant="secondary">{fileStats.other} other</Badge>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {searchTerm ? (
                  <div className="space-y-1">
                    {filteredFiles.map((filePath) => (
                      <div
                        key={filePath}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-sm transition-colors",
                          selectedFile === filePath &&
                            "bg-blue-50 border-l-2 border-l-blue-500",
                        )}
                        onClick={() => selectFile(filePath)}
                      >
                        {getFileIcon(filePath)}
                        <span className="text-sm text-gray-800 flex-1 truncate">
                          {filePath}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>{renderFileTree(fileTree)}</div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between p-3 border-b bg-white">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(selectedFile)}
                    <span className="font-medium text-gray-900 truncate">
                      {selectedFile}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {files.get(selectedFile)?.length || 0} chars
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        files.get(selectedFile) || "",
                        selectedFile,
                      )
                    }
                    className="shrink-0"
                  >
                    {copiedFile === selectedFile ? (
                      <>
                        <Check className="w-4 h-4 sm:mr-2 text-green-600" />
                        <span className="hidden sm:inline">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div ref={editorRef} className="h-full" />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a file to view</p>
                  <p className="text-sm">
                    Choose from {files.size} available files
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 md:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-4 h-4 mr-2" />
                    Show Files
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const useViewTsFilesDialog = createUseDialog(ViewTsFilesDialog)
