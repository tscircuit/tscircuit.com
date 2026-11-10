import { usePreparedPackageParameters } from "@/hooks/use-package-preview-parameters"
import {
  type PreviewParameterManifest,
  findParameterVariant,
  findParameterVariantByPath,
} from "@/lib/package-preview-parameters"
import { useId, useState } from "react"
import { usePackagePreviewChanges } from "./PackagePreviewChanges"
import { usePackagePreviewScope } from "./PackagePreviewScope"
import { useCurrentPackageCircuitJson } from "./ViewPackagePage/hooks/use-current-package-circuit-json"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"

function formatPreviousValue(
  parameter: PreviewParameterManifest["parameters"][number],
  propValue: string | boolean | number,
) {
  if (parameter.type === "boolean") return propValue ? "On" : "Off"
  if (parameter.type === "number")
    return String(
      parameter.options.find((option) => option.value === propValue)?.number ??
        propValue,
    )
  return (
    parameter.options.find((option) => option.value === propValue)?.label ??
    String(propValue)
  )
}

export function PackageParameterPanel({
  manifest,
}: { manifest: PreviewParameterManifest }) {
  const changes = usePackagePreviewChanges()
  const panelId = useId()
  const { previewFilePath } = useCurrentPackageCircuitJson()
  const scope = usePackagePreviewScope()
  const prepared = usePreparedPackageParameters(manifest)
  const [error, setError] = useState<string>()
  const current = findParameterVariantByPath(manifest, previewFilePath)
  const select = (values: typeof current.values) => {
    const variant = findParameterVariant(manifest, values)
    if (!variant) {
      setError("This combination is not supported.")
      return
    }
    setError(undefined)
    if (variant.circuitJsonPath === previewFilePath) return
    prepared.prime(variant)
    if (scope) scope.selectFile(variant.circuitJsonPath)
    else {
      const url = new URL(window.location.href)
      url.searchParams.set("preview_file", variant.circuitJsonPath)
      window.history.pushState({}, "", url)
      window.dispatchEvent(new Event("popstate"))
    }
  }
  return (
    <aside
      className="min-w-0 rounded-lg border bg-white p-4"
      aria-label="Circuit parameters"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="font-semibold">Parameters</h4>
        <Button
          size="sm"
          variant="ghost"
          disabled={!prepared.data}
          onClick={() => select(manifest.defaults)}
        >
          Reset to defaults
        </Button>
      </div>
      {!prepared.data && !prepared.error && (
        <p role="status" className="mb-3 text-xs text-gray-500">
          Preparing parameter controls…
        </p>
      )}
      {Boolean(prepared.error) && (
        <div role="alert" className="mb-3 text-sm text-red-600">
          Unable to prepare parameters.{" "}
          <button className="underline" onClick={() => prepared.refetch()}>
            Retry
          </button>
        </div>
      )}
      <div className="space-y-5">
        {manifest.parameters.map((parameter) => {
          const id = `${panelId}-${parameter.id}`
          const value = current.values[parameter.id]
          return (
            <div
              key={parameter.id}
              data-parameter-changed={
                changes?.changedParameterIds.includes(parameter.id)
                  ? "true"
                  : undefined
              }
              className={`rounded-md p-2 ${changes?.changedParameterIds.includes(parameter.id) ? "bg-amber-50 ring-1 ring-amber-300" : ""}`}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium">
                  {parameter.label}
                </label>
                {changes?.changedParameterIds.includes(parameter.id) &&
                  changes.previousValues && (
                    <span
                      className="ml-auto shrink-0 text-xs text-amber-800"
                      aria-label={`${parameter.label} previous value`}
                    >
                      <s>
                        {formatPreviousValue(
                          parameter,
                          changes.previousValues[parameter.id],
                        )}
                      </s>
                      <span aria-hidden="true"> →</span>
                    </span>
                  )}
                {parameter.type === "boolean" && (
                  <Switch
                    id={id}
                    checked={Boolean(value)}
                    disabled={!prepared.data}
                    onCheckedChange={(checked) =>
                      select({ ...current.values, [parameter.id]: checked })
                    }
                  />
                )}
                {parameter.type === "number" && (
                  <output
                    htmlFor={id}
                    aria-label={`${parameter.label} value`}
                    className="shrink-0 text-sm tabular-nums text-gray-600"
                  >
                    {parameter.options.find((o) => o.value === value)!.number}{" "}
                    {parameter.unit}
                  </output>
                )}
              </div>
              {parameter.type === "number" && (
                <>
                  <input
                    id={id}
                    type="range"
                    aria-label={`${parameter.label} slider`}
                    aria-valuetext={`${parameter.options.find((o) => o.value === value)!.number} ${parameter.unit}`}
                    min={0}
                    max={parameter.options.length - 1}
                    step={1}
                    value={parameter.options.findIndex(
                      (o) => o.value === value,
                    )}
                    disabled={!prepared.data}
                    className="block w-full accent-blue-600"
                    onChange={(event) =>
                      select({
                        ...current.values,
                        [parameter.id]:
                          parameter.options[Number(event.target.value)].value,
                      })
                    }
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                    {parameter.options.map((o) => (
                      <span key={String(o.value)}>{o.number}</span>
                    ))}
                  </div>
                </>
              )}
              {parameter.type === "enum" && (
                <select
                  id={id}
                  aria-label={parameter.label}
                  value={JSON.stringify(value)}
                  disabled={!prepared.data}
                  className="w-full rounded border px-2 py-1 text-sm"
                  onChange={(event) => {
                    const option = parameter.options.find(
                      (o) => JSON.stringify(o.value) === event.target.value,
                    )
                    if (option)
                      select({
                        ...current.values,
                        [parameter.id]: option.value,
                      })
                  }}
                >
                  {parameter.options.map((option) => (
                    <option
                      key={JSON.stringify(option.value)}
                      value={JSON.stringify(option.value)}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </aside>
  )
}
