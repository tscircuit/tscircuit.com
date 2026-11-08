import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import type { PackageFile } from "@/types/package"
import {
  LOCAL_AUTOSAVE_SETTING,
  draftFingerprint,
  localDraftKey,
  readLocalDraft,
  snapshotEditableFiles,
  writeLocalDraft,
  type LocalDraft,
} from "@/lib/local-draft-storage"

type LocalStatus =
  | "loading"
  | "restore"
  | "editing"
  | "saved"
  | "off"
  | "error"
  | "conflict"

export function useLocalDraftAutosave({
  accountId,
  projectId,
  ready,
  files,
  initialFiles,
  onRestore,
}: {
  accountId: string
  projectId: string | null
  ready: boolean
  files: PackageFile[]
  initialFiles: PackageFile[]
  onRestore: (files: PackageFile[]) => void
}) {
  const [enabled, setEnabled] = useState(() => {
    try {
      return window.localStorage.getItem(LOCAL_AUTOSAVE_SETTING) !== "false"
    } catch {
      return false
    }
  })
  const [status, setStatus] = useState<LocalStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [restoreCandidate, setRestoreCandidate] = useState<LocalDraft | null>(null)
  const key = useMemo(
    () => projectId ? localDraftKey(accountId, projectId) : null,
    [accountId, projectId],
  )
  const phaseRef = useRef<{
    key: string | null
    phase: "initial" | "prompt" | "restoring" | "active" | "conflict" | "error"
    persisted: string | null
    expectedRestore: string | null
  }>({ key: null, phase: "initial", persisted: null, expectedRestore: null })
  const editableFiles = snapshotEditableFiles(files)
  const fingerprint = draftFingerprint(editableFiles)
  const baseline = draftFingerprint(snapshotEditableFiles(initialFiles))
  const restoreRef = useRef(onRestore)
  restoreRef.current = onRestore
  const filesRef = useRef(files)
  filesRef.current = files

  useEffect(() => {
    if (!key || !ready) return
    if (phaseRef.current.key === key) return
    phaseRef.current = {
      key,
      phase: "initial",
      persisted: null,
      expectedRestore: null,
    }
    try {
      const draft = readLocalDraft(window.localStorage, key)
      phaseRef.current.persisted = draft ? draftFingerprint(draft.files) : null
      if (draft && draftFingerprint(draft.files) !== baseline) {
        phaseRef.current.phase = "prompt"
        setRestoreCandidate(draft)
        setStatus("restore")
      } else {
        phaseRef.current.phase = "active"
        setRestoreCandidate(null)
        setStatus(enabled ? "editing" : "off")
      }
      setError(null)
    } catch (cause) {
      phaseRef.current.phase = "error"
      setStatus("error")
      setError(cause instanceof Error ? cause.message : "Local draft read failed")
    }
  }, [key, ready, baseline, enabled])

  const restoreDraft = useCallback(() => {
    const draft = restoreCandidate
    if (!draft || !key || phaseRef.current.phase !== "prompt") return
    const expected = draftFingerprint(draft.files)
    phaseRef.current.expectedRestore = expected
    phaseRef.current.phase = "restoring"
    setRestoreCandidate(null)
    setStatus("loading")
    const untouched = filesRef.current.filter(
      (file) => file.isBinary || isHiddenFile(file.path),
    )
    restoreRef.current([...untouched, ...draft.files])
  }, [restoreCandidate, key])

  const discardStoredDraft = useCallback(() => {
    if (!key) return
    try {
      window.localStorage.removeItem(key)
      phaseRef.current.persisted = null
      phaseRef.current.phase = "active"
      phaseRef.current.expectedRestore = null
      setRestoreCandidate(null)
      setError(null)
      setStatus(enabled ? "editing" : "off")
    } catch (cause) {
      setStatus("error")
      setError(cause instanceof Error ? cause.message : "Local draft deletion failed")
    }
  }, [key, enabled])

  useEffect(() => {
    if (phaseRef.current.phase !== "restoring") return
    if (phaseRef.current.expectedRestore !== fingerprint) return
    phaseRef.current.phase = "active"
    phaseRef.current.expectedRestore = null
    setStatus(enabled ? "saved" : "off")
  }, [fingerprint, enabled])

  useEffect(() => {
    if (!ready || !key || phaseRef.current.phase !== "active") return
    if (!enabled) {
      setStatus("off")
      return
    }
    if (fingerprint === phaseRef.current.persisted) {
      setStatus("saved")
      return
    }
    setStatus("editing")
    const timer = setTimeout(() => {
      if (phaseRef.current.phase !== "active" || phaseRef.current.key !== key)
        return
      try {
        writeLocalDraft(window.localStorage, key, editableFiles)
        phaseRef.current.persisted = fingerprint
        setStatus("saved")
        setError(null)
      } catch (cause) {
        setStatus("error")
        setError(cause instanceof Error ? cause.message : "Local save failed")
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [enabled, key, ready, fingerprint])

  useEffect(() => {
    if (!key) return
    const handleOtherTab = (event: StorageEvent) => {
      if (event.key !== key) return
      if (event.newValue === null) return
      if (phaseRef.current.phase !== "active") return
      phaseRef.current.phase = "conflict"
      setStatus("conflict")
      setError("This draft changed in another tab. Reload before continuing.")
    }
    window.addEventListener("storage", handleOtherTab)
    return () => window.removeEventListener("storage", handleOtherTab)
  }, [key])

  const changeEnabled = useCallback((nextEnabled: boolean) => {
    try {
      window.localStorage.setItem(LOCAL_AUTOSAVE_SETTING, String(nextEnabled))
      setEnabled(nextEnabled)
      setError(null)
    } catch (cause) {
      setStatus("error")
      setError(cause instanceof Error ? cause.message : "Unable to save autosave preference")
    }
  }, [])

  return {
    enabled,
    changeEnabled,
    status,
    error,
    restoreCandidate,
    restoreDraft,
    discardStoredDraft,
    canSaveLocally: Boolean(key && ready),
  }
}
