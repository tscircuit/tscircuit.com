import { isHiddenFile } from "@/components/ViewPackagePage/utils/is-hidden-file"
import type { PackageFile } from "@/types/package"

export const LOCAL_AUTOSAVE_SETTING = "tscircuit:editor:local-autosave:enabled"
const LOCAL_DRAFT_VERSION = 1
const MAX_LOCAL_DRAFT_LENGTH = 2_000_000

export type LocalDraftFile = { path: string; content: string }
export type LocalDraft = {
  version: 1
  savedAt: string
  files: LocalDraftFile[]
}

export function localDraftKey(accountId: string, projectId: string): string {
  return `tscircuit:editor:local-draft:v1:${encodeURIComponent(accountId)}:${encodeURIComponent(projectId)}`
}

export function snapshotEditableFiles(files: PackageFile[]): LocalDraftFile[] {
  return files
    .filter((file) => !file.isBinary && !isHiddenFile(file.path))
    .map((file) => ({ path: file.path, content: file.content }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

export function draftFingerprint(files: LocalDraftFile[]): string {
  return JSON.stringify(files)
}

export function readLocalDraft(storage: Storage, key: string): LocalDraft | null {
  const raw = storage.getItem(key)
  if (raw === null) return null
  const value: unknown = JSON.parse(raw)
  if (
    !value ||
    typeof value !== "object" ||
    !("version" in value) ||
    value.version !== LOCAL_DRAFT_VERSION ||
    !("files" in value) ||
    !Array.isArray(value.files) ||
    !("savedAt" in value) ||
    typeof value.savedAt !== "string" ||
    value.files.some(
      (file) =>
        !file ||
        typeof file !== "object" ||
        typeof file.path !== "string" ||
        typeof file.content !== "string",
    )
  ) {
    throw new Error("Local draft is invalid; it was not overwritten.")
  }
  return value as LocalDraft
}

export function writeLocalDraft(
  storage: Storage,
  key: string,
  files: LocalDraftFile[],
): LocalDraft {
  const draft: LocalDraft = {
    version: LOCAL_DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    files,
  }
  const encoded = JSON.stringify(draft)
  if (encoded.length > MAX_LOCAL_DRAFT_LENGTH) {
    throw new Error("Local draft exceeds the 2 MB safety limit. Use manual Save.")
  }
  // Storage quotas and privacy restrictions can throw. Never report success then.
  storage.setItem(key, encoded)
  return draft
}
