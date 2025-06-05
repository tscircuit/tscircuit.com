export const capitalCase = (str: string | null | undefined) => {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}
