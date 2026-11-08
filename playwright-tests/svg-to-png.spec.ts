import { expect, test } from "@playwright/test"

test("SVG-to-PNG conversion cleans up after success and failure and permits retry", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5177/")
  const result = await page.evaluate(async () => {
    const moduleUrl = "/src/lib/download-fns/convert-svg-to-png.ts"
    const { convertSvgToPng } = await import(moduleUrl)
    const originalRevoke = URL.revokeObjectURL
    const originalToBlob = HTMLCanvasElement.prototype.toBlob
    const revokedUrls: string[] = []
    URL.revokeObjectURL = (url) => {
      revokedUrls.push(url)
      originalRevoke.call(URL, url)
    }
    const validSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12"><rect width="16" height="12" fill="black"/></svg>'
    let loadError = ""
    let encodeError = ""
    try {
      const firstPng = await convertSvgToPng(validSvg)
      try {
        await convertSvgToPng("<svg")
      } catch (error) {
        loadError = error instanceof Error ? error.message : String(error)
      }
      HTMLCanvasElement.prototype.toBlob = () => {
        throw new DOMException("PNG encoding failed", "SecurityError")
      }
      try {
        await convertSvgToPng(validSvg)
      } catch (error) {
        encodeError = error instanceof Error ? error.message : String(error)
      } finally {
        HTMLCanvasElement.prototype.toBlob = originalToBlob
      }
      const retriedPng = await convertSvgToPng(validSvg)
      return {
        firstType: firstPng.type,
        retryType: retriedPng.type,
        retrySize: retriedPng.size,
        revokedCount: revokedUrls.length,
        uniqueRevokedCount: new Set(revokedUrls).size,
        loadError,
        encodeError,
      }
    } finally {
      HTMLCanvasElement.prototype.toBlob = originalToBlob
      URL.revokeObjectURL = originalRevoke
    }
  })
  expect(result.firstType).toBe("image/png")
  expect(result.retryType).toBe("image/png")
  expect(result.retrySize).toBeGreaterThan(0)
  expect(result.revokedCount).toBe(4)
  expect(result.uniqueRevokedCount).toBe(4)
  expect(result.loadError).toBe("Failed to load SVG image")
  expect(result.encodeError).toBe("PNG encoding failed")
})
