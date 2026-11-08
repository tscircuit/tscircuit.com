export const convertSvgToPng = async (svgString: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Failed to get canvas context"))
      return
    }

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width || 800
      canvas.height = img.height || 600
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Failed to convert canvas to blob"))
      }, "image/png")
    }
    img.onerror = () => reject(new Error("Failed to load SVG image"))

    const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)
    img.src = url
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  })
}
