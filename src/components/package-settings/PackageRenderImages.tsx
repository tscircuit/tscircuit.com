import { useEffect, useState } from "react"
import { useMutation, useQueries, useQuery, useQueryClient } from "react-query"
import { Camera, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { usePackageFiles } from "@/hooks/use-package-files"

const angles = ["angled", "top", "bottom"] as const
type Angle = (typeof angles)[number]
type Render = {
  package_release_render_image_id: string
  status: "queued" | "submitting" | "running" | "succeeded" | "failed"
  circuit_json_file_path: string
  error: string | null
}
const labels = { angled: "Angled", top: "Top", bottom: "Bottom" }
const statuses = {
  queued: "Queued",
  submitting: "Starting",
  running: "Processing",
  succeeded: "Ready",
  failed: "Failed",
}
const errorMessage = (error: any) =>
  error?.data?.error?.message ||
  error?.message ||
  "Could not contact the render service. Please try again."

function RenderPreview({
  releaseId,
  angle,
}: { releaseId: string; angle: Angle }) {
  const axios = useAxios()
  const accountId = useGlobalStore((s) => s.session?.account_id)
  const [imageUrl, setImageUrl] = useState<string>()
  const image = useQuery<Blob>(
    ["package-render-png", accountId, releaseId, angle],
    async () => {
      // Fetch with session headers; an <img src="API URL"> cannot authenticate private images.
      const response = await axios.get(
        "/package_releases/get_render_image_file",
        {
          params: { package_release_id: releaseId, angle },
          responseType: "blob",
        },
      )
      if (
        !(response.data instanceof Blob) ||
        response.data.type.split(";")[0] !== "image/png"
      )
        throw new Error("The image could not be loaded.")
      return response.data
    },
    { retry: false, staleTime: Infinity, cacheTime: 60_000 },
  )
  useEffect(() => {
    if (!image.data) return
    const url = URL.createObjectURL(image.data)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [image.data])
  if (image.isError)
    return (
      <div className="p-4 text-sm" role="alert">
        Could not load this image.
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => image.refetch()}
        >
          Retry image
        </Button>
      </div>
    )
  if (!imageUrl)
    return (
      <div className="flex aspect-[6/5] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading image" />
      </div>
    )
  return (
    <>
      <a
        href={imageUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${labels[angle].toLowerCase()} render`}
      >
        <img
          src={imageUrl}
          alt={`${labels[angle]} rendered board`}
          className="aspect-[6/5] w-full object-contain bg-white"
        />
      </a>
      <a
        className="block border-t px-4 py-2 text-sm text-blue-600 hover:underline"
        href={imageUrl}
        download={`${angle}.png`}
      >
        Download PNG
      </a>
    </>
  )
}

export function PackageRenderImages({
  releaseId,
  version,
  creatorAccountId,
}: { releaseId: string; version?: string | null; creatorAccountId: string }) {
  const axios = useAxios()
  const qc = useQueryClient()
  const accountId = useGlobalStore((s) => s.session?.account_id)
  const isAuthor = accountId === creatorAccountId
  const {
    data: files,
    isLoading: filesLoading,
    isError: filesError,
    refetch: refetchFiles,
  } = usePackageFiles(releaseId)
  const [selectedPath, setSelectedPath] = useState("")
  const [requestErrors, setRequestErrors] = useState<
    Partial<Record<Angle, string>>
  >({})
  const key = ["package-render-images", accountId, releaseId]
  const queries = useQueries(
    angles.map((angle) => ({
      queryKey: [...key, angle],
      queryFn: async (): Promise<Render | null> => {
        try {
          const { data } = await axios.get(
            "/package_releases/get_render_image",
            { params: { package_release_id: releaseId, angle } },
          )
          return data.render_image
        } catch (error: any) {
          if (
            (error.status ?? error.response?.status) === 404 &&
            error.data?.error?.error_code === "render_image_not_found"
          )
            return null
          throw error
        }
      },
      retry: false,
      refetchInterval: (data: Render | null | undefined, query: any) =>
        query.state.error ||
        !data ||
        ["succeeded", "failed"].includes(data.status)
          ? false
          : 5000,
    })),
  )
  const records = queries.map((q) => q.data as Render | null | undefined)
  const existingPath = records.find(Boolean)?.circuit_json_file_path
  const paths = (files ?? [])
    .map((f) => f.file_path.replace(/^(\.\/|\/)+/, ""))
    .filter((p) => p.startsWith("dist/") && p.endsWith("/circuit.json"))
    .sort()
  const circuitPath =
    existingPath ||
    (paths.includes(selectedPath)
      ? selectedPath
      : paths.find((p) => p === "dist/circuit.json") ||
        paths.find((p) => p === "dist/index/circuit.json") ||
        paths[0])
  const allRequested = records.every(Boolean)
  const loading = queries.some((q) => q.isLoading)
  const statusError = queries.some((q) => q.isError)
  const generate = useMutation(async () => {
    setRequestErrors({})
    // Always request all three. The API returns existing records without regenerating them.
    const results = await Promise.allSettled(
      angles.map(async (angle) => {
        const { data } = await axios.post(
          "/package_releases/create_render_image",
          {
            package_release_id: releaseId,
            angle,
            circuit_json_file_path: circuitPath,
          },
        )
        qc.setQueryData([...key, angle], data.render_image)
      }),
    )
    const errors: Partial<Record<Angle, string>> = {}
    results.forEach((result, i) => {
      if (result.status === "rejected")
        errors[angles[i]] = errorMessage(result.reason)
    })
    setRequestErrors(errors)
    await qc.invalidateQueries(key)
  })
  return (
    <section
      className="border rounded-lg"
      aria-labelledby="render-images-heading"
    >
      <div className="p-4 sm:p-6 border-b">
        <h2 id="render-images-heading" className="text-base font-semibold">
          Render images
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Generate photorealistic angled, top and bottom views for this release
          {version ? ` (${version})` : ""}. Each view shows its progress below.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Rendering can take several minutes. You can leave this page and return
          to check progress.
        </p>
      </div>
      <div className="p-4 sm:p-6 space-y-4">
        {import.meta.env.VITE_USE_FAKE_API === "true" && (
          <p className="rounded bg-blue-50 p-3 text-sm text-blue-800">
            Fake server: simulated progress and sample images. No Blender or AI
            requests are made.{" "}
            <a className="underline" href="/api/_fake/render_demo">
              Restart demo
            </a>
          </p>
        )}
        {filesError && (
          <p role="alert" className="text-sm text-red-600">
            Could not load the release files.{" "}
            <button className="underline" onClick={() => refetchFiles()}>
              Retry files
            </button>
          </p>
        )}
        {!filesLoading && !filesError && !circuitPath && (
          <p className="text-sm text-gray-600">
            Build this release before generating render images. A built circuit
            JSON file is required.
          </p>
        )}
        {paths.length > 1 && (
          <label className="block text-sm">
            Board to render
            <select
              className="mt-1 block w-full rounded border bg-white p-2 text-sm"
              value={circuitPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              disabled={!!existingPath || generate.isLoading}
            >
              {paths.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        )}
        {!isAuthor && (
          <p className="text-sm text-gray-600">
            Only the package author can generate render images. You can view
            existing renders here.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => generate.mutate()}
            disabled={
              !isAuthor ||
              !circuitPath ||
              filesLoading ||
              filesError ||
              loading ||
              statusError ||
              generate.isLoading ||
              allRequested
            }
          >
            {generate.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            {generate.isLoading
              ? "Requesting all views…"
              : allRequested
                ? "All views requested"
                : "Generate all three views"}
          </Button>
          <Button
            variant="outline"
            onClick={() => qc.invalidateQueries(key)}
            disabled={queries.some((q) => q.isFetching)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh status
          </Button>
        </div>
        {statusError && (
          <p role="alert" className="text-sm text-red-600">
            Could not check all render statuses. Refresh status to try again.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {angles.map((angle, index) => {
            const row = records[index]
            const query = queries[index]
            const processing =
              row && ["queued", "submitting", "running"].includes(row.status)
            return (
              <article
                key={angle}
                className="overflow-hidden rounded-lg border"
                aria-label={`${labels[angle]} view`}
              >
                <div className="flex items-center justify-between border-b p-3">
                  <h3 className="text-sm font-medium">{labels[angle]}</h3>
                  <span role="status" className="text-xs text-gray-600">
                    {query.isLoading
                      ? "Checking…"
                      : query.isError
                        ? "Status unavailable"
                        : row
                          ? statuses[row.status]
                          : "Not requested"}
                  </span>
                </div>
                {row?.status === "succeeded" ? (
                  <RenderPreview releaseId={releaseId} angle={angle} />
                ) : (
                  <div className="flex aspect-[6/5] items-center justify-center bg-gray-50 p-4 text-center text-sm text-gray-500">
                    {processing ? (
                      <span>
                        <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
                        {statuses[row.status]}…
                      </span>
                    ) : row?.status === "failed" ? (
                      <p role="alert">
                        {row.error || "This render could not be completed."}
                      </p>
                    ) : (
                      "Your rendered image will appear here."
                    )}
                  </div>
                )}
                {requestErrors[angle] && (
                  <p className="border-t p-3 text-xs text-red-600" role="alert">
                    Request failed: {requestErrors[angle]}
                  </p>
                )}
              </article>
            )
          })}
        </div>
        {records.some((r) => r?.status === "failed") && (
          <p className="text-xs text-gray-500">
            Failed renders cannot be restarted for this release. Existing images
            are kept; use a new release to generate new renders.
          </p>
        )}
      </div>
    </section>
  )
}
