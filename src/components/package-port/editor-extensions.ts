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
import { linter } from "@codemirror/lint"
import {
  TSCI_PACKAGE_PATTERN,
  LOCAL_FILE_IMPORT_PATTERN,
} from "@/lib/constants"
import { tsAutocomplete, tsFacet, tsSync } from "@valtown/codemirror-ts"
import { getLints } from "@valtown/codemirror-ts"
import { EditorView } from "codemirror"
import { inlineCopilot } from "codemirror-copilot"
import { resolveRelativePath } from "@/lib/utils/resolveRelativePath"
import tsModule from "typescript"
import { MIN_FONT_SIZE, MAX_FONT_SIZE, ATA_TIMEOUT } from "./constants"

export const createBaseExtensions = (
  currentFile: string | null,
  readOnly: boolean,
  isSaving: boolean,
  fontSize: number,
  highlightedLine: number | null,
  setShowQuickOpen: (show: boolean) => void,
  setShowGlobalFindReplace: (show: boolean) => void,
  setFontSize: (fn: (prev: number) => number) => void,
  onCodeChange: (code: string, filename?: string) => void,
  onFileContentChanged: ((path: string, content: string) => void) | undefined,
  setCursorPosition: (pos: number | null) => void,
  lastFilesEventContent: Record<string, string>,
) => {
  return [
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
              delta > 0
                ? Math.max(MIN_FONT_SIZE, prev - 1)
                : Math.min(MAX_FONT_SIZE, prev + 1)
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
}

export const createAIAutocompleteExtensions = (apiUrl: string) => [
  inlineCopilot(async (prefix, suffix) => {
    const res = await fetch(`${apiUrl}/autocomplete/create_autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefix,
        suffix,
        language: "typescript",
      }),
    })

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
]

export const createTypeScriptExtensions = (
  currentFile: string | null,
  env: any,
  lastReceivedTsFileTimeRef: React.RefObject<number>,
  highlighter: any,
  fileMap: Record<string, string>,
  onFileSelect: (path: string) => void,
) => {
  if (!currentFile?.endsWith(".tsx") && !currentFile?.endsWith(".ts")) {
    return []
  }

  return [
    tsFacet.of({
      env,
      path: currentFile?.endsWith(".ts")
        ? currentFile?.replace(/\.ts$/, ".tsx")
        : currentFile,
    }),
    tsSync(),
    linter(async (view) => {
      if (Date.now() - (lastReceivedTsFileTimeRef.current || 0) < ATA_TIMEOUT) {
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
      const packageMatches = Array.from(lineText.matchAll(TSCI_PACKAGE_PATTERN))

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
      const content = tsModule?.displayPartsToString(info.displayParts || [])

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
              const [owner, name] = importName.replace("@tsci/", "").split(".")
              window.open(`/${owner}/${name}`, "_blank")
              return true
            }
          }
        }

        // Check for local file imports
        const localFileMatches = Array.from(
          lineText.matchAll(LOCAL_FILE_IMPORT_PATTERN),
        )
        for (const match of localFileMatches) {
          if (match.index !== undefined) {
            const start = lineStart + match.index
            const end = start + match[0].length
            if (pos >= start && pos <= end) {
              const relativePath = match[0]
              const resolvedPath = resolveRelativePath(
                relativePath,
                currentFile || "",
              )

              // Add common extensions if not present
              let targetPath = resolvedPath
              if (!targetPath.includes(".")) {
                const extensions = [".tsx", ".ts", ".js", ".jsx"]
                for (const ext of extensions) {
                  if (fileMap[`${targetPath}${ext}`]) {
                    targetPath = `${targetPath}${ext}`
                    break
                  }
                }
              }

              if (fileMap[targetPath]) {
                onFileSelect(targetPath)
                return true
              }
              return !!fileMap[targetPath]
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
          const localFileMatches = lineText.matchAll(LOCAL_FILE_IMPORT_PATTERN)
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
}
