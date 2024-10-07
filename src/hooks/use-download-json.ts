import { useCurrentSnippetId } from "@/hooks/use-current-snippet-id"
import { useSnippet } from "@/hooks/use-snippet"
import { useMemo, useState } from "react"
import { decodeUrlHashToText } from "@/lib/decodeUrlHashToText"
import { useRunTsx } from "@/hooks/use-run-tsx"

export const useDownloadJSON = () => {
  const snippetId = useCurrentSnippetId()
  const { data: snippet, isLoading } = useSnippet(snippetId)

  const defaultCode = useMemo(() => {
    return decodeUrlHashToText(window.location.toString()) ?? snippet?.code
  }, [])

  const [code, setCode] = useState(defaultCode ?? "")

  const { message, circuitJson } = useRunTsx(code, snippet?.snippet_type)

  const stringifiedCircuitJson = JSON.stringify(circuitJson, null, 2)

  return {
    jsonContent: stringifiedCircuitJson,
    jsonFileName: `${snippet?.name}.json`,
  }
}
