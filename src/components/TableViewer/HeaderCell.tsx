// HeaderCell.tsx
import type React from "react"

interface HeaderCellProps {
  column: { name: string }
  field?: () => React.ReactNode
  onTextChange?: (value: string) => void
}

export const HeaderCell: React.FC<HeaderCellProps> = (p) => {
  return (
    <div className="leading-5">
      <div className="py-2 font-bold">{p.column.name}</div>
      <div>
        {p.field?.() ?? (
          <input
            type="text"
            className="border rounded p-1 w-full"
            onChange={(e) => {
              p.onTextChange?.(e.target.value)
            }}
          />
        )}
      </div>
    </div>
  )
}
