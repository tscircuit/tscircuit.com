import fs from "fs"
import path from "path"

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

function getDependencies() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))
  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }
}

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

function generateMarkdown(data, dependencies) {
  const { totalSize, depStats } = processData(data, dependencies)

  let markdown = `# Bundle Size Analysis\n\n`
  markdown += `Total Bundle Size: **${formatBytes(totalSize)}**\n\n`
  markdown += `## Top Dependencies\n\n`
  markdown += `| Package | Size | Files |\n`
  markdown += `|---------|------|-------|\n`

  const sortedDeps = Object.entries(depStats)
    .sort(([, a], [, b]) => b.size - a.size)
    .slice(0, 10)

  for (const [name, stats] of sortedDeps) {
    const version = dependencies[name]
    markdown += `| ${name}@${version} | ${formatBytes(stats.size)} | ${stats.files} |\n`
  }

  return markdown
}

function main() {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    console.error("Usage: node generate_bundle_stats.js <path_to_stats.html>")
    process.exit(1)
  }

  const inputFile = args[0]
  const outputFile = path.join(path.dirname(inputFile), "bundle_stats.md")

  try {
    console.log(`Processing file: ${inputFile}`)
    if (!fs.existsSync(inputFile)) {
      console.error(`File not found: ${inputFile}`)
      process.exit(1)
    }
    const data = parseStatsHtml(inputFile)
    if (!data) {
      console.error("Failed to parse stats.html")
      process.exit(1)
    }
    const dependencies = getDependencies()
    const markdown = generateMarkdown(data, dependencies)
    if (!markdown) {
      console.error("Failed to generate markdown")
      process.exit(1)
    }
    fs.writeFileSync(outputFile, markdown)
    console.log(`Bundle stats markdown generated: ${outputFile}`)
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

main()
