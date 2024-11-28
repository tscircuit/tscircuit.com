export const parseJsonOrNull = (jsonString: string): any | null => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}
