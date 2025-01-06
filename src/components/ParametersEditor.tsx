import { Input } from "./ui/input"

interface ParametersEditorProps {
  params: Record<string, any>
  updateParam: (
    key: string,
    value: string | number | boolean | string[],
  ) => void
  paramNames: Record<string, string>
}

const ParametersEditor = ({
  params,
  updateParam,
  paramNames,
}: ParametersEditorProps) => {
  const renderStringInput = (key: string, value: string) => {
    if (key === "grid") {
      let rows = "",
        cols = ""
      if (typeof value === "string") {
        ;[rows = "", cols = ""] = value.split("x").map(String)
      } else if (typeof value === "number") {
        rows = cols = String(value)
      } else if (value && typeof value === "object") {
        const grid = value as { x: number; y: number }
        rows = String(grid.x || "")
        cols = String(grid.y || "")
      }
      return (
        <div className="flex gap-2 flex-1">
          <Input
            type="number"
            value={rows || ""}
            onChange={(e) => {
              const newRows = e.target.value || "0"
              const newCols = cols || "0"
              updateParam(key, `${newRows}x${newCols}`)
            }}
            placeholder="Rows"
            className="flex-1"
          />
          <span className="flex items-center">×</span>
          <Input
            type="number"
            value={cols || ""}
            onChange={(e) => {
              const newRows = rows || "0"
              const newCols = e.target.value || "0"
              updateParam(key, `${newRows}x${newCols}`)
            }}
            placeholder="Cols"
            className="flex-1"
          />
        </div>
      )
    }

    if (key === "missing") {
      const missingArray = Array.isArray(value) ? value : []
      return (
        <div className="flex flex-wrap gap-2 items-center">
          {missingArray.map((item, index) => (
            <Input
              key={index}
              type="number"
              value={item}
              onChange={(e) => {
                if (!e.target.value) {
                  const newArray = missingArray.filter((_, i) => i !== index)
                  updateParam(key, newArray)
                  return
                }
                const newArray = [...missingArray]
                newArray[index] = e.target.value
                updateParam(key, newArray)
              }}
              className="w-16 h-8 text-center p-1"
            />
          ))}
          <button
            onClick={() => {
              updateParam(key, [...missingArray, "0"])
            }}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
          >
            +
          </button>
        </div>
      )
    }

    return (
      <Input
        type="text"
        value={value}
        onChange={(e) => updateParam(key, e.target.value)}
        className="flex-1"
      />
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Parameters</label>
      {Object.entries(params)
        .filter(
          ([key]) => key !== "fn" && (key !== "num_pins" || !key.match(/\d/)),
        )
        .map(([key, value]) => {
          return (
            <div key={key} className="flex gap-2 items-center">
              <label className="text-sm">
                {paramNames[key] ? `${paramNames[key]} (${key})` : key}:
              </label>
              {typeof value === "boolean" ? (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateParam(key, e.target.checked)}
                  className="h-4 w-4"
                />
              ) : typeof value === "number" ? (
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => updateParam(key, e.target.value)}
                  className="flex-1"
                />
              ) : (
                renderStringInput(key, value)
              )}
            </div>
          )
        })}
    </div>
  )
}

export default ParametersEditor
