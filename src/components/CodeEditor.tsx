import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { autocompletion } from "@codemirror/autocomplete"
import { indentWithTab } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { EditorState } from "@codemirror/state"
import { Decoration, hoverTooltip, keymap } from "@codemirror/view"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import { setupTypeAcquisition } from "@typescript/ata"
import type { ATABootstrapConfig } from "@typescript/ata"
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs"
import {
  tsAutocomplete,
  tsFacet,
  tsHover,
  tsLinter,
  tsSync,
} from "@valtown/codemirror-ts"
import { EditorView, basicSetup } from "codemirror"
import ts from "typescript"
import { useImportSnippetDialog } from "./dialogs/import-snippet-dialog"

export const CodeEditor = ({
  onCodeChange,
  onDtsChange,
  readOnly = false,
  code = "",
  isStreaming = false,
}: {
  onCodeChange: (code: string, filename?: string) => void
  onDtsChange?: (dts: string) => void
  code: string
  readOnly?: boolean
  isStreaming?: boolean
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const ataRef = useRef<ReturnType<typeof setupTypeAcquisition> | null>(null)
  const { Dialog: ImportSnippetDialog, openDialog: openImportDialog } =
    useImportSnippetDialog()
  const { toast } = useToast()

  const [files, setFiles] = useState<Record<string, string>>({
    "index.tsx": code,
    "manual-edits.json": "",
  })
  const [currentFile, setCurrentFile] = useState("index.tsx")

  useEffect(() => {
    if (code !== files["index.tsx"]) {
      setFiles((prev) => ({
        ...prev,
        "index.tsx": code,
      }))
    }
  }, [code])

  const handleImportClick = (importName: string) => {
    const [owner, name] = importName.replace("@tsci/", "").split(".")
    window.open(`/${owner}/${name}`, "_blank")
  }

  useEffect(() => {
    if (!editorRef.current) return

    const fsMap = new Map<string, string>()
    Object.entries(files).forEach(([filename, content]) => {
      fsMap.set(filename, content)
    })

    const system = createSystem(fsMap)
    const env = createVirtualTypeScriptEnvironment(system, [], ts, {
      jsx: ts.JsxEmit.ReactJSX,
      declaration: true,
      allowJs: true,
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
            `/snippets/download?jsdelivr_resolve=${input.includes("/resolve/")}&jsdelivr_path=${encodeURIComponent(jsdelivrPath)}`,
          )
        }
        return fetch(input, init)
      },
      delegate: {
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
            })
          }
        },
      },
    }

    const ata = setupTypeAcquisition(ataConfig)
    ataRef.current = ata

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
          setFiles((prev) => ({
            ...prev,
            [currentFile]: newContent,
          }))
          onCodeChange(newContent, currentFile)

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
      }),
    ]

    // Add TypeScript-specific extensions and handlers
    const tsExtensions =
      currentFile.endsWith(".tsx") || currentFile.endsWith(".ts")
        ? [
            tsFacet.of({ env, path: currentFile }),
            tsSync(),
            tsLinter(),
            autocompletion({ override: [tsAutocomplete()] }),
            tsHover(),
            hoverTooltip((view, pos, side) => {
              const { from, to, text } = view.state.doc.lineAt(pos)
              const line = text.slice(from, to)
              const match = line.match(/@tsci\/[\w.]+/)
              if (match) {
                const importName = match[0]
                const start = line.indexOf(importName)
                const end = start + importName.length
                if (pos >= from + start && pos <= from + end) {
                  return {
                    pos: from + start,
                    end: from + end,
                    above: true,
                    create() {
                      const dom = document.createElement("div")
                      dom.textContent = "Ctrl/Cmd+Click to open snippet"
                      return { dom }
                    },
                  }
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
                if (pos) {
                  const { from, to, text } = view.state.doc.lineAt(pos)
                  const line = text.slice(from, to)
                  const match = line.match(/@tsci\/[\w.]+/)
                  if (match) {
                    const importName = match[0]
                    const start = line.indexOf(importName)
                    const end = start + importName.length
                    if (pos >= from + start && pos <= from + end) {
                      handleImportClick(importName)
                      return true
                    }
                  }
                }
                return false
              },
            }),
            EditorView.theme({
              ".cm-content .cm-underline": {
                textDecoration: "underline",
                textDecorationColor: "rgba(0, 0, 255, 0.3)",
                cursor: "pointer",
              },
            }),
            EditorView.decorations.of((view) => {
              const decorations = []
              for (const { from, to } of view.visibleRanges) {
                for (let pos = from; pos < to; ) {
                  const line = view.state.doc.lineAt(pos)
                  const lineText = line.text
                  const matches = lineText.matchAll(/@tsci\/[\w.]+/g)
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
      ata(`
import React from "@types/react/jsx-runtime"
import { Circuit, createUseComponent } from "@tscircuit/core"
import type { CommonLayoutProps } from "@tscircuit/props"
${files["index.tsx"]}
`)
    }

    return () => {
      view.destroy()
    }
  }, [currentFile, !isStreaming])

  useEffect(() => {
    if (viewRef.current) {
      const state = viewRef.current.state
      const currentContent = files[currentFile] || ""
      if (state.doc.toString() !== currentContent) {
        viewRef.current.dispatch({
          changes: { from: 0, to: state.doc.length, insert: currentContent },
        })
      }
    }
  }, [files, currentFile])

  const codeImports = getImportsFromCode(files["index.tsx"])

  useEffect(() => {
    if (ataRef.current && currentFile === "index.tsx") {
      ataRef.current(`
import React from "@types/react/jsx-runtime"
import { Circuit, createUseComponent } from "@tscircuit/core"
import type { CommonLayoutProps } from "@tscircuit/props"
${files["index.tsx"]}
`)
    }
  }, [codeImports])

  const handleFileChange = (filename: string) => {
    setCurrentFile(filename)
  }

  const updateFileContent = (filename: string, newContent: string) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: newContent,
    }))

    if (filename === "index.tsx") {
      onCodeChange(newContent, filename)
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

  const formatCurrentFile = () => {
    if (!window.prettier || !window.prettierPlugins) return

    try {
      const currentContent = files[currentFile]

      if (currentFile.endsWith(".json")) {
        try {
          const jsonObj = JSON.parse(currentContent)
          const formattedJson = JSON.stringify(jsonObj, null, 2)
          updateFileContent(currentFile, formattedJson)
        } catch (jsonError) {
          throw new Error("Invalid JSON content")
        }
        return
      }

      const formattedCode = window.prettier.format(currentContent, {
        semi: false,
        parser: "typescript",
        plugins: window.prettierPlugins,
      })

      updateFileContent(currentFile, formattedCode)
    } catch (error) {
      console.error("Formatting error:", error)
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

  if (isStreaming) {
    return (
      <div className="font-mono whitespace-pre-wrap text-xs">
        {files[currentFile]}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-200">
        <Select value={currentFile} onValueChange={handleFileChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select file" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(files).map((filename) => (
              <SelectItem key={filename} value={filename}>
                {filename}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-2 py-1 ml-auto">
          <Button size="sm" variant="ghost" onClick={() => openImportDialog()}>
            Import
          </Button>
          <Button size="sm" variant="ghost" onClick={formatCurrentFile}>
            Format
          </Button>
        </div>
      </div>
      <div ref={editorRef} className="flex-1 overflow-auto" />
      <ImportSnippetDialog
        onSnippetSelected={(snippet) => {
          const newContent = `import {} from "@tsci/${snippet.owner_name}.${snippet.unscoped_name}"\n${files[currentFile]}`
          updateFileContent(currentFile, newContent)
        }}
      />
    </div>
  )
}
