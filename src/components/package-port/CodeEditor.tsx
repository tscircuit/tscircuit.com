import { usePackagesBaseApiUrl } from "@/hooks/use-packages-base-api-url"
import { useHotkeyCombo } from "@/hooks/use-hotkey"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import { EditorState } from "@codemirror/state"
import { EditorView } from "codemirror"
import { useEffect, useMemo, useRef, useState } from "react"
import CodeEditorHeader from "@/components/package-port/CodeEditorHeader"
import FileSidebar from "../FileSidebar"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import QuickOpen from "./QuickOpen"
import GlobalFindReplace from "./GlobalFindReplace"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"

import { CodeEditorProps } from "./types"
import { defaultImports, DEFAULT_FONT_SIZE, EDITOR_UPDATE_DELAY } from "./constants"
import {
  createFileSystemMap,
  setupTypeScriptEnvironment,
  createATAConfig,
  initializeATA,
} from "./typescript-setup"
import {
  createBaseExtensions,
  createAIAutocompleteExtensions,
  createTypeScriptExtensions,
} from "./editor-extensions"
import {
  createFileMap,
  findEntryPointFileName,
  updateEditorContent,
  navigateToLine,
  handleFileChange,
  updateFileContent,
} from "./editor-utils"

export const CodeEditor = ({
  onCodeChange,
  readOnly = false,
  files = [],
  isSaving = false,
  isStreaming = false,
  showImportAndFormatButtons = true,
  onFileContentChanged,
  pkgFilesLoaded,
  currentFile,
  onFileSelect,
  handleCreateFile,
  handleDeleteFile,
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const ataRef = useRef<ReturnType<typeof initializeATA> | null>(null)
  const lastReceivedTsFileTimeRef = useRef<number>(0)
  const highlightTimeoutRef = useRef<number | null>(null)
  
  const apiUrl = usePackagesBaseApiUrl()
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const [code, setCode] = useState(files[0]?.content || "")
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [showQuickOpen, setShowQuickOpen] = useState(false)
  const [showGlobalFindReplace, setShowGlobalFindReplace] = useState(false)
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiAutocompleteEnabled, setAiAutocompleteEnabled] = useState(false)

  const { highlighter } = useShikiHighlighter()

  // Get URL search params for file_path
  const urlParams = new URLSearchParams(window.location.search)
  const filePathFromUrl = urlParams.get("file_path")
  const lineNumberFromUrl = urlParams.get("line")

  const entryPointFileName = useMemo(() => findEntryPointFileName(files), [files])

  // Set current file on component mount
  useEffect(() => {
    if (files.length === 0 || !pkgFilesLoaded || currentFile) return

    const targetFile = files.find((f) => f.path === filePathFromUrl) || files[0]
    if (targetFile) {
      const lineNumber = lineNumberFromUrl
        ? parseInt(lineNumberFromUrl, 10)
        : undefined
      handleFileChangeWrapper(targetFile.path, lineNumber)
      setCode(targetFile.content)
    }
  }, [filePathFromUrl, lineNumberFromUrl, pkgFilesLoaded])

  const fileMap = useMemo(() => createFileMap(files), [files])

  useEffect(() => {
    const currentFileContent =
      files.find((f) => f.path === currentFile)?.content || ""
    if (currentFileContent !== code) {
      setCode(currentFileContent)
      updateEditorContent(viewRef, currentFileContent)
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
          updateEditorContent(viewRef, currentFileContent)
        }, EDITOR_UPDATE_DELAY)
      }
    }
  }, [isStreaming])

  useHotkeyCombo(
    "cmd+b",
    () => {
      setSidebarOpen((prev) => !prev)
    },
    { target: window },
  )

  useEffect(() => {
    if (!editorRef.current) return

    const fsMap = createFileSystemMap(files)
    const lastFilesEventContent: Record<string, string> = {}

    const setupEditor = async () => {
      const { env } = await setupTypeScriptEnvironment(fsMap)
      
      const ataConfig = createATAConfig(apiUrl, env, fsMap, lastReceivedTsFileTimeRef)
      const ata = initializeATA(ataConfig)
      ataRef.current = ata

      // Set up base extensions
      const baseExtensions = createBaseExtensions(
        currentFile,
        readOnly,
        isSaving,
        fontSize,
        highlightedLine,
        setShowQuickOpen,
        setShowGlobalFindReplace,
        setFontSize,
        onCodeChange,
        onFileContentChanged,
        setCursorPosition,
        lastFilesEventContent
      )

      // Add AI autocomplete extensions if enabled
      if (aiAutocompleteEnabled) {
        baseExtensions.push(...createAIAutocompleteExtensions(apiUrl))
      }

      // Add TypeScript-specific extensions
      const tsExtensions = createTypeScriptExtensions(
        currentFile,
        env,
        lastReceivedTsFileTimeRef,
        highlighter,
        fileMap,
        onFileSelect
      )

      const state = EditorState.create({
        doc: fileMap[currentFile || ""] || "",
        extensions: [...baseExtensions, ...tsExtensions],
      })

      const view = new EditorView({
        state,
        parent: editorRef.current!,
      })

      viewRef.current = view

      if (currentFile?.endsWith(".tsx") || currentFile?.endsWith(".ts")) {
        ata(`${defaultImports}${code}`)
      }
    }

    setupEditor()

    return () => {
      viewRef.current?.destroy()
      // Clean up any pending highlight timeout
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = null
      }
    }
  }, [
    !isStreaming,
    currentFile,
    code !== "",
    Boolean(highlighter),
    isSaving,
    fontSize,
    aiAutocompleteEnabled,
    highlightedLine,
  ])

  const updateCurrentEditorContent = (newContent: string) => {
    updateEditorContent(viewRef, newContent)
  }

  const navigateToLineWrapper = (lineNumber: number) => {
    navigateToLine(viewRef, lineNumber, setHighlightedLine, highlightTimeoutRef)
  }

  const updateEditorToMatchCurrentFile = () => {
    const currentContent = fileMap[currentFile || ""] || ""
    updateCurrentEditorContent(currentContent)
  }

  const codeImports = getImportsFromCode(code)

  useEffect(() => {
    if (
      ataRef.current &&
      (currentFile?.endsWith(".tsx") || currentFile?.endsWith(".ts"))
    ) {
      ataRef.current(`${defaultImports}${code}`)
    }
  }, [codeImports])

  const handleFileChangeWrapper = (path: string, lineNumber?: number) => {
    handleFileChange(path, lineNumber, onFileSelect, navigateToLineWrapper)
  }

  const updateFileContentWrapper = (path: string | null, newContent: string) => {
    updateFileContent(
      path,
      newContent,
      currentFile,
      setCode,
      onCodeChange,
      fileMap,
      onFileContentChanged,
      viewRef
    )
  }

  // Whenever the current file changes, updated the editor content
  useEffect(() => {
    updateEditorToMatchCurrentFile()
  }, [currentFile])

  // Global keyboard listeners
  useHotkeyCombo("cmd+p", () => {
    setShowQuickOpen(true)
  })

  useHotkeyCombo("cmd+shift+f", () => {
    setShowGlobalFindReplace(true)
  })

  useHotkeyCombo("Escape", () => {
    if (showQuickOpen) {
      setShowQuickOpen(false)
    }
    if (showGlobalFindReplace) {
      setShowGlobalFindReplace(false)
    }
  })

  if (isStreaming) {
    return <div className="font-mono whitespace-pre-wrap text-xs">{code}</div>
  }

  return (
    <div className="flex h-[98vh] w-full overflow-hidden">
      <FileSidebar
        files={Object.fromEntries(files.map((f) => [f.path, f.content]))}
        currentFile={currentFile}
        fileSidebarState={
          [sidebarOpen, setSidebarOpen] as ReturnType<typeof useState<boolean>>
        }
        onFileSelect={(path) => handleFileChangeWrapper(path)}
        handleCreateFile={handleCreateFile}
        handleDeleteFile={handleDeleteFile}
      />
      <div className="flex flex-col flex-1 w-full min-w-0 h-full">
        {showImportAndFormatButtons && (
          <CodeEditorHeader
            entrypointFileName={entryPointFileName}
            appendNewFile={(path: string, content: string) => {
              onFileContentChanged?.(path, content)
            }}
            createFile={handleCreateFile}
            fileSidebarState={
              [sidebarOpen, setSidebarOpen] as ReturnType<
                typeof useState<boolean>
              >
            }
            currentFile={currentFile}
            files={Object.fromEntries(files.map((f) => [f.path, f.content]))}
            updateFileContent={updateFileContentWrapper}
            handleFileChange={handleFileChangeWrapper}
            aiAutocompleteState={[
              aiAutocompleteEnabled,
              setAiAutocompleteEnabled,
            ]}
          />
        )}
        <div
          ref={editorRef}
          className={
            "flex-1 overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:!h-full"
          }
        />
      </div>
      {showQuickOpen && (
        <QuickOpen
          files={files.filter((f) => !isHiddenFile(f.path))}
          currentFile={currentFile}
          onFileSelect={(path) => handleFileChangeWrapper(path)}
          onClose={() => setShowQuickOpen(false)}
        />
      )}
      {showGlobalFindReplace && (
        <GlobalFindReplace
          files={files.filter((f) => !isHiddenFile(f.path))}
          currentFile={currentFile}
          onFileSelect={handleFileChangeWrapper}
          onFileContentChanged={onCodeChange}
          onClose={() => setShowGlobalFindReplace(false)}
        />
      )}
    </div>
  )
}
