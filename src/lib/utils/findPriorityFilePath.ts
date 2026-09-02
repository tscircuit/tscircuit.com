import { findTargetFile } from "./findTargetFile"

export const findPriorityFilePath = (
  files: { file_path: string }[],
  priorityFilePath?: string | null,
): string | null => {
  if (priorityFilePath) {
    const exactMatch = files.find((f) => f.file_path === priorityFilePath)
    if (exactMatch) return exactMatch.file_path

    const partialMatch = files.find(
      (f) =>
        f.file_path.includes(priorityFilePath) ||
        priorityFilePath.includes(f.file_path),
    )
    if (partialMatch) return partialMatch.file_path
  }

  // Only paths are available before file contents load. Reuse the editor's
  // default selection rules instead of relying on the API's file order.
  return (
    findTargetFile({
      files: files.map((file) => ({ path: file.file_path, content: "" })),
      filePathFromUrl: null,
    })?.path ?? null
  )
}
