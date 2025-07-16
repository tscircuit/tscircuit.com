import { EditorView } from "codemirror"
import { findTargetFile } from "@/lib/utils/findTargetFile"
import type { PackageFile } from "@/types/package"
import { HIGHLIGHT_DURATION, LINE_NAVIGATION_DELAY } from "./constants"
import { FileName } from "./types"

export const createFileMap = (files: PackageFile[]): Record<string, string> => {
  const map: Record<string, string> = {}
  files.forEach((file) => {
    map[file.path] = file.content
  })
  return map
}

export const findEntryPointFileName = (files: PackageFile[]): string => {
  const entryPointFile = findTargetFile(files, null)
  if (entryPointFile?.path) return entryPointFile.path
  return files.find((x) => x.path === "index.tsx")?.path || "index.tsx"
}

export const updateEditorContent = (
  viewRef: React.RefObject<EditorView | null>,
  newContent: string,
) => {
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

export const navigateToLine = (
  viewRef: React.RefObject<EditorView | null>,
  lineNumber: number,
  setHighlightedLine: (line: number | null) => void,
  highlightTimeoutRef: React.RefObject<number | null>,
) => {
  if (!viewRef.current) return

  const view = viewRef.current
  const doc = view.state.doc

  if (lineNumber < 1 || lineNumber > doc.lines) return

  if (highlightTimeoutRef.current) {
    window.clearTimeout(highlightTimeoutRef.current)
    ;(highlightTimeoutRef as any).current = null
  }

  const line = doc.line(lineNumber)
  const pos = line.from

  view.dispatch({
    selection: { anchor: pos, head: pos },
    effects: EditorView.scrollIntoView(pos, { y: "center" }),
  })

  setHighlightedLine(lineNumber)
  ;(highlightTimeoutRef as any).current = window.setTimeout(() => {
    setHighlightedLine(null)
    ;(highlightTimeoutRef as any).current = null
  }, HIGHLIGHT_DURATION)
}

export const handleFileChange = (
  path: string,
  lineNumber: number | undefined,
  onFileSelect: (path: string, lineNumber?: number) => void,
  navigateToLineFn: (lineNumber: number) => void,
) => {
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
      navigateToLineFn(lineNumber)
    }, LINE_NAVIGATION_DELAY)
  }
}

export const updateFileContent = (
  path: FileName | null,
  newContent: string,
  currentFile: string | null,
  setCode: (code: string) => void,
  onCodeChange: (code: string, filename?: string) => void,
  fileMap: Record<string, string>,
  onFileContentChanged: ((path: string, content: string) => void) | undefined,
  viewRef: React.RefObject<EditorView | null>,
) => {
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
