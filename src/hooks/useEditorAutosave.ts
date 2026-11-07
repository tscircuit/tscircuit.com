import { useCallback, useEffect, useRef, useState } from "react"
import {
  applyLocalDraft,
  createLocalDraft,
  getLocalDraftConflicts,
  getLocalDraftKey,
  parseLocalDraft,
  type LocalDraft,
} from "@/lib/editor-local-draft"
import type { PackageFile } from "@/types/package"

const AUTOSAVE_STORAGE_KEY = "tscircuit:editor-autosave"
const AUTOSAVE_DELAY_MS = 2000
const AUTOSAVE_INTERVAL_MS = 30000

interface DraftIssue {
  key: string
  message: string
  conflicts: string[]
  draft?: LocalDraft
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function useEditorAutosave({
  accountId,
  packageId,
  releaseId,
  files,
  initialFiles,
  canSave,
  areAllFilesLoaded,
  hasUnsavedChanges,
  setFiles,
}: {
  accountId?: string
  packageId?: string
  releaseId?: string | null
  files: PackageFile[]
  initialFiles: PackageFile[]
  canSave: boolean
  areAllFilesLoaded: boolean
  hasUnsavedChanges: boolean
  setFiles: (files: PackageFile[]) => void
}) {
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(false)
  const [initializedKey, setInitializedKey] = useState<string | null>(null)
  const [draftIssue, setDraftIssue] = useState<DraftIssue | null>(null)
  const [draftError, setDraftError] = useState<string | null>(null)
  const [lastDraftSaved, setLastDraftSaved] = useState<{
    key: string
    savedAt: number
    files: PackageFile[]
  } | null>(null)
  const currentRef = useRef({ files, initialFiles, hasUnsavedChanges })
  const autosaveEnabledRef = useRef(isAutosaveEnabled)
  currentRef.current = { files, initialFiles, hasUnsavedChanges }
  autosaveEnabledRef.current = isAutosaveEnabled

  const draftKey =
    accountId && packageId && releaseId
      ? getLocalDraftKey({ accountId, packageId, releaseId })
      : null
  const isReady = Boolean(draftKey && canSave && areAllFilesLoaded)
  const activeIssue = draftIssue?.key === draftKey ? draftIssue : null

  useEffect(() => {
    try {
      setIsAutosaveEnabled(
        window.localStorage.getItem(AUTOSAVE_STORAGE_KEY) === "true",
      )
    } catch (error) {
      setDraftError(
        `Could not read autosave preference: ${errorMessage(error)}`,
      )
    }
  }, [])

  // Read an existing draft once per fully loaded package/release. Never silently
  // overwrite a file that has also changed on the server.
  useEffect(() => {
    if (!isReady || !draftKey || initializedKey === draftKey) return

    try {
      const raw = window.localStorage.getItem(draftKey)
      if (raw) {
        const draft = parseLocalDraft(raw)
        const conflicts = getLocalDraftConflicts(initialFiles, draft)
        if (conflicts.length > 0) {
          setDraftIssue({
            key: draftKey,
            draft,
            conflicts,
            message: `Browser draft conflicts with server changes in: ${conflicts.join(", ")}`,
          })
        } else if (draft.changes.length > 0) {
          const restoredFiles = applyLocalDraft(initialFiles, draft)
          setFiles(restoredFiles)
          setLastDraftSaved({
            key: draftKey,
            savedAt: draft.savedAt,
            files: restoredFiles,
          })
        }
      }
    } catch (error) {
      setDraftIssue({
        key: draftKey,
        conflicts: [],
        message: `Could not read browser draft: ${errorMessage(error)}`,
      })
    }
    setInitializedKey(draftKey)
  }, [draftKey, initializedKey, initialFiles, isReady, setFiles])

  const writeDraft = useCallback(() => {
    if (!draftKey) return
    try {
      const { files, initialFiles } = currentRef.current
      const draft = createLocalDraft(initialFiles, files)
      if (draft.changes.length === 0) {
        window.localStorage.removeItem(draftKey)
        setLastDraftSaved(null)
      } else {
        window.localStorage.setItem(draftKey, JSON.stringify(draft))
        setLastDraftSaved({ key: draftKey, savedAt: draft.savedAt, files })
      }
      setDraftError(null)
    } catch (error) {
      setDraftError(`Could not save browser draft: ${errorMessage(error)}`)
    }
  }, [draftKey])

  const canWriteDraft =
    isReady && isAutosaveEnabled && initializedKey === draftKey && !activeIssue

  // Debounced checkpoint after typing pauses.
  useEffect(() => {
    if (!canWriteDraft) return
    const timeout = window.setTimeout(writeDraft, AUTOSAVE_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [canWriteDraft, files, initialFiles, writeDraft])

  // Periodic checkpoint also works when the user keeps typing continuously.
  useEffect(() => {
    if (!canWriteDraft) return
    const interval = window.setInterval(() => {
      if (currentRef.current.hasUnsavedChanges) writeDraft()
    }, AUTOSAVE_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [canWriteDraft, writeDraft])

  // Closing or reloading the page also checkpoints the latest edits locally.
  useEffect(() => {
    if (!canWriteDraft) return
    window.addEventListener("pagehide", writeDraft)
    return () => window.removeEventListener("pagehide", writeDraft)
  }, [canWriteDraft, writeDraft])

  const changeAutosaveEnabled = useCallback((enabled: boolean) => {
    try {
      window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, String(enabled))
      setIsAutosaveEnabled(enabled)
      setDraftError(null)
    } catch (error) {
      setDraftError(
        `Could not change autosave preference: ${errorMessage(error)}`,
      )
    }
  }, [])

  const discardLocalDraft = useCallback((): boolean => {
    if (!draftKey) return true
    try {
      window.localStorage.removeItem(draftKey)
      setDraftIssue(null)
      setDraftError(null)
      setLastDraftSaved(null)
      return true
    } catch (error) {
      setDraftError(`Could not discard browser draft: ${errorMessage(error)}`)
      return false
    }
  }, [draftKey])

  const restoreLocalDraft = useCallback(() => {
    if (!activeIssue?.draft) return
    const restoredFiles = applyLocalDraft(initialFiles, activeIssue.draft)
    setFiles(restoredFiles)
    setLastDraftSaved({
      key: activeIssue.key,
      savedAt: activeIssue.draft.savedAt,
      files: restoredFiles,
    })
    setDraftIssue(null)
  }, [activeIssue, initialFiles, setFiles])

  const onManualSaveSuccess = useCallback(
    (savedFiles: PackageFile[]) => {
      if (!draftKey) return
      try {
        if (!autosaveEnabledRef.current) {
          window.localStorage.removeItem(draftKey)
          setLastDraftSaved(null)
        } else {
          const latestFiles = currentRef.current.files
          const remainingDraft = createLocalDraft(savedFiles, latestFiles)
          if (remainingDraft.changes.length > 0) {
            window.localStorage.setItem(
              draftKey,
              JSON.stringify(remainingDraft),
            )
            setLastDraftSaved({
              key: draftKey,
              savedAt: remainingDraft.savedAt,
              files: latestFiles,
            })
          } else {
            window.localStorage.removeItem(draftKey)
            setLastDraftSaved(null)
          }
        }
        setDraftIssue(null)
        setDraftError(null)
      } catch (error) {
        setDraftError(`Could not update browser draft: ${errorMessage(error)}`)
      }
    },
    [draftKey],
  )

  return {
    isAutosaveEnabled,
    lastDraftSavedAt:
      isAutosaveEnabled &&
      lastDraftSaved?.key === draftKey &&
      lastDraftSaved.files === files
        ? lastDraftSaved.savedAt
        : null,
    changeAutosaveEnabled,
    draftError: activeIssue?.message || draftError,
    draftConflicts: activeIssue?.conflicts || [],
    hasDraftIssue: Boolean(activeIssue),
    restoreLocalDraft,
    discardLocalDraft,
    onManualSaveSuccess,
  }
}
