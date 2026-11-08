import { useCallback, useEffect, useRef, useState } from "react"
import { useAxios } from "./use-axios"
import { useIsUsingFakeApi } from "./use-is-using-fake-api"
import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import type { PackageFile } from "@/types/package"

type DraftStatus = "loading" | "editing" | "saving" | "saved" | "error"
type DraftFile = { path: string; content: string }
type Draft = {
  revision: number
  files: DraftFile[]
  last_build_requested_revision: number | null
}

export const draftSnapshot = (files: PackageFile[]): DraftFile[] =>
  files
    .filter((file) => !isHiddenFile(file.path))
    .map((file) => ({ path: file.path, content: file.content ?? "" }))
    .sort((a, b) => a.path.localeCompare(b.path))

const serialize = (files: DraftFile[]): string => JSON.stringify(files)

/**
 * Draft saves never touch package releases or RunFrame's execution.
 * Enabled only for the Fake API until the production draft contract exists.
 *
 * Requests are serialized. A 409 conflict is surfaced, never overwritten.
 */
export function useDraftAutosave({
  packageId,
  enabled,
  files,
  initialFiles,
  onRestore,
}: {
  packageId?: string
  enabled: boolean
  files: PackageFile[]
  initialFiles: PackageFile[]
  onRestore: (files: PackageFile[]) => void
}) {
  const axios = useAxios()
  const usesFakeApi = useIsUsingFakeApi()
  const active = usesFakeApi && enabled && Boolean(packageId)
  const [status, setStatus] = useState<DraftStatus>("loading")
  const [revision, setRevision] = useState(0)
  const [builtRevision, setBuiltRevision] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const state = useRef({
    packageId: "",
    revision: 0,
    builtRevision: null as number | null,
    confirmed: "",
    latest: "[]" as string,
    loading: true,
    queue: Promise.resolve(),
    nextGeneration: 0,
  })
  const filesRef = useRef(files)
  filesRef.current = files
  const initialFilesRef = useRef(initialFiles)
  initialFilesRef.current = initialFiles
  const restoreRef = useRef(onRestore)
  restoreRef.current = onRestore
  const apiRef = useRef(axios)
  apiRef.current = axios

  useEffect(() => {
    if (!active || !packageId) {
      state.current.nextGeneration++
      setReady(false)
      return
    }
    let cancelled = false
    const currentGeneration = ++state.current.nextGeneration
    state.current.packageId = packageId
    state.current.loading = true
    state.current.revision = 0
    state.current.builtRevision = null
    setStatus("loading")
    setError(null)
    setReady(false)

    void (async () => {
      try {
        const response = await apiRef.current.get<{ draft: Draft | null }>(
          "/package_drafts/get",
          { params: { package_id: packageId } },
        )
        if (cancelled || state.current.nextGeneration !== currentGeneration)
          return

        const draft = response.data.draft
        const source = draft?.files ?? draftSnapshot(initialFilesRef.current)
        const snapshot = serialize(source)
        state.current.revision = draft?.revision ?? 0
        state.current.builtRevision =
          draft?.last_build_requested_revision ?? null
        state.current.confirmed = snapshot
        state.current.latest = snapshot

        if (draft) {
          // Preserve generated/hidden files from the loaded release. The draft
          // tracks only editable source files, not ignored dependencies.
          const untouched = initialFilesRef.current.filter((file) =>
            isHiddenFile(file.path),
          )
          restoreRef.current([
            ...untouched,
            ...draft.files.map((file) => ({ ...file })),
          ])
        }
        setRevision(state.current.revision)
        setBuiltRevision(state.current.builtRevision)
        state.current.loading = false
        setReady(true)
        setStatus("saved")
      } catch (cause) {
        if (cancelled || state.current.nextGeneration !== currentGeneration)
          return
        state.current.loading = true
        setError(
          cause instanceof Error ? cause.message : "Unable to load draft",
        )
        setStatus("error")
      }
    })()

    return () => {
      cancelled = true
      state.current.nextGeneration++
    }
    // Restore only when the package changes, not after each editor keystroke.
  }, [active, packageId])

  const currentSnapshot = serialize(draftSnapshot(files))
  const initialSnapshot = serialize(draftSnapshot(initialFiles))
  const loadedSnapshotRef = useRef<string | null>(null)

  useEffect(() => {
    if (!active || !ready) return
    // Skip the one render with the old release files while restored draft is
    // being committed by React. The next render contains the restored files.
    if (loadedSnapshotRef.current !== packageId) {
      loadedSnapshotRef.current = packageId ?? null
      if (state.current.confirmed !== initialSnapshot) return
    }
    state.current.latest = currentSnapshot
    if (currentSnapshot !== state.current.confirmed) {
      setStatus("editing")
    } else {
      setStatus("saved")
    }
  }, [active, ready, packageId, currentSnapshot, initialSnapshot])

  const flush = useCallback(async () => {
    if (!active || !packageId || state.current.loading) {
      throw new Error("Draft is not ready to save")
    }
    const generation = state.current.nextGeneration
    const requested = serialize(draftSnapshot(filesRef.current))
    state.current.latest = requested

    const save = async () => {
      if (generation !== state.current.nextGeneration) {
        throw new Error("Draft has changed packages")
      }
      if (requested === state.current.confirmed && state.current.revision > 0) {
        return state.current.revision
      }
      setStatus("saving")
      setError(null)
      try {
        const result = await apiRef.current.post<{
          ok: boolean
          draft: Draft
          build_triggered: false
        }>("/package_drafts/save", {
          package_id: packageId,
          expected_revision: state.current.revision,
          files: JSON.parse(requested),
        })
        if (!result.data.ok || result.data.build_triggered !== false) {
          throw new Error("Draft save was not acknowledged")
        }
        if (generation !== state.current.nextGeneration) {
          throw new Error("Draft has changed packages")
        }
        state.current.revision = result.data.draft.revision
        state.current.confirmed = requested
        setRevision(state.current.revision)
        setStatus(state.current.latest === requested ? "saved" : "editing")
        return state.current.revision
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Draft save failed"
        setError(message)
        setStatus("error")
        throw cause
      }
    }

    const queued = state.current.queue.then(save)
    // A failed save must not permanently poison future attempts.
    state.current.queue = queued.then(
      () => undefined,
      () => undefined,
    )
    return queued
  }, [active, packageId])

  useEffect(() => {
    if (!active || !ready || currentSnapshot === state.current.confirmed) return
    // Never autosave while React is still displaying files from the release
    // instead of a restored draft.
    if (state.current.latest !== currentSnapshot) return
    const timer = setTimeout(() => {
      void flush().catch(() => {
        // Keep the error visible until the user edits or explicitly retries.
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [active, ready, currentSnapshot, flush])

  const buildAndExit = useCallback(async () => {
    if (!active || !packageId) throw new Error("Draft feature unavailable")
    const savedRevision = await flush()
    // Do not build when the editor has changed again during the request.
    if (
      serialize(draftSnapshot(filesRef.current)) !== state.current.confirmed
    ) {
      throw new Error(
        "New edits appeared during save. Save again before building.",
      )
    }
    const response = await apiRef.current.post<{
      ok: boolean
      build_requested: boolean
    }>("/package_drafts/build", {
      package_id: packageId,
      expected_revision: savedRevision,
    })
    if (!response.data.ok || !response.data.build_requested) {
      throw new Error("Server did not accept the build request")
    }
    state.current.builtRevision = savedRevision
    setBuiltRevision(savedRevision)
  }, [active, packageId, flush])

  return {
    active,
    ready,
    status,
    error,
    revision,
    builtRevision,
    isBuildOutdated: ready && revision > 0 && builtRevision !== revision,
    hasUnsavedChanges: ready && currentSnapshot !== state.current.confirmed,
    flush,
    buildAndExit,
  }
}
