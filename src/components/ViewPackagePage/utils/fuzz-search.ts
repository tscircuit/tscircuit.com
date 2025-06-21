export const fuzzyMatch = (
  pattern: string,
  text: string,
): { score: number; matches: number[] } => {
  if (!pattern) return { score: 0, matches: [] }

  const normalizePattern = (pat: string) => {
    return pat.toLowerCase().split(" ").join("")
  }

  const patternLower = normalizePattern(pattern)
  const textLower = text.toLowerCase()
  const matches: number[] = []

  let patternIdx = 0
  let score = 0
  let consecutiveMatches = 0
  let spaceBonus = 0

  const spaceSegments = pattern.toLowerCase().trim().split(/\s+/)
  const isSpaceSeparated = spaceSegments.length > 1

  if (isSpaceSeparated) {
    let segmentIdx = 0
    let currentSegment = spaceSegments[0]
    let segmentCharIdx = 0

    for (
      let i = 0;
      i < textLower.length && segmentIdx < spaceSegments.length;
      i++
    ) {
      const char = textLower[i]
      const targetChar = currentSegment[segmentCharIdx]

      if (char === targetChar) {
        matches.push(i)
        segmentCharIdx++
        consecutiveMatches++
        score += 1 + consecutiveMatches * 0.5

        if (i === 0 || /[/\-_.]/.test(text[i - 1])) {
          score += 2
        }

        if (segmentCharIdx >= currentSegment.length) {
          segmentIdx++
          spaceBonus += 3

          if (segmentIdx < spaceSegments.length) {
            currentSegment = spaceSegments[segmentIdx]
            segmentCharIdx = 0
            consecutiveMatches = 0
          }
        }
      } else {
        if (
          segmentCharIdx > 0 &&
          /[/\-_.]/.test(char) &&
          segmentIdx < spaceSegments.length - 1
        ) {
          segmentIdx++
          if (segmentIdx < spaceSegments.length) {
            currentSegment = spaceSegments[segmentIdx]
            segmentCharIdx = 0
            consecutiveMatches = 0
            if (char === currentSegment[0]) {
              matches.push(i)
              segmentCharIdx = 1
              score += 2
            }
          }
        } else {
          consecutiveMatches = 0
        }
      }
    }

    if (
      segmentIdx < spaceSegments.length ||
      (segmentIdx === spaceSegments.length - 1 &&
        segmentCharIdx < currentSegment.length)
    ) {
      return { score: -1, matches: [] }
    }

    score += spaceBonus
  } else {
    for (
      let i = 0;
      i < textLower.length && patternIdx < patternLower.length;
      i++
    ) {
      if (textLower[i] === patternLower[patternIdx]) {
        matches.push(i)
        patternIdx++
        consecutiveMatches++

        score += 1 + consecutiveMatches * 0.5

        if (i === 0 || /[/\-_.]/.test(text[i - 1])) {
          score += 2
        }
      } else {
        consecutiveMatches = 0
      }
    }

    if (patternIdx !== patternLower.length) return { score: -1, matches: [] }
  }

  score += Math.max(0, 100 - text.length) * 0.1

  const fileName = text.split("/").pop() || text
  const queryFileName = pattern.replace(/\s+/g, "")
  if (fileName.toLowerCase().includes(queryFileName.toLowerCase())) {
    score += 5
  }

  return { score, matches }
}
