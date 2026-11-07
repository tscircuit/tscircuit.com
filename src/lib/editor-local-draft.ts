import type { PackageFile } from "@/types/package"
import { z } from "zod"

const changeSchema = z.object({
  path: z.string(),
  before: z.string().nullable(),
  after: z.string().nullable(),
})

const localDraftSchema = z.object({
  version: z.literal(1),
  savedAt: z.number(),
  changes: z.array(changeSchema),
})

export type LocalDraft = z.infer<typeof localDraftSchema>

export function getLocalDraftKey({
  accountId,
  packageId,
  releaseId,
}: {
  accountId: string
  packageId: string
  releaseId: string
}): string {
  return `tscircuit:editor-local-draft:${encodeURIComponent(accountId)}:${encodeURIComponent(packageId)}:${encodeURIComponent(releaseId)}`
}

export function createLocalDraft(
  initialFiles: PackageFile[],
  files: PackageFile[],
): LocalDraft {
  const initialByPath: Record<string, PackageFile> = Object.create(null)
  const currentByPath: Record<string, PackageFile> = Object.create(null)
  for (const file of initialFiles) initialByPath[file.path] = file
  for (const file of files) currentByPath[file.path] = file
  const changes: LocalDraft["changes"] = []

  for (const file of initialFiles) {
    const current = currentByPath[file.path]
    if (current?.content === file.content) continue
    if (file.isBinary || current?.isBinary) {
      throw new Error(
        `Cannot store binary changes in a browser draft: ${file.path}`,
      )
    }
    changes.push({
      path: file.path,
      before: file.content,
      after: current?.content ?? null,
    })
  }

  for (const file of files) {
    if (initialByPath[file.path]) continue
    if (file.isBinary) {
      throw new Error(
        `Cannot store binary changes in a browser draft: ${file.path}`,
      )
    }
    changes.push({ path: file.path, before: null, after: file.content })
  }

  return { version: 1, savedAt: Date.now(), changes }
}

export function parseLocalDraft(raw: string): LocalDraft {
  return localDraftSchema.parse(JSON.parse(raw))
}

export function getLocalDraftConflicts(
  initialFiles: PackageFile[],
  draft: LocalDraft,
): string[] {
  const initialByPath: Record<string, PackageFile> = Object.create(null)
  for (const file of initialFiles) initialByPath[file.path] = file
  return draft.changes
    .filter((change) => {
      const file = initialByPath[change.path]
      return (
        Boolean(file?.isBinary) || (file?.content ?? null) !== change.before
      )
    })
    .map((change) => change.path)
}

export function applyLocalDraft(
  initialFiles: PackageFile[],
  draft: LocalDraft,
): PackageFile[] {
  const files: Record<string, PackageFile> = Object.create(null)
  for (const file of initialFiles) files[file.path] = file
  for (const change of draft.changes) {
    if (change.after === null) {
      delete files[change.path]
    } else {
      const previous = files[change.path]
      files[change.path] = {
        ...previous,
        path: change.path,
        content: change.after,
      }
    }
  }
  return Object.values(files)
}
