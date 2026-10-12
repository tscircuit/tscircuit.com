import { useEffect, useMemo, useState } from "react"
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DatasheetWithPinAttributes } from "@/lib/datasheet-pin-display"
import { getDatasheetSchematicSvgUrl } from "@/lib/datasheet-schematic-symbol"

export const DatasheetSchematicSymbol = ({
  chipName,
  datasheet,
}: {
  chipName: string
  datasheet: DatasheetWithPinAttributes
}) => {
  const svgUrl = useMemo(
    () => getDatasheetSchematicSvgUrl(datasheet),
    [datasheet],
  )
  if (!svgUrl) return null

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">
          Schematic symbol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SchematicPreview key={svgUrl} chipName={chipName} svgUrl={svgUrl} />
      </CardContent>
    </Card>
  )
}

const SchematicPreview = ({
  chipName,
  svgUrl,
}: {
  chipName: string
  svgUrl: string
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  )
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (status !== "loading") return
    const timeout = window.setTimeout(() => setStatus("error"), 20_000)
    return () => window.clearTimeout(timeout)
  }, [status])

  return (
    <div className="min-w-0">
      <div className="relative flex h-[420px] items-center justify-center rounded-lg border bg-slate-50 md:h-[600px]">
        {status === "loading" && (
          <p
            role="status"
            className="absolute flex items-center gap-2 text-sm text-gray-500"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading schematic symbol…
          </p>
        )}
        {status === "error" ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 p-4 text-center"
          >
            <AlertCircle className="h-6 w-6 text-gray-500" aria-hidden="true" />
            <p className="text-sm text-gray-600">
              Schematic preview could not be loaded.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAttempt((previous) => previous + 1)
                setStatus("loading")
              }}
            >
              Retry preview
            </Button>
          </div>
        ) : (
          <img
            key={attempt}
            src={svgUrl}
            alt={`${chipName} schematic symbol`}
            className={`h-full w-full object-contain p-4 ${status === "loading" ? "opacity-0" : ""}`}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        )}
      </div>
      <a
        href={svgUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        Open SVG
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  )
}
