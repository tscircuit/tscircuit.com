import { lazy, Suspense, useCallback, useId, useState } from "react"
import type {
  PublishedReferenceDesign,
  ReferenceDesignConfiguration,
} from "@tscircuit/runframe/reference-designs"
import { useDatasheetReferenceDesigns } from "@/hooks/use-datasheet-reference-designs"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { loadReferenceDesignArtifacts } from "@/lib/load-reference-design-artifacts"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"

const ReferenceDesignViewer = lazy(async () => ({
  default: (await import("@tscircuit/runframe/preview")).ReferenceDesignViewer,
}))

function DatasheetReferenceDesign({
  publishedReferenceDesign,
}: {
  publishedReferenceDesign: PublishedReferenceDesign
}) {
  const apiBaseUrl = useApiBaseUrl()
  const loadConfiguration = useCallback(
    (request: {
      configuration: ReferenceDesignConfiguration
      signal: AbortSignal
    }) =>
      loadReferenceDesignArtifacts({
        ...request,
        apiBaseUrl,
        publishedReferenceDesign,
      }),
    [apiBaseUrl, publishedReferenceDesign],
  )
  return (
    <Suspense
      fallback={
        <div className="h-[540px] animate-pulse rounded-md bg-gray-50" />
      }
    >
      <ReferenceDesignViewer
        referenceDesign={publishedReferenceDesign.reference_design}
        loadConfiguration={loadConfiguration}
      />
    </Suspense>
  )
}

export function DatasheetReferenceDesigns({ chipName }: { chipName: string }) {
  const query = useDatasheetReferenceDesigns(chipName)
  const selectId = useId()
  const [selectedDesignKey, setSelectedDesignKey] = useState("")
  const designs =
    query.data?.pages.flatMap((page) => page.reference_designs) ?? []
  const selectedDesign =
    designs.find(
      (design) =>
        `${design.package_release_id}:${design.reference_design.name}` ===
        selectedDesignKey,
    ) ?? designs[0]
  if (query.isLoading || (!selectedDesign && !query.error)) return null
  return (
    <Card className="mb-6 min-w-0">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl font-semibold">
          Reference designs
        </CardTitle>
        {designs.length > 1 && (
          <div className="min-w-0">
            <label htmlFor={selectId} className="sr-only">
              Reference design
            </label>
            <select
              id={selectId}
              value={
                selectedDesign
                  ? `${selectedDesign.package_release_id}:${selectedDesign.reference_design.name}`
                  : ""
              }
              onChange={(event) => setSelectedDesignKey(event.target.value)}
              className="max-w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {designs.map((design) => (
                <option
                  key={`${design.package_release_id}:${design.reference_design.name}`}
                  value={`${design.package_release_id}:${design.reference_design.name}`}
                >
                  {design.reference_design.display_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>
      <CardContent className="min-w-0">
        {query.error ? (
          <div
            className="flex items-center gap-3 text-sm text-gray-500"
            role="alert"
          >
            Unable to load reference designs.
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          selectedDesign && (
            <>
              {designs.length === 1 && (
                <p className="mb-3 text-sm font-medium text-gray-600">
                  {selectedDesign.reference_design.display_name}
                </p>
              )}
              <DatasheetReferenceDesign
                key={`${selectedDesign.package_release_id}:${selectedDesign.reference_design.name}`}
                publishedReferenceDesign={selectedDesign}
              />
            </>
          )
        )}
        {query.hasNextPage && (
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            More designs
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
