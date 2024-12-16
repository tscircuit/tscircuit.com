export const checkIfManualEditsImported = (
  files: Record<string, string>,
  hasManualEdits: boolean,
) => {
  const importRegex =
    /import\s+(?:\*\s+as\s+)?([a-zA-Z_$][\w$]*)\s+from\s+["']\.\/manual-edits\.json["'];?/
  const hasManualEditsImported = importRegex.test(files["index.tsx"])
  return hasManualEdits && !hasManualEditsImported
}
