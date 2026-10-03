import { useEffect, useMemo, useState } from "react"
import { AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDatasheetFootprintSvgUrl } from "@/lib/datasheet-footprint"

export const DatasheetFootprint = ({
  chipName,
  footprinterString,
}: {
  chipName: string
  footprinterString?: string | null
}) => {
  if (!footprinterString?.trim()) return null

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Footprint</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <FootprintPreview
          key={`${chipName}:${footprinterString}`}
          chipName={chipName}
          footprinterString={footprinterString}
        />
        <div className="min-w-0">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Footprinter string
          </p>
          <pre className="rounded-lg border bg-slate-50 p-4 text-sm whitespace-pre-wrap break-all">
            <code>{footprinterString}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

const FootprintPreview = ({
  chipName,
  footprinterString,
}: {
  chipName: string
  footprinterString: string
}) => {
  const svgUrl = useMemo(
    () => getDatasheetFootprintSvgUrl(footprinterString),
    [footprinterString],
  )
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
      <div className="relative flex h-72 items-center justify-center rounded-lg border bg-slate-50">
        {status === "loading" && (
          <p
            role="status"
            className="absolute flex items-center gap-2 text-sm text-gray-500"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading footprint…
          </p>
        )}
        {status === "error" ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 p-4 text-center"
          >
            <AlertCircle className="h-6 w-6 text-gray-500" aria-hidden="true" />
            <p className="text-sm text-gray-600">
              Footprint preview could not be loaded.
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
            alt={`${chipName} PCB footprint`}
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
