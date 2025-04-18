export const checkIfManualEditsImported = (files: Record<string, string>) => {
  const importRegex =
    /import\s+(?:\*\s+as\s+)?([a-zA-Z_$][\w$]*)\s+from\s+["']\.\/manual-edits\.json["'];?/
  const hasManualEditsImported = importRegex.test(files["index.tsx"])
  return files["manual-edits.json"]?.length > 0 && !hasManualEditsImported
}
