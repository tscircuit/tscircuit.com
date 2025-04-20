import type { FileContent } from "@/components/package-port/CodeEditor"

export const findTargetFile = (
  files: FileContent[],
  filePathFromUrl: string | null,
): FileContent | null => {
  console.log('Input files:', files)
  console.log('Input filePathFromUrl:', filePathFromUrl)

  if (files.length === 0) {
    console.log('Files array is empty, returning null')
    return null
  }

  let targetFile: FileContent | null = null
  console.log('Initial targetFile:', targetFile)

  if (!targetFile && filePathFromUrl) {
    targetFile = files.find((file) => file.path === filePathFromUrl) ?? null
    console.log('After checking filePathFromUrl, targetFile:', targetFile)
  }

  const configFile = files.find((file) => file.path === "tscircuit.config.json")
  console.log('Found configFile:', configFile)
  
  if (configFile && !targetFile) {
    try {
      const config = JSON.parse(configFile.content)
      console.log('Parsed config:', config, typeof config.mainComponent)
      
      if (config && typeof config.mainComponent === "string") {
        const mainComponentPath = config.mainComponent
        console.log('mainComponentPath:', mainComponentPath)
        
        const normalizedPath = mainComponentPath.startsWith("./")
          ? mainComponentPath.substring(2)
          : mainComponentPath
        console.log('normalizedPath:', normalizedPath)
        
        targetFile = files.find((file) => file.path === normalizedPath) ?? null
        console.log('After checking config mainComponent, targetFile:', targetFile)
      }
    } catch (error) {
      console.log('Error parsing config file:', error)
    }
  }

  if (!targetFile) {
    targetFile = files.find((file) => file.path === "index.tsx") ?? null
    console.log('After checking for index.tsx, targetFile:', targetFile)
  }

  if (!targetFile) {
    targetFile = files.find((file) => file.path.endsWith(".tsx")) ?? null
    console.log('After checking for .tsx files, targetFile:', targetFile)
  }

  if (!targetFile) {
    targetFile = files.find((file) => file.path === "index.ts") ?? null
    console.log('After checking for index.ts, targetFile:', targetFile)
  }

  if (!targetFile && files[0]) {
    targetFile = files[0]
    console.log('Using first file as fallback, targetFile:', targetFile)
  }

  console.log('Final targetFile:', targetFile)
  return targetFile
}
