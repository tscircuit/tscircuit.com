export const downloadCircuitJson = (content: string, filename: string) => {
  const circuitJson = JSON.stringify(content, null, 2)
  const blob = new Blob([circuitJson], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
