// CircuitJsonTableViewer.tsx
import type React from "react"
import { useReducer, useState } from "react"
import { ClickableText } from "./ClickableText"
import { HeaderCell } from "./HeaderCell"
import Modal from "./Modal"

type Filters = {
  component_type_filter?:
    | "any"
    | "source"
    | "source/pcb"
    | "source/schematic"
    | string
  id_search?: string
  name_search?: string
  selector_search?: string
  focused_id?: string
}

type CommonProps = { name?: string; type: string }

type ModalState =
  | { open: false; element?: never }
  | { open: true; element: Element; title: string }

interface Element {
  [key: string]: any
  type: string
  name?: string
}

interface ProcessedElement extends CommonProps {
  primary_id: string
  other_ids: { [key: string]: string }
  selector_path?: string
  _og_elm: Element
}

interface Column {
  key: string
  name: string
  renderCell?: (row: ProcessedElement) => React.ReactNode
  renderHeaderCell?: (col: Column) => React.ReactNode
}

export const CircuitJsonTableViewer: React.FC<{ elements: Element[] }> = ({
  elements,
}) => {
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [filters, setFilter] = useReducer(
    (s: Filters, a: Filters) => ({
      ...s,
      ...a,
    }),
    {},
  )

  const element_types = [...new Set(elements.map((e) => e.type))]

  // Process elements to separate primary and non-primary ids
  const elements2: ProcessedElement[] = elements.map((e) => {
    const primary_id = e[`${e.type}_id`]

    const other_ids = Object.fromEntries(
      Object.entries(e).filter(([k]) => {
        if (k === `${e.type}_id`) return false
        if (!k.endsWith("_id")) return false
        return true
      }),
    ) as { [key: string]: string }

    const other_props: CommonProps = Object.fromEntries(
      Object.entries(e).filter(([k]) => !k.endsWith("_id")),
    ) as CommonProps

    return {
      primary_id,
      other_ids,
      ...other_props,
      _og_elm: e,
    }
  })

  const elements3 = elements2.map((e) => {
    let selector_path = ""

    const getSelectorPath = (e2: ProcessedElement): string => {
      const parent_key = Object.keys(e2.other_ids).find((k) =>
        k.startsWith("source_"),
      )
      if (!parent_key) return `.${e2.name}`
      const parent_type = parent_key.slice(0, -3) // trim "_id"

      const parent = elements2.find(
        (p) =>
          p.type === parent_type && p.primary_id === e2.other_ids[parent_key],
      )

      if (!parent) return `??? > .${e2.name}`

      if (!("name" in parent)) return `#${parent.primary_id} > .${e2.name}`

      return `${getSelectorPath(parent)} > .${e2.name}`
    }

    if ("name" in e) {
      selector_path = getSelectorPath(e)
    }

    return {
      ...e,
      selector_path,
    }
  })

  const columns: Column[] = [
    {
      key: "primary_id",
      name: "primary_id",
      renderCell: (row: ProcessedElement) => (
        <div className="flex items-center">
          <ClickableText
            text={row.primary_id}
            onClick={() =>
              setFilter({
                focused_id: row.primary_id,
                id_search: undefined,
                selector_search: undefined,
              })
            }
          />
          <span className="flex-grow" />
          <ClickableText
            text="(JSON)"
            onClick={() =>
              setModal({
                open: true,
                element: row._og_elm,
                title: row.primary_id,
              })
            }
          />
        </div>
      ),
      renderHeaderCell: (col: Column) => (
        <HeaderCell
          column={col}
          onTextChange={(v) => setFilter({ id_search: v })}
          field={
            !filters.focused_id
              ? undefined
              : () => (
                  <div>
                    Focus:{" "}
                    <span className="underline">{filters.focused_id}</span>
                    <ClickableText
                      text="(unfocus)"
                      onClick={() => setFilter({ focused_id: undefined })}
                    />
                  </div>
                )
          }
        />
      ),
    },
    {
      key: "type",
      name: "type",
      renderHeaderCell: (col: Column) => (
        <HeaderCell
          column={col}
          field={() => (
            <select
              onChange={(e) =>
                setFilter({ component_type_filter: e.target.value })
              }
              className="border rounded p-1 w-full"
            >
              <option key="any" value="any">
                any
              </option>
              <option key="source" value="source">
                source
              </option>
              <option key="source/pcb" value="source/pcb">
                source/pcb
              </option>
              <option key="source/schematic" value="source/schematic">
                source/schematic
              </option>
              {element_types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}
        />
      ),
    },
    {
      key: "name",
      name: "name",
      renderHeaderCell: (col: Column) => (
        <HeaderCell
          column={col}
          onTextChange={(t) => setFilter({ name_search: t })}
        />
      ),
    },
    {
      key: "selector_path",
      name: "selector_path",
      renderHeaderCell: (col: Column) => (
        <HeaderCell
          column={col}
          onTextChange={(t) => setFilter({ selector_search: t })}
        />
      ),
    },
    {
      key: "other_ids",
      name: "other_ids",
      renderCell: (row: ProcessedElement) => (
        <div className="space-x-2">
          {Object.entries(row.other_ids).map(([other_id, v]) => (
            <ClickableText
              key={v}
              text={v}
              onClick={() => setFilter({ focused_id: v })}
            />
          ))}
        </div>
      ),
    },
  ]

  const elements4 = elements3
    .filter((e) => {
      if (!filters.name_search) return true
      return e.name?.toLowerCase()?.includes(filters.name_search.toLowerCase())
    })
    .filter((e) => {
      if (!filters.component_type_filter) return true
      if (filters.component_type_filter === "any") return true
      if (filters.component_type_filter === "source") {
        return e.type.startsWith("source_")
      }
      if (filters.component_type_filter === "source/pcb") {
        return e.type.startsWith("source_") || e.type.startsWith("pcb_")
      }
      if (filters.component_type_filter === "source/schematic") {
        return e.type.startsWith("source_") || e.type.startsWith("schematic_")
      }
      return e.type?.includes(filters.component_type_filter)
    })
    .filter((e) => {
      if (!filters.selector_search) return true
      const parts = filters.selector_search
        .split(" ")
        .filter((p) => p.length > 0)
      return parts.every((part) => e.selector_path?.includes(part))
    })
    .filter((e) => {
      if (!filters.id_search) return true
      return e.primary_id?.includes(filters.id_search)
    })
    .filter((e) => {
      if (!filters.focused_id) return true
      if (e.primary_id === filters.focused_id) return true
      if (Object.values(e.other_ids).includes(filters.focused_id)) return true
      return false
    })

  return (
    <div className="font-mono text-xs">
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 border-b">
                  {col.renderHeaderCell ? col.renderHeaderCell(col) : col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements4.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-100">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 border-b">
                    {col.renderCell
                      ? col.renderCell(row)
                      : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.open ? modal.title : ""}
      >
        <div className="bg-gray-800 p-3 text-white rounded">
          <pre className="whitespace-pre-wrap">
            {modal.open ? JSON.stringify(modal.element, null, 2) : ""}
          </pre>
        </div>
      </Modal>
    </div>
  )
}
