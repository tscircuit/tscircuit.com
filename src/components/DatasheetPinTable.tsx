import { Fragment, useId, useState } from "react"
import { ChevronDown, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  type DatasheetWithPinAttributes,
  formatAttributeName,
  formatAttributeValue,
  formatCapability,
  getElectricalSummary,
  getPinAttributes,
  getPinNames,
} from "@/lib/datasheet-pin-display"

const ElectricalSummary = ({ labels }: { labels: string[] }) =>
  labels.length ? (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <span
          key={label}
          className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-700"
        >
          {label}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-xs text-gray-400">Not specified</span>
  )

export const DatasheetPinTable = ({
  pins,
  pinAttributes,
}: {
  pins: NonNullable<DatasheetWithPinAttributes["pin_information"]>
  pinAttributes: DatasheetWithPinAttributes["pin_attributes"]
}) => {
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const id = useId()
  const query = search.trim().toLowerCase()
  const visiblePins = pins.filter((pin) => {
    const attributes = getPinAttributes(pin, pinAttributes)
    return [
      pin.pin_number,
      ...getPinNames(pin),
      pin.description,
      ...(pin.capabilities ?? []),
      ...(pin.capabilities ?? []).map(formatCapability),
      ...(attributes?.capabilities ?? []),
      ...(attributes?.capabilities ?? []).map(formatCapability),
      ...getElectricalSummary(attributes),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query)
  })

  const togglePin = (number: string) =>
    setExpanded((previous) => {
      const next = new Set(previous)
      if (next.has(number)) next.delete(number)
      else next.add(number)
      return next
    })

  return (
    <div>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            aria-label="Search pins"
            placeholder="Search pins, functions, or notes…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-gray-500" role="status">
          {visiblePins.length} of {pins.length} pins
        </p>
      </div>
      <p className="mb-4 text-sm text-gray-500">
        Functions are selectable alternatives. Expand a pin for electrical
        options, conditions, and full datasheet notes.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-sm sm:min-w-[620px] sm:table-auto">
          <caption className="sr-only">
            Pin functions and electrical requirements
          </caption>
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th
                scope="col"
                className="w-10 px-2 py-3 text-left font-medium sm:w-16 sm:px-3"
              >
                Pin
              </th>
              <th scope="col" className="px-3 py-3 text-left font-medium">
                Signal / functions
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3 text-left font-medium sm:table-cell"
              >
                Electrical
              </th>
              <th
                scope="col"
                className="w-20 px-2 py-3 text-right font-medium sm:w-24 sm:px-3"
              >
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {visiblePins.map((pin) => {
              const names = getPinNames(pin)
              const attributes = getPinAttributes(pin, pinAttributes)
              const summary = getElectricalSummary(attributes)
              const capabilities = [
                ...new Set([
                  ...(pin.capabilities ?? []),
                  ...(attributes?.capabilities ?? []),
                ]),
              ]
              const isExpanded = expanded.has(pin.pin_number)
              const detailsId = `${id}-pin-${pin.pin_number}`
              return (
                <Fragment key={pin.pin_number}>
                  <tr className="border-b align-top hover:bg-gray-50/60">
                    <th
                      scope="row"
                      className="px-2 py-3 text-left font-mono font-medium text-gray-500 sm:px-3"
                    >
                      {pin.pin_number}
                    </th>
                    <td className="max-w-sm break-words px-2 py-3 sm:px-3">
                      <div className="font-mono font-semibold text-gray-900">
                        {names[0] || "Unnamed"}
                      </div>
                      {names.length > 1 && (
                        <div className="mt-1 break-words font-mono text-xs leading-5 text-gray-500">
                          {(isExpanded
                            ? names.slice(1)
                            : names.slice(1, 4)
                          ).join(" · ")}
                          {!isExpanded && names.length > 4 && (
                            <button
                              type="button"
                              className="ml-2 whitespace-nowrap font-sans text-blue-600 hover:underline"
                              onClick={() => togglePin(pin.pin_number)}
                              aria-label={`Show all functions for pin ${pin.pin_number}`}
                              aria-expanded={false}
                              aria-controls={detailsId}
                            >
                              +{names.length - 4} more
                            </button>
                          )}
                        </div>
                      )}
                      {capabilities.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {capabilities.map((capability) => (
                            <span
                              key={capability}
                              className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
                            >
                              {formatCapability(capability)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 sm:hidden">
                        <ElectricalSummary labels={summary} />
                      </div>
                    </td>
                    <td className="hidden max-w-xs px-3 py-3 sm:table-cell">
                      <ElectricalSummary labels={summary} />
                    </td>
                    <td className="px-1 py-3 text-right sm:px-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                        onClick={() => togglePin(pin.pin_number)}
                        aria-label={`${isExpanded ? "Hide" : "Show"} details for pin ${pin.pin_number}`}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {isExpanded ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  <tr
                    id={detailsId}
                    hidden={!isExpanded}
                    className="border-b bg-gray-50/60"
                  >
                    <td colSpan={4} className="px-4 py-4 sm:px-6">
                      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-gray-900">
                            Pin {pin.pin_number} notes
                          </h4>
                          <p className="max-w-3xl whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                            {pin.description || "No pin notes available."}
                          </p>
                        </div>
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-gray-900">
                            Pin attributes
                          </h4>
                          {attributes && Object.keys(attributes).length ? (
                            <dl className="space-y-2 text-xs">
                              {Object.entries(attributes).map(
                                ([name, value]) => (
                                  <div
                                    key={name}
                                    className="flex justify-between gap-4"
                                  >
                                    <dt className="text-gray-500">
                                      {formatAttributeName(name)}
                                    </dt>
                                    <dd className="text-right text-gray-800">
                                      {formatAttributeValue(value)}
                                    </dd>
                                  </div>
                                ),
                              )}
                            </dl>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No structured pin attributes available.
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              )
            })}
            {visiblePins.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                  No pins match “{search}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
