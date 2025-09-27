import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useHotkeyCombo } from "@/hooks/use-hotkey"
import { basicSetup } from "@/lib/codemirror/basic-setup"
import {
  autocompletion,
  acceptCompletion,
  completionStatus,
} from "@codemirror/autocomplete"
import { indentWithTab, indentMore } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { EditorState, Prec } from "@codemirror/state"
import { Decoration, hoverTooltip, keymap } from "@codemirror/view"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import type { ATABootstrapConfig } from "@typescript/ata"
import { setupTypeAcquisition } from "@typescript/ata"
import { linter } from "@codemirror/lint"
import {
  TSCI_PACKAGE_PATTERN,
  LOCAL_FILE_IMPORT_PATTERN,
} from "@/lib/constants"
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs"
import { loadDefaultLibMap } from "@/lib/ts-lib-cache"
import { tsAutocomplete, tsFacet, tsSync } from "@valtown/codemirror-ts"
import { getLints } from "@valtown/codemirror-ts"
import { EditorView } from "codemirror"
import { useEffect, useMemo, useRef, useState } from "react"
import tsModule from "typescript"
import CodeEditorHeader, {
  FileName,
} from "@/components/package-port/CodeEditorHeader"
import FileSidebar from "../FileSidebar"
import { findTargetFile } from "@/lib/utils/findTargetFile"
import type { PackageFile } from "@/types/package"
import type { Package } from "fake-snippets-api/lib/db/schema"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import QuickOpen from "./QuickOpen"
import GlobalFindReplace from "./GlobalFindReplace"
import {
  ICreateFileProps,
  ICreateFileResult,
  IDeleteFileProps,
  IDeleteFileResult,
  IRenameFileProps,
  IRenameFileResult,
} from "@/hooks/useFileManagement"
import { AtaSaveBlocker } from "@/lib/ata-fetcher"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"
import { inlineCopilot } from "codemirror-copilot"
import { useViewTsFilesDialog } from "@/components/dialogs/view-ts-files-dialog"
import { Loader2 } from "lucide-react"

const defaultImports = `
import React from "@types/react/jsx-runtime"
import { Circuit, createUseComponent } from "@tscircuit/core"
import type { CommonLayoutProps } from "@tscircuit/props"
`

export const CodeEditor = ({
  onCodeChange,
  isPriorityFileFetched,
  readOnly = false,
  files = [],
  isSaving = false,
  isStreaming = false,
  showImportAndFormatButtons = true,
  onFileContentChanged,
  pkgFilesLoaded,
  currentFile,
  onFileSelect,
  handleRenameFile,
  handleCreateFile,
  handleDeleteFile,
  pkg,
  isFullyLoaded = false,
  totalFilesCount = 0,
  loadedFilesCount = 0,
}: {
  onCodeChange: (code: string, filename?: string) => void
  files: PackageFile[]
  isPriorityFileFetched: boolean
  isSaving?: boolean
  handleCreateFile: (props: ICreateFileProps) => ICreateFileResult
  handleDeleteFile: (props: IDeleteFileProps) => IDeleteFileResult
  handleRenameFile: (props: IRenameFileProps) => IRenameFileResult
  pkg?: Package
  readOnly?: boolean
  isStreaming?: boolean
  pkgFilesLoaded?: boolean
  showImportAndFormatButtons?: boolean
  onFileContentChanged?: (path: string, content: string) => void
  currentFile: string | null
  onFileSelect: (path: string, lineNumber?: number) => void
  isFullyLoaded?: boolean
  totalFilesCount?: number
  loadedFilesCount?: number
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const ataRef = useRef<ReturnType<typeof setupTypeAcquisition> | null>(null)
  const lastReceivedTsFileTimeRef = useRef<number>(0)
  const saveBlocker = useMemo(() => new AtaSaveBlocker(), [])
  const apiUrl = useApiBaseUrl()
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const [code, setCode] = useState(files[0]?.content || "")
  const [fontSize, setFontSize] = useState(14)
  const [showQuickOpen, setShowQuickOpen] = useState(false)
  const [showGlobalFindReplace, setShowGlobalFindReplace] = useState(false)
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const highlightTimeoutRef = useRef<number | null>(null)

  const { highlighter } = useShikiHighlighter()

  // Get URL search params for file_path
  const urlParams = new URLSearchParams(window.location.search)
  const filePathFromUrl = urlParams.get("file_path")
  const lineNumberFromUrl = urlParams.get("line")
  const [aiAutocompleteEnabled, setAiAutocompleteEnabled] = useState(false)
  const { Dialog: ViewTsFilesDialog, openDialog: openViewTsFilesDialog } =
    useViewTsFilesDialog()

  const entryPointFileName = useMemo(() => {
    const entryPointFile = findTargetFile({ files, filePathFromUrl: null })
    if (entryPointFile?.path) return entryPointFile.path
    return files.find((x) => x.path === "index.tsx")?.path || "index.tsx"
  }, [files])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCreatingFile, setIsCreatingFile] = useState(false)

  // Set current file on component mount - only when explicitly requested via URL
  useEffect(() => {
    if (files.length === 0 || !pkgFilesLoaded || currentFile) return

    // Only run this if there's an explicit file_path in URL - don't auto-select files
    if (!filePathFromUrl) return

    const targetFile = findTargetFile({ files, filePathFromUrl })
    if (targetFile) {
      const lineNumber = lineNumberFromUrl
        ? parseInt(lineNumberFromUrl, 10)
        : undefined
      handleFileChange(targetFile.path, lineNumber)
      setCode(targetFile.content)
    }
  }, [filePathFromUrl, lineNumberFromUrl, pkgFilesLoaded])

  const fileMap = useMemo(() => {
    const map: Record<string, string> = {}
    files.forEach((file) => {
      map[file.path] = file.content
    })
    return map
  }, [files])

  useEffect(() => {
    const currentFileContent =
      files.find((f) => f.path === currentFile)?.content || ""
    if (currentFileContent !== code) {
      setCode(currentFileContent)
      updateCurrentEditorContent(currentFileContent)
    }
  }, [files])

  // Whenever streaming completes, reset the code to the initial code
  useEffect(() => {
    if (!isStreaming) {
      const currentFileContent =
        files.find((f) => f.path === currentFile)?.content || ""
      if (code !== currentFileContent && currentFileContent) {
        setCode(currentFileContent)
        setTimeout(() => {
          updateCurrentEditorContent(currentFileContent)
        }, 200)
      }
    }
  }, [isStreaming])

  useHotkeyCombo(
    "cmd+b",
    () => {
      setSidebarOpen((prev) => !prev)
    },
    { target: window },
  )

  useEffect(() => {
    if (!editorRef.current) return

    const fsMap = new Map<string, string>()
    files.forEach(({ path, content }) => {
      fsMap.set(`${path.startsWith("/") ? "" : "/"}${path}`, content)
    })
    ;(window as any).__DEBUG_CODE_EDITOR_FS_MAP = fsMap

    loadDefaultLibMap().then((defaultFsMap) => {
      defaultFsMap.forEach((content, filename) => {
        fsMap.set(filename, content)
      })
    })

    const system = createSystem(fsMap)

    const env = createVirtualTypeScriptEnvironment(system, [], tsModule, {
      jsx: tsModule.JsxEmit.ReactJSX,
      declaration: true,
      allowJs: true,
      target: tsModule.ScriptTarget.ES2022,
      resolveJsonModule: true,
    })

    // Add alias for tscircuit -> @tscircuit/core
    const tscircuitAliasDeclaration = `declare module "tscircuit" { export * from "@tscircuit/core"; }`
    env.createFile("tscircuit-alias.d.ts", tscircuitAliasDeclaration)

    // Initialize ATA
    const ataConfig: ATABootstrapConfig = {
      projectName: "my-project",
      typescript: tsModule,
      logger: console,
      fetcher: saveBlocker.createFetcher(apiUrl) as typeof fetch,
      delegate: {
        started: () => {
          const manualEditsTypeDeclaration = `
				  declare module "manual-edits.json" {
				  const value: {
					  pcb_placements?: any[],
            schematic_placements?: any[],
					  edit_events?: any[],
					  manual_trace_hints?: any[],
				  } | undefined;
				  export default value;
				}
			`
          env.createFile("manual-edits.d.ts", manualEditsTypeDeclaration)
        },
        receivedFile: (code: string, path: string) => {
          fsMap.set(path, code)
          env.createFile(path, code)
          if (/\.tsx?$|\.d\.ts$/.test(path)) {
            lastReceivedTsFileTimeRef.current = Date.now()
          }
          // Avoid dispatching a view update when ATA downloads files. Dispatching
          // here caused the editor to reset the user's selection, which made text
          // selection impossible while dependencies were loading.
        },
      },
    }

    const ata = setupTypeAcquisition(ataConfig)
    ataRef.current = ata

    const lastFilesEventContent: Record<string, string> = {}

    // Set up base extensions
    const baseExtensions = [
      basicSetup,
      currentFile?.endsWith(".json")
        ? json()
        : javascript({ typescript: true, jsx: true }),
      Prec.high(
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => true,
          },
          {
            key: "Tab",
            run: (view) => {
              if (completionStatus(view.state) === "active") {
                return acceptCompletion(view)
              }
              return indentMore(view)
            },
          },
          {
            key: "Mod-p",
            run: () => {
              setShowQuickOpen(true)
              return true
            },
          },
          {
            key: "Mod-Shift-f",
            run: () => {
              setShowGlobalFindReplace(true)
              return true
            },
          },
        ]),
      ),
      keymap.of([indentWithTab]),
      EditorState.readOnly.of(readOnly || isSaving),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString()
          if (!currentFile) return
          if (newContent === lastFilesEventContent[currentFile]) return
          lastFilesEventContent[currentFile] = newContent

          // setCode(newContent)
          onCodeChange(newContent, currentFile)
          onFileContentChanged?.(currentFile, newContent)
        }
        if (update.selectionSet) {
          const pos = update.state.selection.main.head
          setCursorPosition(pos)
        }
      }),
      EditorView.theme({
        ".cm-editor": {
          fontSize: `${fontSize}px`,
        },
        ".cm-content": {
          fontSize: `${fontSize}px`,
        },
        ".cm-line-highlight": {
          backgroundColor: "#dbeafe !important",
          animation: "lineHighlightFade 3s ease-in-out forwards",
        },
        "@keyframes lineHighlightFade": {
          "0%": { backgroundColor: "#93c5fd" },
          "100%": { backgroundColor: "transparent" },
        },
      }),
      EditorView.domEventHandlers({
        wheel: (event) => {
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            const delta = event.deltaY
            setFontSize((prev) => {
              const newSize =
                delta > 0 ? Math.max(8, prev - 1) : Math.min(32, prev + 1)
              return newSize
            })
            return true
          }
          return false
        },
      }),
      EditorView.decorations.of((view) => {
        const decorations = []
        if (highlightedLine) {
          const doc = view.state.doc
          if (highlightedLine >= 1 && highlightedLine <= doc.lines) {
            const line = doc.line(highlightedLine)
            decorations.push(
              Decoration.line({
                class: "cm-line-highlight",
              }).range(line.from),
            )
          }
        }
        return Decoration.set(decorations)
      }),
    ]
    if (aiAutocompleteEnabled) {
      baseExtensions.push(
        inlineCopilot(async (prefix, suffix) => {
          const res = await fetch(
            `${apiUrl}/autocomplete/create_autocomplete`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prefix,
                suffix,
                language: "typescript",
              }),
            },
          )

          const { prediction } = await res.json()
          return prediction
        }),
        EditorView.theme({
          ".cm-ghostText, .cm-ghostText *": {
            opacity: "0.6",
            filter: "grayscale(20%)",
            cursor: "pointer",
          },
          ".cm-ghostText:hover": {
            background: "#eee",
          },
        }),
      )
    }

    // Add TypeScript-specific extensions and handlers
    const tsExtensions =
      currentFile?.endsWith(".tsx") || currentFile?.endsWith(".ts")
        ? [
            tsFacet.of({
              env,
              path: currentFile?.endsWith(".ts")
                ? currentFile?.replace(/\.ts$/, ".tsx")
                : currentFile,
            }),
            tsSync(),
            linter(async (view) => {
              if (Date.now() - lastReceivedTsFileTimeRef.current < 3000) {
                return []
              }
              const config = view.state.facet(tsFacet)
              return config
                ? getLints({
                    ...config,
                    diagnosticCodesToIgnore: [],
                  })
                : []
            }),
            autocompletion({ override: [tsAutocomplete()] }),
            hoverTooltip((view, pos) => {
              const line = view.state.doc.lineAt(pos)
              const lineStart = line.from
              const lineEnd = line.to
              const lineText = view.state.sliceDoc(lineStart, lineEnd)

              // Check for TSCI package imports
              const packageMatches = Array.from(
                lineText.matchAll(TSCI_PACKAGE_PATTERN),
              )

              for (const match of packageMatches) {
                if (match.index !== undefined) {
                  const start = lineStart + match.index
                  const end = start + match[0].length
                  if (pos >= start && pos <= end) {
                    return {
                      pos: start,
                      end: end,
                      above: true,
                      create() {
                        const dom = document.createElement("div")
                        dom.textContent = "Ctrl/Cmd+Click to open package"
                        return { dom }
                      },
                    }
                  }
                }
              }
              const facet = view.state.facet(tsFacet)
              if (!facet) return null

              const { env, path } = facet
              const info = env.languageService.getQuickInfoAtPosition(path, pos)
              if (!info) return null

              const start = info.textSpan.start
              const end = start + info.textSpan.length
              const content = tsModule?.displayPartsToString(
                info.displayParts || [],
              )

              const dom = document.createElement("div")
              if (highlighter) {
                dom.innerHTML = highlighter.codeToHtml(content, {
                  lang: "tsx",
                  themes: {
                    light: "github-light",
                    dark: "github-dark",
                  },
                })

                return {
                  pos: start,
                  end,
                  above: true,
                  create: () => ({ dom }),
                }
              }
              return null
            }),
            EditorView.domEventHandlers({
              click: (event, view) => {
                if (!event.ctrlKey && !event.metaKey) return false
                const pos = view.posAtCoords({
                  x: event.clientX,
                  y: event.clientY,
                })
                if (pos === null) return false

                const line = view.state.doc.lineAt(pos)
                const lineStart = line.from
                const lineEnd = line.to
                const lineText = view.state.sliceDoc(lineStart, lineEnd)

                // Check for TSCI package imports first
                const packageMatches = Array.from(
                  lineText.matchAll(TSCI_PACKAGE_PATTERN),
                )
                for (const match of packageMatches) {
                  if (match.index !== undefined) {
                    const start = lineStart + match.index
                    const end = start + match[0].length
                    if (pos >= start && pos <= end) {
                      const importName = match[0]
                      // Handle potential dots and dashes in package names
                      const [owner, name] = importName
                        .replace("@tsci/", "")
                        .split(".")
                      window.open(`/${owner}/${name}`, "_blank")
                      return true
                    }
                  }
                }
                // TypeScript "Go to Definition" functionality
                const facet = view.state.facet(tsFacet)
                if (facet) {
                  const { env, path } = facet
                  const definitions =
                    env.languageService.getDefinitionAtPosition(path, pos)
                  if (definitions && definitions.length > 0) {
                    const definition = definitions[0]
                    const definitionFileName = definition.fileName
                    if (definitionFileName) {
                      const localFilePath = definitionFileName.startsWith("/")
                        ? definitionFileName.replace("/", "")
                        : definitionFileName
                      if (fileMap[localFilePath]) {
                        const definitionContent = fileMap[localFilePath]
                        const lines = definitionContent
                          ?.substring(0, definition.textSpan.start)
                          .split("\n")
                        const lineNumber = lines?.length

                        onFileSelect(localFilePath, lineNumber)
                        return true
                      } else {
                        const definitionContent =
                          env
                            .getSourceFile(definitionFileName)
                            ?.getFullText() || ""
                        const lines = definitionContent
                          .substring(0, definition.textSpan.start)
                          .split("\n")
                        const lineNumber = lines.length
                        openViewTsFilesDialog({
                          initialFile: definitionFileName,
                          initialLine: lineNumber,
                        })
                        return true
                      }
                    }
                  }
                }

                return false
              },
              keydown: (event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault()
                  return true
                }
                return false
              },
            }),
            EditorView.theme({
              ".cm-tooltip-hover": {
                maxWidth: "600px",
                padding: "12px",
                maxHeight: "400px",
                borderRadius: "0.5rem",
                backgroundColor: "#fff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                fontSize: "14px",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                overflow: "auto",
                zIndex: "9999",
              },
              ".cm-import:hover": {
                textDecoration: "underline",
                textDecorationColor: "#aa1111",
                textUnderlineOffset: "1px",
                filter: "brightness(0.7)",
              },
            }),
            EditorView.decorations.of((view) => {
              const decorations = []
              for (const { from, to } of view.visibleRanges) {
                for (let pos = from; pos < to; ) {
                  const line = view.state.doc.lineAt(pos)
                  const lineText = line.text

                  // Add decorations for TSCI package imports
                  const packageMatches = lineText.matchAll(TSCI_PACKAGE_PATTERN)
                  for (const match of packageMatches) {
                    if (match.index !== undefined) {
                      const start = line.from + match.index
                      const end = start + match[0].length
                      decorations.push(
                        Decoration.mark({
                          class: "cm-import cursor-pointer",
                        }).range(start, end),
                      )
                    }
                  }

                  // Add decorations for local file imports
                  const localFileMatches = lineText.matchAll(
                    LOCAL_FILE_IMPORT_PATTERN,
                  )
                  for (const match of localFileMatches) {
                    if (match.index !== undefined) {
                      const start = line.from + match.index
                      const end = start + match[0].length
                      decorations.push(
                        Decoration.mark({
                          class: "cm-import cursor-pointer",
                        }).range(start, end),
                      )
                    }
                  }
                  pos = line.to + 1
                }
              }
              return Decoration.set(decorations)
            }),
          ]
        : []

    const state = EditorState.create({
      doc: fileMap[currentFile || ""] || "",
      extensions: [...baseExtensions, ...tsExtensions],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    if (currentFile?.endsWith(".tsx") || currentFile?.endsWith(".ts")) {
      ata(`${defaultImports}${code}`)
    }

    return () => {
      view.destroy()
      // Clean up any pending highlight timeout
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = null
      }
    }
  }, [
    !isStreaming,
    currentFile,
    Boolean(highlighter),
    isSaving,
    fontSize,
    aiAutocompleteEnabled,
    highlightedLine,
  ])

  const updateCurrentEditorContent = (newContent: string) => {
    if (viewRef.current) {
      const state = viewRef.current.state
      const scrollPos = viewRef.current.scrollDOM.scrollTop
      if (state.doc.toString() !== newContent) {
        viewRef.current.dispatch({
          changes: { from: 0, to: state.doc.length, insert: newContent },
        })
        requestAnimationFrame(() => {
          if (viewRef.current) {
            viewRef.current.scrollDOM.scrollTop = scrollPos
          }
        })
      }
    }
  }

  const navigateToLine = (lineNumber: number) => {
    if (!viewRef.current) return

    const view = viewRef.current
    const doc = view.state.doc

    if (lineNumber < 1 || lineNumber > doc.lines) return

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = null
    }

    const line = doc.line(lineNumber)
    const pos = line.from

    view.dispatch({
      selection: { anchor: pos, head: pos },
      effects: EditorView.scrollIntoView(pos, { y: "center" }),
    })

    setHighlightedLine(lineNumber)

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedLine(null)
      highlightTimeoutRef.current = null
    }, 3000)
  }

  const updateEditorToMatchCurrentFile = () => {
    const currentContent = fileMap[currentFile || ""] || ""
    updateCurrentEditorContent(currentContent)
  }

  const codeImports = getImportsFromCode(code)

  // Sync save state with fetcher blocker
  useEffect(() => {
    saveBlocker.setSaving(isSaving)
  }, [isSaving, saveBlocker])

  useEffect(() => {
    if (
      ataRef.current &&
      (currentFile?.endsWith(".tsx") || currentFile?.endsWith(".ts"))
    ) {
      ataRef.current(`${defaultImports}${code}`)
    }
  }, [codeImports])

  const handleFileChange = (path: string, lineNumber?: number) => {
    onFileSelect(path, lineNumber)
    try {
      // Set url query to file path and line number
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.set("file_path", path)
      if (lineNumber) {
        urlParams.set("line", lineNumber.toString())
      } else {
        urlParams.delete("line")
      }
      window.history.replaceState(null, "", `?${urlParams.toString()}`)
    } catch {}

    // Navigate to line after a short delay to ensure editor is ready
    if (lineNumber) {
      setTimeout(() => {
        navigateToLine(lineNumber)
      }, 100)
    }
  }

  const updateFileContent = (path: FileName | null, newContent: string) => {
    if (!path) return
    if (currentFile === path) {
      setCode(newContent)
      onCodeChange(newContent, path)
    } else {
      fileMap[path] = newContent
    }
    onFileContentChanged?.(path, newContent)

    if (viewRef.current && currentFile === path) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: newContent,
        },
      })
    }
  }

  // Whenever the current file changes, updated the editor content
  useEffect(() => {
    updateEditorToMatchCurrentFile()
  }, [currentFile])

  // Global keyboard listeners
  useHotkeyCombo("cmd+p", () => {
    setShowQuickOpen(true)
  })

  useHotkeyCombo("cmd+shift+f", () => {
    setShowGlobalFindReplace(true)
  })

  useHotkeyCombo("Escape", () => {
    if (showQuickOpen) {
      setShowQuickOpen(false)
    }
    if (showGlobalFindReplace) {
      setShowGlobalFindReplace(false)
    }
  })

  useHotkeyCombo("cmd+m", () => {
    setSidebarOpen(true)
    setIsCreatingFile(true)
  })

  if (isStreaming) {
    return <div className="font-mono whitespace-pre-wrap text-xs">{code}</div>
  }
  return (
    <div className="flex h-[98vh] w-full overflow-hidden">
      <FileSidebar
        files={Object.fromEntries(files.map((f) => [f.path, f.content]))}
        currentFile={currentFile}
        fileSidebarState={
          [sidebarOpen, setSidebarOpen] as ReturnType<typeof useState<boolean>>
        }
        onFileSelect={(path) => handleFileChange(path)}
        handleCreateFile={handleCreateFile}
        handleRenameFile={handleRenameFile}
        handleDeleteFile={handleDeleteFile}
        isCreatingFile={isCreatingFile}
        setIsCreatingFile={setIsCreatingFile}
        pkg={pkg}
        isLoadingFiles={!isFullyLoaded}
        loadingProgress={
          totalFilesCount > 0 ? `${loadedFilesCount}/${totalFilesCount}` : null
        }
      />
      <div className="flex flex-col flex-1 w-full min-w-0 h-full">
        {showImportAndFormatButtons && (
          <CodeEditorHeader
            isLoadingFiles={!isFullyLoaded}
            entrypointFileName={entryPointFileName}
            appendNewFile={(path: string, content: string) => {
              onFileContentChanged?.(path, content)
            }}
            createFile={handleCreateFile}
            fileSidebarState={
              [sidebarOpen, setSidebarOpen] as ReturnType<
                typeof useState<boolean>
              >
            }
            currentFile={currentFile}
            files={Object.fromEntries(files.map((f) => [f.path, f.content]))}
            updateFileContent={updateFileContent}
            handleFileChange={handleFileChange}
            aiAutocompleteState={[
              aiAutocompleteEnabled,
              setAiAutocompleteEnabled,
            ]}
          />
        )}
        <div
          ref={editorRef}
          className={
            "flex-1 overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:!h-full"
          }
          style={{ display: isPriorityFileFetched ? "none" : "block" }}
        />
        {isPriorityFileFetched && (
          <div className="grid place-items-center h-full">
            <Loader2 className="w-16 h-16 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      {showQuickOpen && (
        <QuickOpen
          files={files.filter((f) => !isHiddenFile(f.path))}
          currentFile={currentFile}
          onFileSelect={(path) => handleFileChange(path)}
          onClose={() => setShowQuickOpen(false)}
        />
      )}
      {showGlobalFindReplace && (
        <GlobalFindReplace
          files={files.filter((f) => !isHiddenFile(f.path))}
          currentFile={currentFile}
          onFileSelect={handleFileChange}
          onFileContentChanged={onCodeChange}
          onClose={() => setShowGlobalFindReplace(false)}
        />
      )}
      <ViewTsFilesDialog />
    </div>
  )
}
