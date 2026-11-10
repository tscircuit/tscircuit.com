import { useState } from "react"
import { useCurrentPackageCircuitJson } from "./ViewPackagePage/hooks/use-current-package-circuit-json"
import { usePackagePreviewScope } from "./PackagePreviewScope"
import { usePreparedPackageParameters } from "@/hooks/use-package-preview-parameters"
import {
  findParameterVariant,
  findParameterVariantByPath,
  type PreviewParameterManifest,
} from "@/lib/package-preview-parameters"
import { Switch } from "./ui/switch"
import { Button } from "./ui/button"

export function PackageParameterPanel({
  manifest,
}: { manifest: PreviewParameterManifest }) {
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
          const id = `parameter-${parameter.id}`
          const value = current.values[parameter.id]
          return (
            <div key={parameter.id}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium">
                  {parameter.label}
                </label>
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
