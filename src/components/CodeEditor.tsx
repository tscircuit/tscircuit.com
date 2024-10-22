import { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { EditorState } from "@codemirror/state"
import {
  tsFacet,
  tsSync,
  tsLinter,
  tsAutocomplete,
  tsHover,
} from "@valtown/codemirror-ts"
import { autocompletion } from "@codemirror/autocomplete"
import { linter } from "@codemirror/lint"
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs"
import ts from "typescript"
import { setupTypeAcquisition } from "@typescript/ata"
import { ATABootstrapConfig } from "@typescript/ata"
import { useAxios } from "@/hooks/use-axios"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import { indentWithTab } from "@codemirror/commands"
import { keymap, hoverTooltip } from "@codemirror/view"
import { useLocation } from "wouter"

export const CodeEditor = ({
  onCodeChange,
  onDtsChange,
  readOnly = false,
  code,
  isStreaming = false,
}: {
  onCodeChange: (code: string) => void
  onDtsChange?: (dts: string) => void
  code: string
  readOnly?: boolean
  isStreaming?: boolean
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const ataRef = useRef<ReturnType<typeof setupTypeAcquisition> | null>(null)
  const apiUrl = useSnippetsBaseApiUrl()
  const [, navigate] = useLocation()

  const handleImportClick = (importName: string) => {
    const [owner, name] = importName.replace("@tsci/", "").split(".")
    window.open(`/${owner}/${name}`, "_blank")
  }

  useEffect(() => {
    if (!editorRef.current) return

    const fsMap = new Map<string, string>()
    fsMap.set("index.tsx", code)

    const system = createSystem(fsMap)
    const env = createVirtualTypeScriptEnvironment(system, [], ts, {
      jsx: ts.JsxEmit.ReactJSX,
      declaration: true,
    })

    const ataConfig: ATABootstrapConfig = {
      projectName: "my-project",
      typescript: ts,
      logger: console,
      fetcher: (input: RequestInfo | URL, init?: RequestInit) => {
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
        // For all other cases, proceed with the original fetch
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
    ata(`
import React from "@types/react/jsx-runtime"
import { Circuit, createUseComponent } from "@tscircuit/core"
import type { CommonLayoutProps } from "@tscircuit/props"
${code}
`)
    ataRef.current = ata

    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        javascript({ typescript: true, jsx: true }),
        tsFacet.of({ env, path: "index.tsx" }),
        keymap.of([indentWithTab]),
        tsSync(),
        tsLinter(),
        autocompletion({ override: [tsAutocomplete()] }),
        tsHover(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onCodeChange(update.state.doc.toString())

            const { outputFiles } = env.languageService.getEmitOutput(
              "index.tsx",
              true,
            )

            const indexDts = outputFiles.find(
              (file) => file.name === "index.d.ts",
            )
            if (indexDts?.text && onDtsChange) {
              onDtsChange(indexDts.text)
            }
          }
        }),
        EditorState.readOnly.of(readOnly),
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
            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
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
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [code !== "", !isStreaming])

  useEffect(() => {
    if (viewRef.current) {
      const state = viewRef.current.state
      if (state.doc.toString() !== code) {
        viewRef.current.dispatch({
          changes: { from: 0, to: state.doc.length, insert: code },
        })
      }
    }
  }, [code])

  const codeImports = getImportsFromCode(code)

  useEffect(() => {
    if (ataRef.current) {
      ataRef.current(code)
    }
  }, [codeImports])

  if (isStreaming) {
    return <div className="font-mono whitespace-pre-wrap text-xs">{code}</div>
  }

  return (
    <div
      ref={editorRef}
      style={{
        height: "640px",
        width: "100%",
        overflow: "auto",
      }}
    />
  )
}
