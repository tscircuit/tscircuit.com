import { useEffect, useRef, useState } from "react"

const AUTOSAVE_STORAGE_KEY = "tscircuit:editor-autosave"
const AUTOSAVE_DELAY_MS = 2000

interface EditorFile {
  path: string
  content: string
}

export function useEditorAutosave({
  files,
  canSave,
  hasUnsavedChanges,
  isSaving,
  onSave,
}: {
  files: EditorFile[]
  canSave: boolean
  hasUnsavedChanges: boolean
  isSaving: boolean
  onSave: (options: { isAutosave: true }) => void
}) {
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(AUTOSAVE_STORAGE_KEY) === "true",
  )
  const lastAttemptedFilesRef = useRef<EditorFile[] | null>(null)
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave

  useEffect(() => {
    if (
      !isAutosaveEnabled ||
      !canSave ||
      !hasUnsavedChanges ||
      isSaving ||
      lastAttemptedFilesRef.current === files
    ) {
      return
    }

    const timeout = window.setTimeout(() => {
      lastAttemptedFilesRef.current = files
      onSaveRef.current({ isAutosave: true })
    }, AUTOSAVE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [files, canSave, hasUnsavedChanges, isSaving, isAutosaveEnabled])

  const changeAutosaveEnabled = (enabled: boolean) => {
    window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, String(enabled))
    setIsAutosaveEnabled(enabled)
  }

  return { isAutosaveEnabled, changeAutosaveEnabled }
}
