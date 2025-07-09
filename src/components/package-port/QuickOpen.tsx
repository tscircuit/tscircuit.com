import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Code,
  Braces,
  FileIcon,
  Hash,
  BookOpen,
  FileText,
} from "lucide-react"
import type { PackageFile } from "@/types/package"
import { fuzzyMatch } from "../ViewPackagePage/utils/fuzz-search"

interface ScoredFile extends PackageFile {
  score: number
  matches: number[]
}

interface QuickOpenProps {
  files: PackageFile[]
  currentFile: string | null
  onFileSelect: (path: string) => void
  onClose: () => void
}

const QuickOpen = ({
  files,
  currentFile,
  onFileSelect,
  onClose,
}: QuickOpenProps) => {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedItemRef = useRef<HTMLDivElement>(null)

  const scoredFiles = useMemo((): ScoredFile[] => {
    if (!query) return files.map((f) => ({ ...f, score: 0, matches: [] }))

    return files
      .map((file) => {
        const { score, matches } = fuzzyMatch(query, file.path)
        return { ...file, score, matches }
      })
      .filter((f) => f.score >= 0)
      .sort((a, b) => {
        // Current file gets priority
        if (a.path === currentFile) return -1
        if (b.path === currentFile) return 1
        // Then by score
        return b.score - a.score
      })
  }, [files, query, currentFile])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelected((prev) => Math.min(prev + 1, scoredFiles.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelected((prev) => Math.max(prev - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          if (scoredFiles[selected]) {
            onFileSelect(scoredFiles[selected].path)
            onClose()
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    },
    [scoredFiles, selected, onFileSelect, onClose],
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selected])

  const getFileIcon = useCallback((path: string) => {
    const ext = path.split(".").pop()?.toLowerCase()
    const iconProps = { size: 16, className: "" }

    switch (ext) {
      case "tsx":
        iconProps.className = "text-blue-500"
        return <Code {...iconProps} />
      case "ts":
        iconProps.className = "text-blue-600"
        return <Code {...iconProps} />
      case "jsx":
        iconProps.className = "text-cyan-500"
        return <Code {...iconProps} />
      case "js":
        iconProps.className = "text-yellow-500"
        return <Code {...iconProps} />
      case "json":
        iconProps.className = "text-orange-500"
        return <Braces {...iconProps} />
      case "md":
        iconProps.className = "text-gray-600"
        return <BookOpen {...iconProps} />
      case "css":
        iconProps.className = "text-pink-500"
        return <Hash {...iconProps} />
      case "html":
        iconProps.className = "text-red-500"
        return <FileText {...iconProps} />
      default:
        iconProps.className = "text-gray-400"
        return <FileIcon {...iconProps} />
    }
  }, [])

  const renderHighlighted = useCallback(
    (file: ScoredFile) => {
      if (!query) return file.path

      const chars = file.path.split("")
      return chars.map((char, i) => (
        <span key={i} className={file.matches.includes(i) ? "bg-blue-200" : ""}>
          {char}
        </span>
      ))
    },
    [query],
  )

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-20 z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/50 w-full max-w-lg mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-950/10 focus:border-slate-400 transition-all duration-200"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {scoredFiles.length === 0 ? (
            <div className="p-6 text-center select-none text-slate-400 text-sm">
              {query ? "No matching files" : "No files"}
            </div>
          ) : (
            scoredFiles.map((file, index) => (
              <div
                key={file.path}
                ref={index === selected ? selectedItemRef : null}
                onClick={() => {
                  onFileSelect(file.path)
                  onClose()
                }}
                className={`px-4 py-2 cursor-pointer flex items-center gap-3 transition-all duration-150 ${
                  index === selected
                    ? "bg-slate-100 border-r-2 border-slate-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex-shrink-0">{getFileIcon(file.path)}</div>
                <div className="flex-1 min-w-0 text-sm font-mono text-slate-900 truncate">
                  {renderHighlighted(file)}
                </div>
                {file.path === currentFile && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    current
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-4 select-none py-3 text-xs border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
          <div className="flex items-center justify-between text-slate-500">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 font-mono bg-white border border-slate-200 rounded shadow-sm">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 font-mono bg-white border border-slate-200 rounded shadow-sm">
                  ↵
                </kbd>
                select
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 font-mono bg-white border border-slate-200 rounded shadow-sm">
                esc
              </kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickOpen
