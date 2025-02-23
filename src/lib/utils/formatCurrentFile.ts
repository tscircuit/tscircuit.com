import { FileName } from "../../components/CodeEditorHeader"

interface FormatCurrentFileProps {
  currentFile: FileName
  currentContent: string
}

export const formatCode = ({
  currentFile,
  currentContent,
}: FormatCurrentFileProps) => {
  if (!window.prettier || !window.prettierPlugins || !currentContent)
    return null

  try {
    if (currentFile.endsWith(".json")) {
      return JSON.stringify(JSON.parse(currentContent), null, 2)
    }

    return window.prettier.format(currentContent, {
      semi: false,
      parser: "typescript",
      plugins: window.prettierPlugins,
    })
  } catch (error) {
    console.error("Formatting error:", error)
    return null
  }
}
