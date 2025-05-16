export const isValidFileName = (name: string) => {
  // Basic checks for file naming conventions
  const invalidChars = /[<>:"/\\|?*]/
  return name.length > 0 && !invalidChars.test(name)
}
