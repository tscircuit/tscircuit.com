export const MAX_CODE_PREVIEW_CHARACTERS = 32 * 1024
export const MAX_CODE_PREVIEW_LINES = 1000

/** Bound work before tokenization, including files with a single very long line. */
export const getCodePreview = (code: string) => {
  const candidate = code.slice(0, MAX_CODE_PREVIEW_CHARACTERS)
  let end = candidate.length
  let offset = 0

  for (let line = 0; line < MAX_CODE_PREVIEW_LINES; line++) {
    const newline = candidate.indexOf("\n", offset)
    if (newline === -1) break
    if (line === MAX_CODE_PREVIEW_LINES - 1) {
      end = newline
      break
    }
    offset = newline + 1
  }

  // Do not cut a Unicode surrogate pair at the character budget.
  if (end < code.length && /[\uD800-\uDBFF]/.test(candidate[end - 1] ?? "")) {
    end--
  }

  return { code: candidate.slice(0, end), isTruncated: end < code.length }
}
