export const isValidFileName = (name: string) => {
  const invalidChars = /[<>:"\\|?*]/

  if (name.length === 0) return false
  if (invalidChars.test(name)) return false

  const pathParts = name.split("/")

  for (const part of pathParts) {
    if (part === "") continue
    if (part === "." || part === "..") return false
    if (part.startsWith(" ") || part.endsWith(" ")) return false
    if (part.includes("\\")) return false
  }

  return true
}
