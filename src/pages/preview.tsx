import { CircuitToSvgWithMouseControl } from "@/components/CircuitToSvgWithMouseControl"
import { useSnippet } from "@/hooks/use-snippet"
import { useUrlParams } from "@/hooks/use-url-params"
import { CadViewer } from "@tscircuit/3d-viewer"
import { PCBViewer } from "@tscircuit/pcb-viewer"
import { Loader2 } from "lucide-react"

export const PreviewPage = () => {
  const urlParams = useUrlParams()
  const snippetId = urlParams.snippet_id
  const view = urlParams.view || "pcb"
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

  const validViews = ["pcb", "3d", "schematic"]
  if (!validViews.includes(view)) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Invalid view type. Valid views are: {validViews.join(", ")}
      </div>
    )
  }

  return (
    <div className="w-full h-screen">
      {view === "pcb" && (
        <PCBViewer soup={snippet.circuit_json} height={window.innerHeight} />
      )}
      {view === "3d" && <CadViewer soup={snippet.circuit_json as any} />}
      {view === "schematic" && (
        <CircuitToSvgWithMouseControl
          circuitJson={snippet.circuit_json as any}
        />
      )}
    </div>
  )
}
