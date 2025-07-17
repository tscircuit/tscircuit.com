import fs from "fs"
import path from "path"

const targetDir = path.resolve(process.cwd()) // 🔁 Change folder path here
console.log(targetDir)

function kebabToCamel(fileName: string): string {
  return fileName
    .split("-")
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("")
}

fs.readdirSync(targetDir).forEach((file) => {
  console.log(file, "->", kebabToCamel(file))
  const fullPath = path.join(targetDir, file)

  if (fs.statSync(fullPath).isFile() && file.includes("-")) {
    const ext = path.extname(file) // ".tsx"
    const base = path.basename(file, ext) // remove extension
    const newName = kebabToCamel(base) + ext
    const newPath = path.join(targetDir, newName)

    if (file !== newName) {
      fs.renameSync(fullPath, newPath)
      console.log(`Renamed: ${file} → ${newName}`)
    }
  }
})
