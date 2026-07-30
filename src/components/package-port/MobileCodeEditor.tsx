import { cn } from "@/lib/utils"

type EditorFile = {
  path: string
  content: string
}

/**
 * Lightweight mobile fallback. Monaco (and even CodeMirror + TS ATA) is too
 * heavy for WKWebView-based iOS Chrome; a plain textarea keeps Show Code usable
 * without blowing the tab's memory cap.
 */
export function MobileCodeEditor({
  files,
  currentFile,
  onFileSelect,
  onFileContentChange,
  className,
}: {
  files: EditorFile[]
  currentFile: string | null
  onFileSelect: (path: string) => void
  onFileContentChange: (path: string, content: string) => void
  className?: string
}) {
  const activePath = currentFile ?? files[0]?.path ?? null
  const activeContent =
    files.find((file) => file.path === activePath)?.content ?? ""

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-white", className)}>
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 px-2 py-1">
        {files.map((file) => (
          <button
            key={file.path}
            type="button"
            className={cn(
              "shrink-0 rounded px-2 py-1 text-xs",
              file.path === activePath
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700",
            )}
            onClick={() => onFileSelect(file.path)}
          >
            {file.path.split("/").pop()}
          </button>
        ))}
      </div>
      {activePath ? (
        <textarea
          className="min-h-0 flex-1 resize-none p-3 font-mono text-xs leading-5 outline-none"
          value={activeContent}
          spellCheck={false}
          onChange={(event) =>
            onFileContentChange(activePath, event.target.value)
          }
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
          No file selected
        </div>
      )}
    </div>
  )
}
