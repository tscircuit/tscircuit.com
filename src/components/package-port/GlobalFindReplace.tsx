import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Search,
  Replace,
  Code,
  Braces,
  FileIcon,
  Hash,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronRight,
  X,
  Regex,
  CaseSensitive,
  WholeWord,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { PackageFile } from "./CodeAndPreview"

interface Match {
  line: number
  column: number
  text: string
  lineText: string
  startIndex: number
  endIndex: number
}

interface FileMatch {
  file: PackageFile
  matches: Match[]
  isExpanded: boolean
}

interface GlobalFindReplaceProps {
  files: PackageFile[]
  currentFile: string | null
  onFileSelect: (path: string) => void
  onFileContentChanged?: (path: string, content: string) => void
  onClose: () => void
}

const GlobalFindReplace = ({
  files,
  currentFile,
  onFileSelect,
  onFileContentChanged,
  onClose,
}: GlobalFindReplaceProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [replaceQuery, setReplaceQuery] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [showReplace, setShowReplace] = useState(false)
  const [fileMatches, setFileMatches] = useState<FileMatch[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)

  const totalMatches = useMemo(() => {
    return fileMatches.reduce((total, fileMatch) => total + fileMatch.matches.length, 0)
  }, [fileMatches])

  const searchFiles = useCallback(() => {
    if (!searchQuery.trim()) {
      setFileMatches([])
      return
    }

    setIsSearching(true)
    
    const results: FileMatch[] = []
    
    files.forEach((file) => {
      const matches: Match[] = []
      const content = file.content
      const lines = content.split('\n')
      
      let searchRegex: RegExp
      try {
        if (useRegex) {
          searchRegex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')
        } else {
          const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
          searchRegex = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
        }
      } catch (error) {
        setIsSearching(false)
        return
      }

      lines.forEach((lineText, lineIndex) => {
        let match
        while ((match = searchRegex.exec(lineText)) !== null) {
          matches.push({
            line: lineIndex + 1,
            column: match.index + 1,
            text: match[0],
            lineText: lineText,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          })
          if (!searchRegex.global) break
        }
      })

      if (matches.length > 0) {
        results.push({
          file,
          matches,
          isExpanded: true,
        })
      }
    })

    setFileMatches(results)
    setIsSearching(false)
  }, [searchQuery, files, caseSensitive, wholeWord, useRegex])

  const replaceInFile = useCallback((fileMatch: FileMatch, matchIndex?: number) => {
    const { file, matches } = fileMatch
    let newContent = file.content
    
    if (matchIndex !== undefined) {
      const match = matches[matchIndex]
      const lines = newContent.split('\n')
      const lineText = lines[match.line - 1]
      const newLineText = lineText.substring(0, match.startIndex) + 
                         replaceQuery + 
                         lineText.substring(match.endIndex)
      lines[match.line - 1] = newLineText
      newContent = lines.join('\n')
    } else {
      let searchRegex: RegExp
      try {
        if (useRegex) {
          searchRegex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')
        } else {
          const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const pattern = wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery
          searchRegex = new RegExp(pattern, caseSensitive ? 'g' : 'gi')
        }
        newContent = newContent.replace(searchRegex, replaceQuery)
      } catch (error) {
        return
      }
    }

    onFileContentChanged?.(file.path, newContent)
    searchFiles()
  }, [replaceQuery, searchQuery, caseSensitive, wholeWord, useRegex, onFileContentChanged, searchFiles])

  const replaceAll = useCallback(() => {
    fileMatches.forEach((fileMatch) => {
      replaceInFile(fileMatch)
    })
  }, [fileMatches, replaceInFile])

  const toggleFileExpansion = useCallback((index: number) => {
    setFileMatches(prev => prev.map((fileMatch, i) => 
      i === index ? { ...fileMatch, isExpanded: !fileMatch.isExpanded } : fileMatch
    ))
  }, [])

  const goToMatch = useCallback((fileMatch: FileMatch, match: Match) => {
    onFileSelect(fileMatch.file.path)
    onClose()
  }, [onFileSelect, onClose])

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

  const highlightMatch = useCallback((lineText: string, match: Match) => {
    const before = lineText.substring(0, match.startIndex)
    const matchText = lineText.substring(match.startIndex, match.endIndex)
    const after = lineText.substring(match.endIndex)
    
    return (
      <>
        {before}
        <span className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{matchText}</span>
        {after}
      </>
    )
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFiles()
      } else {
        setFileMatches([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, caseSensitive, wholeWord, useRegex, searchFiles])

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    } else if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      if (showReplace && replaceQuery) {
        replaceAll()
      }
    } else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault()
      setShowReplace(!showReplace)
    }
  }, [onClose, showReplace, replaceQuery, replaceAll])

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-4 sm:pt-8 z-50 p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200/50 w-full max-w-4xl mx-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Search size={20} />
              Find and Replace
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across files..."
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex gap-1 justify-center sm:justify-start">
                <Button
                  variant={caseSensitive ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setCaseSensitive(!caseSensitive)}
                  title="Match case"
                >
                  <CaseSensitive size={14} />
                </Button>
                <Button
                  variant={wholeWord ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setWholeWord(!wholeWord)}
                  title="Match whole word"
                >
                  <WholeWord size={14} />
                </Button>
                <Button
                  variant={useRegex ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setUseRegex(!useRegex)}
                  title="Use regular expression"
                >
                  <Regex size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setShowReplace(!showReplace)}
                  title="Toggle replace"
                >
                  <Replace size={14} />
                </Button>
              </div>
            </div>

            {showReplace && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    ref={replaceInputRef}
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    placeholder="Replace with..."
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={replaceAll}
                  disabled={fileMatches.length === 0 || !replaceQuery}
                  className="h-9 w-full sm:w-auto"
                >
                  Replace All ({totalMatches})
                </Button>
              </div>
            )}
          </div>

          {searchQuery && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-slate-600">
              <span>
                {isSearching ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin" />
                    Searching...
                  </span>
                ) : (
                  `${totalMatches} results in ${fileMatches.length} files`
                )}
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span>Ctrl+Enter: Replace All</span>
                <span className="hidden sm:inline">•</span>
                <span>Shift+Tab: Toggle Replace</span>
                <span className="hidden sm:inline">•</span>
                <span>Esc: Close</span>
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 max-h-[50vh] sm:max-h-[60vh]">
          <div className="p-4 space-y-2">
            {fileMatches.length === 0 && searchQuery && !isSearching && (
              <div className="text-center py-8 text-slate-500">
                No matches found for "{searchQuery}"
              </div>
            )}

            {fileMatches.map((fileMatch, fileIndex) => (
              <div key={fileMatch.file.path} className="border border-slate-200 rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors min-h-[48px] sm:min-h-0"
                  onClick={() => toggleFileExpansion(fileIndex)}
                >
                  <div className="flex items-center gap-3">
                    {fileMatch.isExpanded ? (
                      <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                    {getFileIcon(fileMatch.file.path)}
                    <span className="font-mono text-sm font-medium">
                      {fileMatch.file.path}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {fileMatch.matches.length} match{fileMatch.matches.length !== 1 ? 'es' : ''}
                    </Badge>
                  </div>
                  {showReplace && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        replaceInFile(fileMatch)
                      }}
                      disabled={!replaceQuery}
                      className="h-8 px-2 text-xs sm:h-6"
                    >
                      <span className="hidden sm:inline">Replace in file</span>
                      <span className="sm:hidden">Replace</span>
                    </Button>
                  )}
                </div>

                {fileMatch.isExpanded && (
                  <div className="border-t border-slate-200">
                    {fileMatch.matches.map((match, matchIndex) => (
                      <div
                        key={`${match.line}-${match.column}-${matchIndex}`}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 cursor-pointer group min-h-[48px] sm:min-h-0"
                        onClick={() => goToMatch(fileMatch, match)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                            <span>Line {match.line}, Column {match.column}</span>
                          </div>
                          <div className="font-mono text-sm text-slate-800 truncate">
                            {highlightMatch(match.lineText, match)}
                          </div>
                        </div>
                        {showReplace && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              replaceInFile(fileMatch, matchIndex)
                            }}
                            disabled={!replaceQuery}
                            className="h-8 px-2 text-xs sm:h-6 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            Replace
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default GlobalFindReplace 