import { useSnippet } from "@/hooks/use-snippet"
import { useUrlParams } from "@/hooks/use-url-params"
import { CircuitJsonPreview } from "@tscircuit/runframe"
import { Loader2 } from "lucide-react"

export const PreviewPage = () => {
  const urlParams = useUrlParams()
  const snippetId = urlParams.snippet_id
  const { data: snippet, isLoading, error } = useSnippet(snippetId)

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-500">
        Error loading snippet: {error.message}
      </div>
    )
  }

  if (!snippet) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Snippet not found
      </div>
    )
  }

  if (!snippet.circuit_json) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        No circuit data available
      </div>
    )
  }

  return <CircuitJsonPreview circuitJson={snippet.circuit_json as any} />
}
