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
  const [inputReset, setInputReset] = useState(0)
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
          onClick={() => {
            setInputReset((n) => n + 1)
            select(manifest.defaults)
          }}
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
              </div>
              <p
                id={`${id}-description`}
                className="mb-2 text-xs leading-relaxed text-gray-500"
              >
                {parameter.description}
              </p>
              {parameter.type === "number" && (
                <>
                  <div className="mb-2 flex items-center gap-2">
                    <NumericParameter
                      key={`${String(value)}:${inputReset}`}
                      label={parameter.label}
                      value={
                        parameter.options.find((o) => o.value === value)!.number
                      }
                      options={parameter.options}
                      disabled={!prepared.data}
                      unit={parameter.unit}
                      onValue={(v) =>
                        select({ ...current.values, [parameter.id]: v })
                      }
                    />
                    <span className="text-xs text-gray-600">
                      {parameter.unit}
                    </span>
                  </div>
                  <input
                    id={id}
                    type="range"
                    aria-label={`${parameter.label} slider`}
                    aria-describedby={`${id}-description`}
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
function NumericParameter({
  label,
  value,
  options,
  disabled,
  unit,
  onValue,
}: {
  label: string
  value: number
  options: { value: string | number | boolean; number: number }[]
  disabled: boolean
  unit: string
  onValue: (value: string | number | boolean) => void
}) {
  const [text, setText] = useState(String(value))
  const [invalid, setInvalid] = useState(false)
  const commit = () => {
    const option = options.find(
      (o) => o.number === Number(text) && text.trim() !== "",
    )
    if (option) {
      setInvalid(false)
      onValue(option.value)
    } else setInvalid(true)
  }
  return (
    <div className="min-w-0 flex-1">
      <input
        aria-label={`${label} value`}
        type="number"
        step="any"
        value={text}
        disabled={disabled}
        aria-invalid={invalid}
        className="w-full rounded border bg-gray-50 px-2 py-1 text-sm"
        onChange={(e) => {
          setText(e.target.value)
          setInvalid(false)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
        }}
      />
      {invalid && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          Choose {options.map((o) => o.number).join(", ")} {unit}.
        </p>
      )}
    </div>
  )
}
