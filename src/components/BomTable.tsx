import { SupplierName } from "@tscircuit/props"
import { AnyCircuitElement } from "circuit-json"
import { Link } from "wouter"

interface BomTableProps {
  circuitJson: AnyCircuitElement[]
}

export const linkify = (supplier: string, partNumber: string) => {
  if (supplier === "jlcpcb") {
    return (
      <a
        className="underline text-blue-500"
        target="_blank"
        href={`https://jlcpcb.com/partdetail/${partNumber}`}
      >
        {partNumber}
      </a>
    )
  }
  return partNumber
}

export const BomTable: React.FC<BomTableProps> = ({ circuitJson }) => {
  const sourceComponents = circuitJson.filter(
    (el) => el.type === "source_component",
  )

  const supplierColumns = new Set<SupplierName>()
  const partNumbersGrouped: Record<
    string,
    { names: string[]; quantity: number; suppliers: Set<SupplierName> }
  > = {}

  sourceComponents.forEach((comp) => {
    if (comp.supplier_part_numbers) {
      Object.keys(comp.supplier_part_numbers).forEach((supplier) => {
        const partNumber =
          comp.supplier_part_numbers![supplier as SupplierName]?.[0] || ""

        if (partNumbersGrouped[partNumber]) {
          partNumbersGrouped[partNumber].names.push(comp.name)
          partNumbersGrouped[partNumber].quantity++
          partNumbersGrouped[partNumber].suppliers.add(supplier as SupplierName)
        } else {
          partNumbersGrouped[partNumber] = {
            names: [comp.name],
            quantity: 1,
            suppliers: new Set([supplier as SupplierName]),
          }
        }

        supplierColumns.add(supplier as SupplierName)
      })
    }
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Name</th>
            {Array.from(supplierColumns).map((supplier) => (
              <>
                <th key={`${supplier}-part`} className="p-2 capitalize">
                  {supplier}
                </th>
                <th key={`${supplier}-quantity`} className="p-2 capitalize">
                  Quantity
                </th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(partNumbersGrouped).map((partNumber) => {
            const partGroup = partNumbersGrouped[partNumber]

            return (
              <tr key={partNumber} className="border-b">
                <td
                  className="p-2"
                  style={{ wordWrap: "break-word", maxWidth: "200px" }}
                >
                  {partGroup.names.join(", ")}
                </td>

                {Array.from(supplierColumns).map((supplier) => {
                  const partNumberForSupplier = partGroup.suppliers.has(
                    supplier,
                  )
                    ? partNumber
                    : ""
                  return (
                    <>
                      <td key={`${supplier}-part`} className="p-2">
                        {linkify(supplier, partNumberForSupplier)}
                      </td>
                      <td key={`${supplier}-quantity`} className="p-2">
                        {partGroup.suppliers.has(supplier)
                          ? partGroup.quantity
                          : 0}
                      </td>
                    </>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
