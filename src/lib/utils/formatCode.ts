import { FileName } from "../../components/CodeEditorHeader"

interface FormatCodeProps {
  currentFile: FileName
  currentContent: string
}

export const formatCode = ({
  currentFile,
  currentContent,
}: FormatCodeProps) => {
  if (!window.prettier || !window.prettierPlugins || !currentContent)
    return null

  if (currentFile.endsWith(".json")) {
    try {
      return JSON.stringify(JSON.parse(currentContent), null, 2)
    } catch (error) {
      console.error("JSON Formatting Error: Invalid JSON format", error)
      return null
    }
  }

  try {
    return window.prettier.format(currentContent, {
      semi: false,
      parser: "typescript",
      plugins: window.prettierPlugins,
    })
  } catch (error) {
    console.error(
      "TypeScript Formatting Error: Prettier failed to format",
      error,
    )
    return null
  }
}
