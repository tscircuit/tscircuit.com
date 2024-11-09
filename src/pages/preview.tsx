import { PreviewContent } from "@/components/PreviewContent"
import { useRunTsx } from "@/hooks/use-run-tsx"
import { useSnippet } from "@/hooks/use-snippet"
import { useUrlParams } from "@/hooks/use-url-params"
import { useState } from "react"

export const PreviewPage = () => {
  const urlParams = useUrlParams()
  const snippetId = urlParams.snippet_id
  const { data: snippet } = useSnippet(snippetId)
  const [manualEditsFileContent, setManualEditsFileContent] = useState("")

  const {
    message: errorMessage,
    circuitJson,
    triggerRunTsx,
    tsxRunTriggerCount,
  } = useRunTsx({
    code: snippet?.code ?? "",
    type: snippet?.snippet_type,
  })

  if (!snippet) return null

  return (
    <div className="w-full h-full">
      <PreviewContent
        className="w-full h-full"
        code={snippet.code}
        triggerRunTsx={triggerRunTsx}
        tsxRunTriggerCount={tsxRunTriggerCount}
        errorMessage={errorMessage}
        circuitJson={circuitJson}
        showCodeTab={false}
        showJsonTab={true}
        showImportAndFormatButtons={false}
        manualEditsFileContent={manualEditsFileContent}
        onManualEditsFileContentChange={setManualEditsFileContent}
      />
    </div>
  )
}
