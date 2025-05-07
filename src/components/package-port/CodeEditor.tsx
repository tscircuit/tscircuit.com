import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { basicSetup } from "@/lib/codemirror/basic-setup"
import { autocompletion } from "@codemirror/autocomplete"
import { indentWithTab } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { EditorState } from "@codemirror/state"
import { Decoration, hoverTooltip, keymap } from "@codemirror/view"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import type { ATABootstrapConfig } from "@typescript/ata"
import { setupTypeAcquisition } from "@typescript/ata"
import { TSCI_PACKAGE_PATTERN } from "@/lib/constants"
import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs"
import {
  tsAutocomplete,
  tsFacet,
  tsLinter,
  tsSync,
} from "@valtown/codemirror-ts"
import { EditorView } from "codemirror"
import { useEffect, useMemo, useRef, useState } from "react"
import ts from "typescript"
import CodeEditorHeader from "@/components/package-port/CodeEditorHeader"
import { useCodeCompletionApi } from "@/hooks/use-code-completion-ai-api"
import FileSidebar from "../FileSidebar"
import { findTargetFile } from "@/lib/utils/findTargetFile"
import type { PackageFile } from "./CodeAndPreview"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
const defaultImports = `
import React from "@types/react/jsx-runtime"
import { Circuit, createUseComponent } from "@tscircuit/core"
import type { CommonLayoutProps } from "@tscircuit/props"
`

export const CodeEditor = ({
  onCodeChange,
  onDtsChange,
  readOnly = false,
  files = [],
  isStreaming = false,
  showImportAndFormatButtons = true,
  onFileContentChanged,
  pkgFilesLoaded,
}: {
  onCodeChange: (code: string, filename?: string) => void
  onDtsChange?: (dts: string) => void
  files: PackageFile[]
  readOnly?: boolean
  isStreaming?: boolean
  pkgFilesLoaded?: boolean
  showImportAndFormatButtons?: boolean
  onFileContentChanged?: (path: string, content: string) => void
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const ataRef = useRef<ReturnType<typeof setupTypeAcquisition> | null>(null)
  const apiUrl = useSnippetsBaseApiUrl()
  const codeCompletionApi = useCodeCompletionApi()
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const [code, setCode] = useState(files[0]?.content || "")
  const [currentFile, setCurrentFile] = useState<string>("")
  const [isCodeEditorReady, setIsCodeEditorReady] = useState(false)

  const { highlighter, isLoading } = useShikiHighlighter()

  // Get URL search params for file_path
  const urlParams = new URLSearchParams(window.location.search)
  const filePathFromUrl = urlParams.get("file_path")

  const entryPointFileName = useMemo(() => {
    const entryPointFile = findTargetFile(files, null)
    if (entryPointFile?.path) return entryPointFile.path
    return files.find((x) => x.path === "index.tsx")?.path || "index.tsx"
  }, [files])

  // Set current file on component mount
  useEffect(() => {
    if (files.length === 0 || !pkgFilesLoaded || currentFile) return

    const targetFile = findTargetFile(files, filePathFromUrl)

    if (targetFile) {
      setCurrentFile(targetFile.path)
      setCode(targetFile.content)
    }
  }, [filePathFromUrl, pkgFilesLoaded])

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

  useEffect(() => {
    if (!editorRef.current) return

    const fsMap = new Map<string, string>()
    files.forEach(({ path, content }) => {
      fsMap.set(`${path.startsWith("/") ? "" : "/"}${path}`, content)
    })
    ;(window as any).__DEBUG_CODE_EDITOR_FS_MAP = fsMap

    createDefaultMapFromCDN(
      { target: ts.ScriptTarget.ES2022 },
      "5.6.3",
      true,
      ts,
    ).then((defaultFsMap) => {
      defaultFsMap.forEach((content, filename) => {
        fsMap.set(filename, content)
      })
    })

    const system = createSystem(fsMap)
    const env = createVirtualTypeScriptEnvironment(system, [], ts, {
      jsx: ts.JsxEmit.ReactJSX,
      declaration: true,
      allowJs: true,
      target: ts.ScriptTarget.ES2022,
      resolveJsonModule: true,
    })

    // Add alias for tscircuit -> @tscircuit/core
    const tscircuitAliasDeclaration = `declare module "tscircuit" { export * from "@tscircuit/core"; }`
    env.createFile("tscircuit-alias.d.ts", tscircuitAliasDeclaration)

    // Initialize ATA
    const ataConfig: ATABootstrapConfig = {
      projectName: "my-project",
      typescript: ts,
      logger: console,
      fetcher: async (input: RequestInfo | URL, init?: RequestInit) => {
        const registryPrefixes = [
          "https://data.jsdelivr.com/v1/package/resolve/npm/@tsci/",
          "https://data.jsdelivr.com/v1/package/npm/@tsci/",
          "https://cdn.jsdelivr.net/npm/@tsci/",
        ]
        if (
          typeof input === "string" &&
          registryPrefixes.some((prefix) => input.startsWith(prefix))
        ) {
          const fullPackageName = input
            .replace(registryPrefixes[0], "")
            .replace(registryPrefixes[1], "")
            .replace(registryPrefixes[2], "")
          const packageName = fullPackageName.split("/")[0].replace(/\./, "/")
          const pathInPackage = fullPackageName.split("/").slice(1).join("/")
          const jsdelivrPath = `${packageName}${
            pathInPackage ? `/${pathInPackage}` : ""
          }`
          return fetch(
            `${apiUrl}/snippets/download?jsdelivr_resolve=${input.includes(
              "/resolve/",
            )}&jsdelivr_path=${encodeURIComponent(jsdelivrPath)}`,
          )
        }
        return fetch(input, init)
      },
      delegate: {
        finished: () => {
          setIsCodeEditorReady(true)
        },
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
          if (viewRef.current) {
            viewRef.current.dispatch({
              changes: {
                from: 0,
                to: viewRef.current.state.doc.length,
                insert: viewRef.current.state.doc.toString(),
              },
              selection: viewRef.current.state.selection,
            })
          }
        },
      },
    }

    const ata = setupTypeAcquisition(ataConfig)
    ataRef.current = ata

    const lastFilesEventContent: Record<string, string> = {}

    // Set up base extensions
    const baseExtensions = [
      basicSetup,
      currentFile.endsWith(".json")
        ? json()
        : javascript({ typescript: true, jsx: true }),
      keymap.of([indentWithTab]),
      EditorState.readOnly.of(readOnly),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newContent = update.state.doc.toString()

          if (newContent === lastFilesEventContent[currentFile]) return
          lastFilesEventContent[currentFile] = newContent

          // setCode(newContent)
          onCodeChange(newContent, currentFile)
          onFileContentChanged?.(currentFile, newContent)

          // Generate TypeScript declarations for TypeScript/TSX files
          if (currentFile.endsWith(".ts") || currentFile.endsWith(".tsx")) {
            const { outputFiles } = env.languageService.getEmitOutput(
              currentFile,
              true,
            )
            const dtsFile = outputFiles.find((file) =>
              file.name.endsWith(".d.ts"),
            )
            if (dtsFile?.text && onDtsChange) {
              onDtsChange(dtsFile.text)
            }
          }
        }
        if (update.selectionSet) {
          const pos = update.state.selection.main.head
          setCursorPosition(pos)
        }
      }),
    ]
    if (codeCompletionApi?.apiKey) {
      baseExtensions.push(
        // copilotPlugin({
        //   apiKey: codeCompletionApi.apiKey,
        //   language: Language.TYPESCRIPT,
        // }),
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
      currentFile.endsWith(".tsx") || currentFile.endsWith(".ts")
        ? [
            tsFacet.of({
              env,
              path: currentFile.endsWith(".ts")
                ? currentFile.replace(/\.ts$/, ".tsx")
                : currentFile,
            }),
            tsSync(),
            tsLinter(),
            autocompletion({ override: [tsAutocomplete()] }),
            hoverTooltip((view, pos) => {
              const line = view.state.doc.lineAt(pos)
              const lineStart = line.from
              const lineEnd = line.to
              const lineText = view.state.sliceDoc(lineStart, lineEnd)
              const matches = Array.from(
                lineText.matchAll(TSCI_PACKAGE_PATTERN),
              )

              for (const match of matches) {
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
              const content = ts.displayPartsToString(info.displayParts || [])

              const dom = document.createElement("div")
              if (highlighter) {
                dom.innerHTML = highlighter.codeToHtml(content, {
                  lang: "typescript",
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
                const matches = Array.from(
                  lineText.matchAll(TSCI_PACKAGE_PATTERN),
                )
                for (const match of matches) {
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
            }),
            EditorView.decorations.of((view) => {
              const decorations = []
              for (const { from, to } of view.visibleRanges) {
                for (let pos = from; pos < to; ) {
                  const line = view.state.doc.lineAt(pos)
                  const lineText = line.text
                  const matches = lineText.matchAll(TSCI_PACKAGE_PATTERN)
                  for (const match of matches) {
                    if (match.index !== undefined) {
                      const start = line.from + match.index
                      const end = start + match[0].length
                      decorations.push(
                        Decoration.mark({
                          class: "cm-underline",
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
      doc: fileMap[currentFile] || "",
      extensions: [...baseExtensions, ...tsExtensions],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    if (currentFile.endsWith(".tsx") || currentFile.endsWith(".ts")) {
      ata(`${defaultImports}${code}`)
    }

    return () => {
      view.destroy()
    }
  }, [!isStreaming, currentFile, code !== ""])

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

  const updateEditorToMatchCurrentFile = () => {
    const currentContent = fileMap[currentFile] || ""
    updateCurrentEditorContent(currentContent)
  }

  const codeImports = getImportsFromCode(code)

  useEffect(() => {
    if (
      ataRef.current &&
      (currentFile.endsWith(".tsx") || currentFile.endsWith(".ts"))
    ) {
      ataRef.current(`${defaultImports}${code}`)
    }
  }, [codeImports])

  const handleFileChange = (path: string) => {
    setCurrentFile(path)
    try {
      // Set url query to file path
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.set("file_path", path)
      window.history.replaceState(null, "", `?${urlParams.toString()}`)
    } catch {}
  }

  const updateFileContent = (path: string, newContent: string) => {
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

  if (isStreaming) {
    return <div className="font-mono whitespace-pre-wrap text-xs">{code}</div>
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <FileSidebar
        files={Object.fromEntries(files.map((f) => [f.path, f.content]))}
        currentFile={currentFile}
        fileSidebarState={
          [sidebarOpen, setSidebarOpen] as ReturnType<typeof useState<boolean>>
        }
        onFileSelect={handleFileChange}
      />
      <div className="flex flex-col flex-1 w-full min-w-0 h-full">
        {showImportAndFormatButtons && (
          <CodeEditorHeader
            entrypointFileName={entryPointFileName}
            fileSidebarState={
              [sidebarOpen, setSidebarOpen] as ReturnType<
                typeof useState<boolean>
              >
            }
            currentFile={currentFile}
            files={Object.fromEntries(files.map((f) => [f.path, f.content]))}
            updateFileContent={updateFileContent}
            handleFileChange={handleFileChange}
          />
        )}
        <div
          ref={editorRef}
          className={`flex-1 overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:!h-full ${
            !isCodeEditorReady ? "opacity-50" : ""
          }`}
        />
      </div>
    </div>
  )
}
