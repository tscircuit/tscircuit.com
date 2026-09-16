import importer from "@tscircuit/internal-dynamic-import"
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useCurrentPackageCircuitJson } from "../../hooks/use-current-package-circuit-json"

interface BomRow {
  designator?: string
  comment?: string
  value?: string
  footprint?: string
  supplier_part_number_columns?: Record<string, string | undefined>
  manufacturer_mpn_pairs?: Array<{ manufacturer?: string; mpn?: string }>
  extra_columns?: Record<string, string | undefined>
}

const PAGE_SIZE = 15

const getDesignators = (designator = "") =>
  designator
    .split(/[,\s]+/)
    .map((reference) => reference.trim())
    .filter(Boolean)

const getSupplierPart = (row: BomRow) =>
  row.supplier_part_number_columns?.["JLCPCB Part #"]

const getManufacturerPart = (row: BomRow) =>
  row.manufacturer_mpn_pairs
    ?.map(({ manufacturer, mpn }) =>
      [manufacturer, mpn].filter(Boolean).join(" · "),
    )
    .filter(Boolean)
    .join(", ")

function BomSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-[#30363d] dark:bg-[#0d1117]">
      <div className="flex flex-col-reverse gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-[#30363d]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-[#161b22]" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100 dark:bg-[#161b22]" />
        </div>
        <div className="h-9 w-full animate-pulse rounded-md bg-gray-100 sm:w-72 dark:bg-[#161b22]" />
      </div>
      <div className="grid grid-cols-4 gap-8 border-b border-gray-100 bg-gray-50/80 px-5 py-3 dark:border-[#21262d] dark:bg-[#161b22]">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-[#21262d]"
            key={item}
          />
        ))}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-[#21262d]">
        {[0, 1, 2, 3, 4].map((item) => (
          <div className="grid grid-cols-4 gap-8 px-5 py-3" key={item}>
            {[0, 1, 2, 3].map((cell) => (
              <div
                className="h-4 animate-pulse rounded bg-gray-100 dark:bg-[#161b22]"
                key={cell}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-[#30363d]">
        <div className="h-4 w-28 animate-pulse rounded bg-gray-100 dark:bg-[#161b22]" />
        <div className="h-8 w-32 animate-pulse rounded bg-gray-100 dark:bg-[#161b22]" />
      </div>
    </div>
  )
}

export default function BOMView() {
  const {
    circuitJson,
    isLoading: isCircuitJsonLoading,
    error: circuitError,
  } = useCurrentPackageCircuitJson()
  const [rows, setRows] = useState<BomRow[] | null>(null)
  const [bomError, setBomError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!circuitJson) return

    let cancelled = false

    const loadBom = async () => {
      try {
        setRows(null)
        setBomError(null)
        const { convertCircuitJsonToBomRows } = await importer(
          "circuit-json-to-bom-csv",
        )
        const bomRows = await convertCircuitJsonToBomRows({ circuitJson })
        if (!cancelled) setRows(bomRows as BomRow[])
      } catch (error) {
        if (!cancelled) {
          setBomError(
            error instanceof Error ? error.message : "Unable to generate BOM",
          )
        }
      }
    }

    void loadBom()

    return () => {
      cancelled = true
    }
  }, [circuitJson])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!rows || !normalizedQuery) return rows ?? []

    return rows.filter((row) =>
      [
        row.designator,
        row.comment,
        row.value,
        row.footprint,
        getSupplierPart(row),
        getManufacturerPart(row),
        ...Object.values(row.extra_columns ?? {}),
      ].some((value) => value?.toLowerCase().includes(normalizedQuery)),
    )
  }, [query, rows])

  const summary = useMemo(() => {
    if (!rows) return { placements: 0, sourced: 0 }
    return rows.reduce(
      (totals, row) => ({
        placements: totals.placements + getDesignators(row.designator).length,
        sourced: totals.sourced + (getSupplierPart(row) ? 1 : 0),
      }),
      { placements: 0, sourced: 0 },
    )
  }, [rows])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const firstRowIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedRows = filteredRows.slice(
    firstRowIndex,
    firstRowIndex + PAGE_SIZE,
  )

  const updateQuery = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  if (isCircuitJsonLoading || (circuitJson && !rows && !bomError)) {
    return <BomSkeleton />
  }

  const error = circuitError || bomError
  if (error || !circuitJson) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 px-6 text-center dark:border-red-900/60 dark:bg-red-950/20">
        <AlertCircle className="mb-3 h-7 w-7 text-red-500" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">
          BOM unavailable
        </h2>
        <p className="mt-1 max-w-md text-sm text-red-700 dark:text-red-300">
          {error || "Circuit JSON is not available for this package."}
        </p>
      </div>
    )
  }

  if (!rows?.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/60 px-6 text-center dark:border-[#30363d] dark:bg-[#161b22]/50">
        <PackageSearch
          className="mb-3 h-8 w-8 text-gray-400"
          aria-hidden="true"
        />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          No components in this BOM
        </h2>
        <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-[#8b949e]">
          Add components with footprints to the circuit to generate a bill of
          materials.
        </p>
      </div>
    )
  }

  return (
    <section
      className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-[#30363d] dark:bg-[#0d1117]"
      aria-label="Bill of materials"
    >
      <div className="flex flex-col-reverse gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-[#30363d]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-gray-500 dark:text-[#8b949e]">
            {summary.placements} placements
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-[#8b949e]">
            <CheckCircle2
              className="h-3.5 w-3.5 text-emerald-500"
              aria-hidden="true"
            />
            {summary.sourced} with supplier parts
          </span>
        </div>

        <div>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Search bill of materials</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="text"
              role="searchbox"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Search parts, values, footprints…"
              className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#30363d] dark:bg-[#161b22] dark:text-gray-100 dark:placeholder:text-[#6e7681] dark:focus:border-blue-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-[#21262d] dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-gray-50/80 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-[#161b22] dark:text-[#8b949e]">
            <tr>
              <th className="px-4 py-3 sm:px-5" scope="col">
                References
              </th>
              <th className="px-3 py-3" scope="col">
                Part / value
              </th>
              <th className="px-3 py-3" scope="col">
                Footprint
              </th>
              <th className="px-3 py-3 pr-5" scope="col">
                Sourcing
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#21262d]">
            {paginatedRows.map((row, rowIndex) => {
              const designators = getDesignators(row.designator)
              const supplierPart = getSupplierPart(row)
              const manufacturerPart = getManufacturerPart(row)
              const rowKey =
                row.designator || `${row.comment}-${firstRowIndex + rowIndex}`

              return (
                <tr
                  key={rowKey}
                  className="group align-top transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-950/10"
                >
                  <td className="max-w-52 px-4 py-2.5 sm:px-5">
                    <div className="flex flex-wrap gap-1">
                      {(designators.length ? designators : ["—"]).map(
                        (reference) => (
                          <span
                            key={reference}
                            className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[11px] font-medium text-gray-700 dark:border-[#30363d] dark:bg-[#0d1117] dark:text-gray-300"
                          >
                            {reference}
                          </span>
                        ),
                      )}
                    </div>
                  </td>
                  <td className="max-w-60 px-3 py-2.5">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {row.value || row.comment || "Unspecified part"}
                    </div>
                    {row.comment && row.comment !== row.value && (
                      <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-[#8b949e]">
                        {row.comment}
                      </div>
                    )}
                  </td>
                  <td className="max-w-48 px-3 py-2.5">
                    <span
                      className="block truncate font-mono text-xs text-gray-600 dark:text-[#8b949e]"
                      title={row.footprint}
                    >
                      {row.footprint || "—"}
                    </span>
                  </td>
                  <td className="max-w-64 px-3 py-2.5 pr-5">
                    {supplierPart ? (
                      <a
                        href={`https://jlcpcb.com/partdetail/${encodeURIComponent(supplierPart)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs font-semibold text-blue-600 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400"
                      >
                        {supplierPart}
                      </a>
                    ) : manufacturerPart ? (
                      <span className="text-xs text-gray-600 dark:text-[#8b949e]">
                        {manufacturerPart}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-[#6e7681]">
                        Not specified
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredRows.length === 0 && (
        <div className="border-t border-gray-100 px-5 py-14 text-center dark:border-[#21262d]">
          <PackageSearch
            className="mx-auto h-7 w-7 text-gray-400"
            aria-hidden="true"
          />
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No matching parts
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#8b949e]">
            Try a reference, value, footprint, or part number.
          </p>
        </div>
      )}

      {filteredRows.length > PAGE_SIZE && (
        <nav
          className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-[#30363d]"
          aria-label="BOM pagination"
        >
          <p className="text-sm text-gray-500 dark:text-[#8b949e]">
            Showing {firstRowIndex + 1}–
            {Math.min(firstRowIndex + PAGE_SIZE, filteredRows.length)} of{" "}
            {filteredRows.length} parts
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#30363d] dark:bg-[#161b22] dark:text-gray-200 dark:hover:bg-[#21262d]"
              aria-label="Previous BOM page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <span className="min-w-20 text-center text-sm tabular-nums text-gray-600 dark:text-[#8b949e]">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount, current + 1))
              }
              disabled={currentPage === pageCount}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#30363d] dark:bg-[#161b22] dark:text-gray-200 dark:hover:bg-[#21262d]"
              aria-label="Next BOM page"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </section>
  )
}
