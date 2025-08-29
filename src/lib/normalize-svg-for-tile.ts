export function normalizeSvgForSquareTile(svg: string): string {
  try {
    const openTagMatch = svg.match(/<svg[^>]*>/i)
    if (!openTagMatch) return svg

    const openTag = openTagMatch[0]

    const hasViewBox = /viewBox="[^"]+"/i.test(openTag)
    const widthMatch = openTag.match(/\swidth="([0-9.]+)"/i)
    const heightMatch = openTag.match(/\sheight="([0-9.]+)"/i)

    let newOpenTag = openTag

    // Remove explicit width/height so CSS can control sizing
    newOpenTag = newOpenTag.replace(/\swidth="[^"]*"/i, "")
    newOpenTag = newOpenTag.replace(/\sheight="[^"]*"/i, "")

    // Ensure viewBox is present for proper scaling
    if (!hasViewBox && widthMatch && heightMatch) {
      const w = widthMatch[1]
      const h = heightMatch[1]
      newOpenTag = newOpenTag.replace(/<svg/i, `<svg viewBox="0 0 ${w} ${h}"`)
    }

    // Force preserveAspectRatio to fit within square without distortion
    if (/preserveAspectRatio="[^"]+"/i.test(newOpenTag)) {
      newOpenTag = newOpenTag.replace(
        /preserveAspectRatio="[^"]+"/i,
        'preserveAspectRatio="xMidYMid meet"',
      )
    } else {
      newOpenTag = newOpenTag.replace(
        /<svg(\s|>)/i,
        (_m, p1) => `<svg preserveAspectRatio="xMidYMid meet"${p1}`,
      )
    }

    return svg.replace(openTag, newOpenTag)
  } catch {
    return svg
  }
}
