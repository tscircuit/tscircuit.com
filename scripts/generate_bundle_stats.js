import fs from "fs"
import path from "path"

function processData(data, dependencies) {
  const { tree, nodeParts } = data
  const depStats = {}
  let totalSize = 0

  function traverse(node) {
    if (node.uid && nodeParts[node.uid]) {
      const part = nodeParts[node.uid]
      totalSize += part.renderedLength
      const matchedDep = Object.keys(dependencies).find((dep) =>
        node.name.includes(dep),
      )
      if (matchedDep) {
        if (!depStats[matchedDep]) {
          depStats[matchedDep] = { size: 0, files: 0 }
        }
        depStats[matchedDep].size += part.renderedLength
        depStats[matchedDep].files += 1
      }
    }
    if (node.children) {
      node.children.forEach(traverse)
    }
  }

  traverse(tree)

  return { totalSize, depStats }
}

function getDependencies() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))
  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
}

function parseStatsHtml(filePath) {
  console.log(`Attempting to parse file: ${filePath}`)
  const html = fs.readFileSync(filePath, "utf-8")

  const dataMatch = html.match(/const data = (\{.*?\});/s)
  if (dataMatch && dataMatch[1]) {
    try {
      return JSON.parse(dataMatch[1])
    } catch (error) {
      console.error("Error parsing JSON:", error)
      return null
    }
  }
  console.error("Could not find data in the script content")
  return null
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

function compareSizes(prData, mainData, dependencies) {
  const prStats = processData(prData, dependencies)
  const mainStats = processData(mainData, dependencies)

  const diffStats = {}
  const allDeps = new Set([
    ...Object.keys(prStats.depStats),
    ...Object.keys(mainStats.depStats),
  ])

  allDeps.forEach((dep) => {
    const prSize = prStats.depStats[dep]?.size || 0
    const mainSize = mainStats.depStats[dep]?.size || 0
    const diff = prSize - mainSize

    let percentChange = "N/A"
    if (prSize === 0 && mainSize > 0) {
      percentChange = "Removed"
    } else if (mainSize !== 0) {
      percentChange = (diff / mainSize) * 100
    } else if (prSize > 0 && mainSize === 0) {
      percentChange = "Added"
    } else {
      percentChange = 0
    }

    diffStats[dep] = {
      before: mainSize,
      after: prSize,
      diff,
      percentChange,
    }
  })

  return {
    totalBefore: mainStats.totalSize,
    totalAfter: prStats.totalSize,
    totalDiff: prStats.totalSize - mainStats.totalSize,
    totalPercentChange:
      mainStats.totalSize !== 0
        ? ((prStats.totalSize - mainStats.totalSize) / mainStats.totalSize) *
          100
        : 0,
    diffStats,
  }
}

function generateDiffMarkdown(prData, mainData, dependencies) {
  const comparison = compareSizes(prData, mainData, dependencies)
  let markdown = ""
  const totalDiffSymbol = comparison.totalDiff > 0 ? "📈" : "📉"
  markdown += `## Total Bundle Size\n\n`
  markdown += `- Before: **${formatBytes(comparison.totalBefore)}**\n`
  markdown += `- After: **${formatBytes(comparison.totalAfter)}**\n`
  markdown += `- Change: ${totalDiffSymbol} **${formatBytes(Math.abs(comparison.totalDiff))}** (${isNaN(comparison.totalPercentChange) ? "N/A" : comparison.totalPercentChange.toFixed(2)}%)\n\n`

  markdown += `## Diff\n\n`

  const sortedDiffs = Object.entries(comparison.diffStats).sort(
    ([, a], [, b]) => Math.abs(b.diff) - Math.abs(a.diff),
  )

  const significantChanges = sortedDiffs.filter(
    ([, stats]) =>
      (typeof stats.percentChange === "number" &&
        (Math.abs(stats.percentChange) > 1 || Math.abs(stats.diff) > 1024)) ||
      stats.percentChange === "Added" ||
      stats.percentChange === "Removed",
  )

  if (significantChanges.length > 0) {
    markdown += `| Package | Before | After | Diff | Change |\n`
    markdown += `|---------|--------|-------|------|--------|\n`

    for (const [name, stats] of significantChanges) {
      const version = dependencies[name]
      const symbol = stats.diff > 0 ? "📈" : "📉"
      markdown += `| ${name}@${version} | ${formatBytes(stats.before)} | ${formatBytes(stats.after)} | ${symbol} ${formatBytes(Math.abs(stats.diff))} | ${typeof stats.percentChange === "number" ? stats.percentChange.toFixed(2) + "%" : stats.percentChange} |\n`
    }
  } else {
    markdown += "No significant changes in bundle size.\n"
  }

  markdown += `\n<details>\n`
  markdown += `<summary>View Dependencies</summary>\n\n`
  markdown += `| Package | Size |\n`
  markdown += `|---------|------|\n`

  const prStats = processData(prData, dependencies)
  const prDependencies = Object.entries(prStats.depStats).sort(
    ([, a], [, b]) => b.size - a.size,
  )

  for (const [name, stats] of prDependencies) {
    const version = dependencies[name]
    markdown += `| ${name}@${version} | ${formatBytes(stats.size)} |\n`
  }

  markdown += `\n</details>\n`

  return markdown
}

function main() {
  const args = process.argv.slice(2)
  if (args.length !== 2) {
    console.error(
      "Usage: node generate_bundle_stats.js <pr_stats.html> <main_stats.html>",
    )
    process.exit(1)
  }

  const [prStatsFile, mainStatsFile] = args

  try {
    console.log(`Processing PR stats: ${prStatsFile}`)
    console.log(`Processing main stats: ${mainStatsFile}`)

    const prData = parseStatsHtml(prStatsFile)
    const mainData = parseStatsHtml(mainStatsFile)

    if (!prData || !mainData) {
      console.error("Failed to parse stats files")
      process.exit(1)
    }

    const dependencies = getDependencies()
    const markdown = generateDiffMarkdown(prData, mainData, dependencies)

    const outputFile = path.join(path.dirname(prStatsFile), "bundle_stats.md")
    fs.writeFileSync(outputFile, markdown)
    console.log(`Bundle stats comparison markdown generated: ${outputFile}`)
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

main()
