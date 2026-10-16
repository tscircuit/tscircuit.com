export const getImportsFromCode = (code: string): string[] => {
  const importRegex =
    /import\s+(?:(?:(?:\*\s+as\s+\w+)|(?:[\w\s,{}]+))\s+from\s+)?['"](.+?)['"]/g
  const imports: string[] = []
  let match: RegExpExecArray | null

  // biome-ignore lint/suspicious/noAssignInExpressions: Retain the existing import extraction behavior.
  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1])
  }

  return imports
}
