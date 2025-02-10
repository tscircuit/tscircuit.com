import sharp from "sharp"
import path from "path"
import fs from "fs"

const WIDTHS = [400, 600, 800, 1000, 1200, 1600, 2000]
const INPUT_DIR = "src/assets/originals"
const OUTPUT_DIR = "public/assets"

async function generateImageSizes() {
  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true })
  }
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const files = fs.readdirSync(INPUT_DIR)

  for (const file of files) {
    if (file.startsWith(".")) continue

    const filePath = path.join(INPUT_DIR, file)
    const fileNameWithoutExt = path.parse(file).name
    const outputDirForFile = path.join(OUTPUT_DIR)

    if (!fs.existsSync(outputDirForFile)) {
      fs.mkdirSync(outputDirForFile, { recursive: true })
    }

    for (const width of WIDTHS) {
      const extension = path.extname(file)
      const outputPath = path.join(
        outputDirForFile,
        `${fileNameWithoutExt}-${width}w${extension}`,
      )

      try {
        await sharp(filePath)
          .resize(width, null, {
            withoutEnlargement: true,
            fit: "inside",
          })
          .webp({
            quality: 80,
            effort: 6,
          })
          .toFile(outputPath)

        console.log(`Generated ${outputPath}`)
      } catch (error) {
        console.error(`Error processing ${filePath} at width ${width}:`, error)
      }
    }
  }
}

generateImageSizes().catch(console.error)
