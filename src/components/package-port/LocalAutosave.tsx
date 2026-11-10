import { useEffect, useRef, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { isHiddenFile } from "../ViewPackagePage/utils/is-hidden-file"
import type { PackageFile } from "@/types/package"

const preferenceKey = "tscircuit:local-autosave:enabled"
const editable = (file: PackageFile) =>
  !file.isBinary && !isHiddenFile(file.path)

const serialize = (files: PackageFile[]) =>
  JSON.stringify(
    files
      .filter(editable)
      .map(({ path, content }) => ({ path, content }))
      .sort((a, b) => a.path.localeCompare(b.path)),
  )

// The key isolates each account/project; ready waits for the initial file load.
export function LocalAutosave({
  storageKey,
  ready,
  files,
  onRestore,
}: {
  storageKey: string
  ready: boolean
  files: PackageFile[]
  onRestore: (files: PackageFile[]) => void
}) {
  const snapshot = serialize(files)
  const [enabled, setEnabled] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const [draft, setDraft] = useState<PackageFile[] | null>(null)
  const [error, setError] = useState("")
  const initialized = useRef(false)
  const blocked = useRef(false)
  const fail = (cause: unknown) => {
    blocked.current = true
    setSaved(null)
    setError(
      `${cause instanceof Error ? cause.message : String(cause)}. Reload before continuing.`,
    )
  }

  useEffect(() => {
    if (!ready || initialized.current) return
    initialized.current = true
    try {
      setEnabled(window.localStorage.getItem(preferenceKey) !== "false")
      const raw = window.localStorage.getItem(storageKey)
      if (raw !== null) {
        const stored: unknown = JSON.parse(raw)
        if (
          !Array.isArray(stored) ||
          stored.some(
            (file) =>
              !file ||
              typeof file.path !== "string" ||
              typeof file.content !== "string" ||
              !editable(file),
          ) ||
          new Set(stored.map((file) => file.path)).size !== stored.length
        ) {
          throw new Error("Invalid local draft; it has not been overwritten")
        }
        if (raw === snapshot) setSaved(raw)
        else setDraft(stored)
      }
    } catch (cause) {
      fail(cause)
    }
    setLoaded(true)
  }, [ready])

  useEffect(() => {
    if (!loaded || !enabled || draft || error || saved === snapshot) return
    const timer = setTimeout(() => {
      if (blocked.current) return
      try {
        window.localStorage.setItem(storageKey, snapshot)
        setSaved(snapshot)
      } catch (cause) {
        fail(cause)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [loaded, enabled, draft, error, saved, snapshot, storageKey])

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if (
        event.storageArea === window.localStorage &&
        (event.key === null || event.key === storageKey)
      ) {
        fail(new Error("Local draft changed in another tab"))
      }
    }
    window.addEventListener("storage", changed)
    return () => window.removeEventListener("storage", changed)
  }, [storageKey])

  return (
    <div className="ml-2 flex flex-col gap-1 text-xs text-gray-700">
      <label
        className="inline-flex items-center gap-2"
        title="Saves a draft in this browser only. Does not publish your changes or start a build."
      >
        <span className="whitespace-nowrap">AutoSave Drafts</span>
        <Switch
          aria-label="Local AutoSave"
          checked={enabled}
          disabled={!loaded}
          onCheckedChange={(next) => {
            setEnabled(next)
            try {
              window.localStorage.setItem(preferenceKey, String(next))
            } catch (cause) {
              fail(cause)
            }
          }}
        />
        <span role="status" className="text-xs text-gray-600">
          {!error && !draft && saved === snapshot ? "Saved" : "Not saved"}
        </span>
      </label>
      {draft && (
        <div className="flex items-center gap-2">
          <span>Restore local draft?</span>
          <button
            className="underline"
            disabled={Boolean(error)}
            onClick={() => {
              onRestore([...files.filter((file) => !editable(file)), ...draft])
              setSaved(serialize(draft))
              setDraft(null)
            }}
          >
            Restore
          </button>
          <button
            className="underline"
            disabled={Boolean(error)}
            onClick={() => {
              try {
                window.localStorage.removeItem(storageKey)
                setDraft(null)
                setSaved(null)
              } catch (cause) {
                fail(cause)
              }
            }}
          >
            Discard
          </button>
        </div>
      )}
      {error && (
        <span role="alert" className="text-red-600">
          Local save failed: {error}
        </span>
      )}
    </div>
  )
}
