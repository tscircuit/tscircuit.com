import { useState, useMemo, useCallback, memo } from "react"
import { useQuery } from "react-query"
import {
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  CircleCheck,
  FileCode,
  Loader2,
  ExternalLink,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { usePackageFiles } from "@/hooks/use-package-files"
import { useAxios } from "@/hooks/use-axios"
import { cn } from "@/lib/utils"
import { Link } from "wouter"

interface CircuitError {
  type: string
  error_type?: string
  message?: string
  component_name?: string
  [key: string]: unknown
}

interface CircuitFileErrors {
  filePath: string
  componentName: string
  sourceErrors: CircuitError[]
  autorouterErrors: CircuitError[]
  otherErrors: CircuitError[]
  totalErrors: number
}

const ERRORS_PER_PAGE = 20

const isSourceError = (e: CircuitError): boolean =>
  (e.error_type || e.type || "").startsWith("source_")

const isAutorouterError = (e: CircuitError): boolean => {
  const t = e.error_type || e.type || ""
  return (
    t.includes("autorouter") || t.includes("route") || t.includes("pcb_trace")
  )
}

const filePathToComponentName = (filePath: string): string => {
  if (filePath === "dist/circuit.json") return "index.tsx"
  return filePath
    .replace(/^dist\//, "")
    .replace(/\/circuit\.json$/, "")
    .concat(".tsx")
}

const formatErrorType = (errorType: string): string =>
  errorType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

const serializeError = (error: CircuitError): string => {
  const parts: string[] = []
  if (error.error_type) parts.push(`Type: ${error.error_type}`)
  if (error.component_name) parts.push(`Component: ${error.component_name}`)
  if (error.message) parts.push(`Message: ${error.message}`)
  return parts.join("\n")
}

const CopyButton = memo(({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    },
    [text],
  )

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600 shrink-0"
      title="Copy error details"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
})

const ErrorItem = memo(
  ({
    error,
    variant = "error",
  }: {
    error: CircuitError
    variant?: "error" | "warning"
  }) => {
    const isWarning = variant === "warning"
    const errorText = serializeError(error)
    const Icon = isWarning ? AlertTriangle : AlertCircle

    return (
      <div
        className={cn(
          "flex items-start gap-2 p-2.5 sm:p-3 rounded-md border text-sm",
          isWarning
            ? "bg-amber-50/50 border-amber-100"
            : "bg-red-50/50 border-red-100",
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 mt-0.5 shrink-0",
            isWarning ? "text-amber-500" : "text-red-500",
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-mono text-xs px-1.5 py-0.5 rounded",
                isWarning
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700",
              )}
            >
              {formatErrorType(error.error_type || error.type)}
            </span>
            {error.component_name && (
              <span className="font-mono text-xs text-gray-600">
                {error.component_name}
              </span>
            )}
          </div>
          {error.message && (
            <p className="mt-1.5 text-gray-700 text-xs font-mono break-words whitespace-pre-wrap leading-relaxed">
              {error.message}
            </p>
          )}
        </div>
        <CopyButton text={errorText} />
      </div>
    )
  },
)

const ErrorCategorySection = memo(
  ({
    title,
    errors,
    defaultOpen,
    variant = "error",
  }: {
    title: string
    errors: CircuitError[]
    defaultOpen: boolean
    variant?: "error" | "warning"
  }) => {
    const [open, setOpen] = useState(defaultOpen)
    const [visibleCount, setVisibleCount] = useState(ERRORS_PER_PAGE)

    if (errors.length === 0) return null

    const visibleErrors = errors.slice(0, visibleCount)
    const hasMore = visibleCount < errors.length

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors select-none">
            <ChevronRight
              className={cn(
                "w-3.5 h-3.5 text-gray-400 transition-transform",
                open && "rotate-90",
              )}
            />
            <span className="text-sm font-medium text-gray-700">{title}</span>
            <span
              className={cn(
                "text-xs font-mono px-1.5 py-0.5 rounded-full",
                variant === "warning"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700",
              )}
            >
              {errors.length}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-3 sm:pl-6 pr-1 sm:pr-2 pb-2 space-y-2">
            {visibleErrors.map((error, i) => (
              <ErrorItem
                key={`${error.error_type || error.type}-${error.component_name || ""}-${i}`}
                error={error}
                variant={variant}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => setVisibleCount((c) => c + ERRORS_PER_PAGE)}
                className="text-xs text-blue-600 hover:text-blue-800 py-1 px-2 hover:underline"
              >
                Show {Math.min(ERRORS_PER_PAGE, errors.length - visibleCount)}{" "}
                more…
              </button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
)

const CircuitFileSection = memo(
  ({
    fileErrors,
    packageId,
  }: {
    fileErrors: CircuitFileErrors
    packageId?: string | null
  }) => {
    const [open, setOpen] = useState(false)

    const editorHref = packageId
      ? `/editor?package_id=${packageId}&file_path=${encodeURIComponent(fileErrors.componentName)}`
      : null

    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <div className="group flex items-center justify-between gap-2 py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-md transition-colors select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform shrink-0",
                  open && "rotate-90",
                )}
              />
              <FileCode className="w-4 h-4 text-gray-500 shrink-0 hidden sm:block" />
              <span className="font-medium text-sm text-gray-900 truncate">
                {fileErrors.componentName}
              </span>
              {editorHref && (
                <Link
                  href={editorHref}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100 shrink-0"
                  title="Open in editor"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" />
                </Link>
              )}
            </div>
            {fileErrors.totalErrors > 0 ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                {fileErrors.totalErrors} error
                {fileErrors.totalErrors !== 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1 shrink-0">
                <CircleCheck className="w-3 h-3" />
                Clean
              </span>
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-2 sm:pl-4 pb-1">
            {fileErrors.totalErrors === 0 ? (
              <p className="text-sm text-gray-500 px-3 py-2">
                No errors found in this circuit.
              </p>
            ) : (
              <>
                <ErrorCategorySection
                  title="Source Errors"
                  errors={fileErrors.sourceErrors}
                  defaultOpen={false}
                />
                <ErrorCategorySection
                  title="Autorouter Errors"
                  errors={fileErrors.autorouterErrors}
                  defaultOpen={false}
                />
                {fileErrors.otherErrors.length > 0 && (
                  <ErrorCategorySection
                    title="Other Errors"
                    errors={fileErrors.otherErrors}
                    defaultOpen={false}
                  />
                )}
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
)

export const BuildCircuitErrors = ({
  packageReleaseId,
  packageId,
  isBuildActive,
}: {
  packageReleaseId: string | null
  packageId?: string | null
  isBuildActive: boolean
}) => {
  const [panelOpen, setPanelOpen] = useState(true)
  const axios = useAxios()

  const { data: files, isLoading: isLoadingFiles } =
    usePackageFiles(packageReleaseId)

  const circuitJsonPaths = useMemo(() => {
    if (!files) return []
    return files
      .filter(
        (f) =>
          f.file_path.startsWith("dist/") &&
          (f.file_path.endsWith("/circuit.json") ||
            f.file_path === "dist/circuit.json"),
      )
      .map((f) => f.file_path)
      .sort()
  }, [files])

  const { data: circuitErrors, isLoading: isLoadingErrors } = useQuery<
    CircuitFileErrors[]
  >(
    ["buildCircuitErrors", packageReleaseId, circuitJsonPaths],
    async () => {
      if (!circuitJsonPaths.length || !packageReleaseId) return []

      const results = await Promise.allSettled(
        circuitJsonPaths.map(async (filePath) => {
          const { data } = await axios.get("/package_files/get", {
            params: {
              package_release_id: packageReleaseId,
              file_path: filePath,
            },
          })

          const content = data.package_file?.content_text
          if (!content) return null

          const circuitJson = JSON.parse(content)
          if (!Array.isArray(circuitJson)) return null

          const errors = circuitJson.filter(
            (e: Record<string, unknown>) =>
              e &&
              typeof e === "object" &&
              ("error_type" in e ||
                (typeof e.type === "string" && e.type.includes("error"))),
          ) as CircuitError[]

          const sourceErrors = errors.filter(isSourceError)
          const autorouterErrors = errors.filter(isAutorouterError)
          const otherErrors = errors.filter(
            (e) => !isSourceError(e) && !isAutorouterError(e),
          )

          return {
            filePath,
            componentName: filePathToComponentName(filePath),
            sourceErrors,
            autorouterErrors,
            otherErrors,
            totalErrors: errors.length,
          } as CircuitFileErrors
        }),
      )

      return results
        .filter(
          (r): r is PromiseFulfilledResult<CircuitFileErrors | null> =>
            r.status === "fulfilled",
        )
        .map((r) => r.value)
        .filter(Boolean) as CircuitFileErrors[]
    },
    {
      enabled: circuitJsonPaths.length > 0 && !!packageReleaseId,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      refetchInterval: isBuildActive ? 5_000 : false,
    },
  )

  const isLoading = isLoadingFiles || isLoadingErrors

  const totalErrors = useMemo(
    () => circuitErrors?.reduce((sum, f) => sum + f.totalErrors, 0) ?? 0,
    [circuitErrors],
  )

  const hasErrors = totalErrors > 0
  const hasCircuitFiles = circuitJsonPaths.length > 0

  if (!hasCircuitFiles && !isLoading && !isBuildActive) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-6">
      <Collapsible
        open={panelOpen}
        onOpenChange={setPanelOpen}
        className="border border-gray-200 rounded-lg bg-white overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <div className="flex select-none items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors data-[state=open]:border-b data-[state=open]:border-gray-200">
            <div className="flex items-center gap-3">
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-gray-500 transition-all",
                  panelOpen && "rotate-90",
                )}
              />
              <span className="font-medium text-gray-900 select-none">
                Circuit Errors
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isLoading && hasErrors && (
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {totalErrors}
                </span>
              )}
              {!isLoading && !hasErrors && hasCircuitFiles && (
                <CircleCheck className="w-5 h-5 text-green-500" />
              )}
              {isLoading && (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-3 sm:p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 rounded-md animate-pulse"
                  />
                ))}
              </div>
            ) : isBuildActive && !hasCircuitFiles ? (
              <div className="flex items-center gap-2 justify-center py-4 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">
                  Circuit errors will appear once the build completes.
                </p>
              </div>
            ) : !hasCircuitFiles ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No circuit JSON files found in this build.
              </p>
            ) : !hasErrors ? (
              <div className="flex items-center gap-2 justify-center py-4">
                <p className="text-sm text-gray-600">
                  No errors found across all circuits.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {circuitErrors?.map((fileErrors) => (
                  <CircuitFileSection
                    key={fileErrors.filePath}
                    fileErrors={fileErrors}
                    packageId={packageId}
                  />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
