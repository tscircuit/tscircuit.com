export const parseJsonOrNull = (string: string | null): any => {
  if (!string) return null
  try {
    return JSON.parse(string)
  } catch {
    return null
  }
}
