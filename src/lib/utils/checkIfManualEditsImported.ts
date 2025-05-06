export const checkIfManualEditsImported = (
  files: Record<string, string>,
  file: string = "index.tsx",
) => {
  if (!files[file]) return false
  const importRegex =
    /import\s+(?:\*\s+as\s+)?([a-zA-Z_$][\w$]*)\s+from\s+["'](?:\.\/)?manual-edits\.json["'];?/
  const hasManualEditsImported = importRegex.test(files[file])
  return !!files["manual-edits.json"] && !hasManualEditsImported
}
