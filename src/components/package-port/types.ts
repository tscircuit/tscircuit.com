import type { PackageFile } from "@/types/package"
import {
  ICreateFileProps,
  ICreateFileResult,
  IDeleteFileProps,
  IDeleteFileResult,
} from "@/hooks/useFileManagement"

export interface CodeEditorProps {
  onCodeChange: (code: string, filename?: string) => void
  files: PackageFile[]
  isSaving?: boolean
  handleCreateFile: (props: ICreateFileProps) => ICreateFileResult
  handleDeleteFile: (props: IDeleteFileProps) => IDeleteFileResult
  readOnly?: boolean
  isStreaming?: boolean
  pkgFilesLoaded?: boolean
  showImportAndFormatButtons?: boolean
  onFileContentChanged?: (path: string, content: string) => void
  currentFile: string | null
  onFileSelect: (path: string, lineNumber?: number) => void
}

export interface EditorRefs {
  editorRef: React.RefObject<HTMLDivElement>
  viewRef: React.RefObject<any>
  ataRef: React.RefObject<any>
  lastReceivedTsFileTimeRef: React.RefObject<number>
  highlightTimeoutRef: React.RefObject<number | null>
}

export interface EditorState {
  cursorPosition: number | null
  code: string
  fontSize: number
  showQuickOpen: boolean
  showGlobalFindReplace: boolean
  highlightedLine: number | null
  sidebarOpen: boolean
  aiAutocompleteEnabled: boolean
}

export type FileName = string 