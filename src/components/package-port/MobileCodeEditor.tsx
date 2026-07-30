import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import type { PackageFile } from "@/types/package"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { Compartment, EditorState, type Extension } from "@codemirror/state"
import { EditorView, lineNumbers } from "@codemirror/view"
import { minimalSetup } from "codemirror"
import { useEffect, useMemo, useRef } from "react"

interface MobileCodeEditorProps {
  files: PackageFile[]
  currentFile: string | null
  onFileSelect: (path: string) => void
  onFileContentChange: (path: string, content: string) => void
  isLoading?: boolean
}

/**
 * Lightweight CodeMirror 6 editor used on mobile instead of Monaco.
 *
 * Monaco's TypeScript language worker, type acquisition, and Shiki highlighter
 * are the memory-heavy pieces that push WKWebView-based iOS browsers past their
 * memory cap and crash the tab. This editor uses `minimalSetup` (no
 * autocomplete, no linting, no language worker) plus plain syntax highlighting,
 * so mobile users can still edit and Run while keeping Monaco out of the module
 * graph entirely. Full IntelliSense stays on desktop.
 */
function getLanguageExtension(path: string | null): Extension {
  if (!path) return []
  if (path.endsWith(".json")) return json()
  if (/\.(tsx?|jsx?|mts|cts|mjs|cjs)$/.test(path)) {
    return javascript({ jsx: true, typescript: true })
  }
  return []
}

export function MobileCodeEditor({
  files,
  currentFile,
  onFileSelect,
  onFileContentChange,
  isLoading,
}: MobileCodeEditorProps) {
  const visibleFiles = useMemo(
    () => files.filter((file) => !isHiddenFile(file.path)),
    [files],
  )
  const activeFile =
    files.find((file) => file.path === currentFile) ?? visibleFiles[0]
  const activePath = activeFile?.path ?? null
  const content = activeFile?.content ?? ""

  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const languageCompartment = useRef(new Compartment())

  // Keep the latest values reachable from the stable update listener without
  // recreating the editor on every keystroke.
  const onChangeRef = useRef(onFileContentChange)
  onChangeRef.current = onFileContentChange
  const activePathRef = useRef(activePath)
  activePathRef.current = activePath
  const contentRef = useRef(content)
  contentRef.current = content

  // Create the editor once.
  useEffect(() => {
    if (!containerRef.current) return
    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: contentRef.current,
        extensions: [
          minimalSetup,
          lineNumbers(),
          EditorView.lineWrapping,
          languageCompartment.current.of(
            getLanguageExtension(activePathRef.current),
          ),
          EditorView.theme({
            "&": { height: "100%", fontSize: "12px" },
            ".cm-scroller": {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            },
          }),
          EditorView.updateListener.of((update) => {
            if (!update.docChanged) return
            const path = activePathRef.current
            if (!path) return
            onChangeRef.current(path, update.state.doc.toString())
          }),
        ],
      }),
    })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  // Swap the document + language when the active file changes.
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: contentRef.current,
      },
      effects: languageCompartment.current.reconfigure(
        getLanguageExtension(activePath),
      ),
      selection: { anchor: 0 },
    })
  }, [activePath])

  // Reflect external content changes (imports, discard, delayed file loads)
  // without clobbering the caret on the user's own edits.
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    if (view.state.doc.toString() === content) return
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    })
  }, [content])

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-2 py-2">
        <select
          className="min-w-0 flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-xs"
          value={activePath ?? ""}
          onChange={(event) => onFileSelect(event.target.value)}
          aria-label="Select file"
        >
          {visibleFiles.map((file) => (
            <option key={file.path} value={file.path}>
              {file.path}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap text-[10px] uppercase tracking-wide text-gray-400">
          No autocomplete
        </span>
      </div>

      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden" />

      <div className="border-t border-gray-200 px-3 py-2 text-[11px] text-gray-500">
        {isLoading
          ? "Loading files…"
          : "Lightweight mobile editor — type-checking and autocomplete run on desktop."}
      </div>
    </div>
  )
}
