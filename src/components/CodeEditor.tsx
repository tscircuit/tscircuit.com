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
import { TSCI_PACKAGE_PATTERN } from "../lib/constants"
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
import CodeEditorHeader from "./CodeEditorHeader"
// import { copilotPlugin, Language } from "@valtown/codemirror-codeium"
import { useCodeCompletionApi } from "@/hooks/use-code-completion-ai-api"
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
  initialCode = "",
  manualEditsFileContent,
  isStreaming = false,
  showImportAndFormatButtons = true,
  onManualEditsFileContentChanged,
}: {
  onCodeChange: (code: string, filename?: string) => void
  onDtsChange?: (dts: string) => void
  initialCode: string
  readOnly?: boolean
  isStreaming?: boolean
  manualEditsFileContent: string
  showImportAndFormatButtons?: boolean
  onManualEditsFileContentChanged?: (newContent: string) => void
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const ataRef = useRef<ReturnType<typeof setupTypeAcquisition> | null>(null)
  const apiUrl = useSnippetsBaseApiUrl()
  const codeCompletionApi = useCodeCompletionApi()

  const { highlighter, isLoading } = useShikiHighlighter()

  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const [code, setCode] = useState(initialCode)

  const files = useMemo(
    () => ({
      "index.tsx": code,
      "manual-edits.json": manualEditsFileContent,
    }),
    [code, manualEditsFileContent],
  )
  const [currentFile, setCurrentFile] =
    useState<keyof typeof files>("index.tsx")

  const isInitialCodeLoaded = Boolean(initialCode)

  useEffect(() => {
    if (initialCode !== code) {
      setCode(initialCode)
      if (currentFile === "index.tsx") {
        updateCurrentEditorContent(initialCode)
      }
    }
  }, [isInitialCodeLoaded])

  // Whenever streaming completes, reset the code to the initial code
  useEffect(() => {
    if (!isStreaming && code !== initialCode && initialCode) {
      setCode(initialCode)

      // HACK: Timeout because we need to wait for the editor to mount again
      setTimeout(() => {
        updateCurrentEditorContent(initialCode)
      }, 200)
    }
  }, [isStreaming])

  useEffect(() => {
    if (!editorRef.current) return

    const fsMap = new Map<string, string>()
    Object.entries(files).forEach(([filename, content]) => {
      fsMap.set(filename, content)
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
          const jsdelivrPath = `${packageName}${pathInPackage ? `/${pathInPackage}` : ""}`
          return fetch(
            `${apiUrl}/snippets/download?jsdelivr_resolve=${input.includes("/resolve/")}&jsdelivr_path=${encodeURIComponent(jsdelivrPath)}`,
          )
        }
        return fetch(input, init)
      },
      delegate: {
        started: () => {
          const manualEditsTypeDeclaration = `
				  declare module "*.json" {
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

          if (currentFile === "index.tsx") {
            setCode(newContent)
            onCodeChange(newContent)
          } else if (currentFile === "manual-edits.json") {
            onManualEditsFileContentChanged?.(newContent)
          }

          if (currentFile === "index.tsx") {
            const { outputFiles } = env.languageService.getEmitOutput(
              currentFile,
              true,
            )
            const indexDts = outputFiles.find(
              (file) => file.name === "index.d.ts",
            )
            if (indexDts?.text && onDtsChange) {
              onDtsChange(indexDts.text)
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
            tsFacet.of({ env, path: currentFile }),
            tsSync(),
            tsLinter(),
            autocompletion({ override: [tsAutocomplete()] }),
            hoverTooltip((view, pos) => {
              const facet = view.state.facet(tsFacet)
              if (!facet) return null

              const { env, path } = facet
              const info = env.languageService.getQuickInfoAtPosition(path, pos)
              if (!info) return null

              const start = info.textSpan.start
              const end = start + info.textSpan.length
              const content = ts.displayPartsToString(info.displayParts || [])

              const dom = document.createElement("div")
              if (isLoading) {
                // Show a loading indicator in the tooltip
                dom.innerHTML = `
                  <div style="display: flex; align-items: center; gap: 8px; border-radius: 0.5rem; 
                   background-color: #fff;
                   border: 1px solid #e2e8f0;
                   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                   font-family: monospace;
                  ">
                    <div class="spinner" style="width: 18px; height: 18px;  animation: spin 1s linear infinite;"></div>
                    <span style="color: #666; font-size: 14px;">Loading...</span>
                  </div>
                `
                const style = document.createElement("style")
                style.textContent = `
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `
                dom.appendChild(style)

                return {
                  pos: start,
                  end,
                  above: true,
                  create: () => ({ dom }),
                }
              }
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
              ".shiki": {
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
      doc: files[currentFile],
      extensions: [...baseExtensions, ...tsExtensions],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    // Initial ATA run for index.tsx
    if (currentFile === "index.tsx") {
      ata(`${defaultImports}${code}`)
    }

    return () => {
      view.destroy()
    }
  }, [!isStreaming, currentFile, code !== "", isLoading])

  const updateCurrentEditorContent = (newContent: string) => {
    if (viewRef.current) {
      const state = viewRef.current.state
      if (state.doc.toString() !== newContent) {
        viewRef.current.dispatch({
          changes: { from: 0, to: state.doc.length, insert: newContent },
        })
      }
    }
  }

  const updateEditorToMatchCurrentFile = () => {
    const currentContent = files[currentFile] || ""
    updateCurrentEditorContent(currentContent)
  }

  const codeImports = getImportsFromCode(code)

  useEffect(() => {
    if (ataRef.current && currentFile === "index.tsx") {
      ataRef.current(`${defaultImports}${code}`)
    }
  }, [codeImports])

  const handleFileChange = (filename: `${string}.${string}`) => {
    setCurrentFile(filename as keyof typeof files)
  }

  const updateFileContent = (
    filename: keyof typeof files,
    newContent: string,
  ) => {
    if (filename === "index.tsx") {
      setCode(newContent)
      onCodeChange(newContent)
    } else if (filename === "manual-edits.json") {
      onManualEditsFileContentChanged?.(newContent)
    }

    if (viewRef.current && currentFile === filename) {
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

  // Whenever the manual edits json content changes, update the editor if
  // it's currently viewing the manual edits file
  useEffect(() => {
    if (currentFile === "manual-edits.json") {
      updateEditorToMatchCurrentFile()
    }
  }, [manualEditsFileContent])

  if (isStreaming) {
    return (
      <div className="font-mono whitespace-pre-wrap text-xs">{initialCode}</div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {showImportAndFormatButtons && (
        <CodeEditorHeader
          currentFile={currentFile}
          files={files}
          handleFileChange={handleFileChange}
          updateFileContent={(...args) => {
            return updateFileContent(
              ...(args as Parameters<typeof updateFileContent>),
            )
          }}
        />
      )}
      <div ref={editorRef} className="flex-1 overflow-auto" />
    </div>
  )
}
