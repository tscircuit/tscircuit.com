import type {
  PreviewParameterManifest,
  PreviewParameterValues,
} from "@/lib/package-preview-parameters"
import { useId } from "react"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"

export function PackageParameterPanel({
  manifest,
  values,
  disabled = false,
  onChange,
}: {
  manifest: PreviewParameterManifest
  values: PreviewParameterValues
  disabled?: boolean
  onChange: (values: PreviewParameterValues) => void
}) {
  const panelId = useId()
  return (
    <aside
      className="h-[620px] min-w-0 overflow-y-auto rounded-lg border bg-white p-4"
      aria-label="Circuit parameters"
      aria-busy={disabled}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="font-semibold">Parameters</h4>
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => onChange(manifest.defaults)}
        >
          Reset to defaults
        </Button>
      </div>
      <div className={!disabled ? "space-y-5" : "space-y-5 opacity-50"}>
        {manifest.parameters.map((parameter) => {
          const id = `${panelId}-${parameter.id}`
          const value = values[parameter.id]
          return (
            <div key={parameter.id} className="rounded-md p-2">
              <div className="mb-1 flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium">
                  {parameter.label}
                </label>
                {parameter.type === "boolean" && (
                  <Switch
                    id={id}
                    checked={Boolean(value)}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      onChange({ ...values, [parameter.id]: checked })
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
                    disabled={disabled}
                    className="block w-full accent-blue-600 disabled:accent-gray-400"
                    onChange={(event) =>
                      onChange({
                        ...values,
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
                  disabled={disabled}
                  className="w-full rounded border px-2 py-1 text-sm"
                  onChange={(event) => {
                    const option = parameter.options.find(
                      (o) => JSON.stringify(o.value) === event.target.value,
                    )
                    if (option)
                      onChange({
                        ...values,
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
    </aside>
  )
}
