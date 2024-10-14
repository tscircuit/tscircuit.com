export const createBlobURL = (content: string) => {
  const blob = new Blob([content], { type: "text/plain" })
  return URL.createObjectURL(blob)
}
