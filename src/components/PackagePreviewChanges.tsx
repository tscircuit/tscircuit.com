import {
  type PackageCircuitChanges,
  emptyCircuitChanges,
  getPackageCircuitChanges,
} from "@/lib/package-circuit-changes"
import type { PreviewParameterValues } from "@/lib/package-preview-parameters"
import type { AnyCircuitElement } from "circuit-json"
import {
  type ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

type PreviewChanges = {
  circuit: PackageCircuitChanges
  previousValues?: PreviewParameterValues
  changedParameterIds: string[]
}
const emptyChanges: PreviewChanges = {
  circuit: emptyCircuitChanges,
  changedParameterIds: [],
}
const Context = createContext<(PreviewChanges & { clear: () => void }) | null>(
  null,
)

export function PackagePreviewChangesProvider({
  circuitJson,
  selectionKey,
  parameterValues,
  children,
}: {
  circuitJson: AnyCircuitElement[] | null
  selectionKey: string
  parameterValues?: PreviewParameterValues
  children: ReactNode
}) {
  const previous = useRef<{
    circuitJson: AnyCircuitElement[]
    selectionKey: string
    parameterValues?: PreviewParameterValues
  }>()
  const [changes, setChanges] = useState<PreviewChanges>(emptyChanges)
  useLayoutEffect(() => {
    if (!circuitJson) return
    const previousSelection = previous.current
    previous.current = { circuitJson, selectionKey, parameterValues }
    if (!previousSelection || previousSelection.selectionKey === selectionKey)
      return
    setChanges({
      circuit: getPackageCircuitChanges({
        previousCircuit: previousSelection.circuitJson,
        currentCircuit: circuitJson,
      }),
      previousValues: previousSelection.parameterValues,
      changedParameterIds: Object.keys(parameterValues ?? {}).filter(
        (id) =>
          parameterValues?.[id] !== previousSelection.parameterValues?.[id],
      ),
    })
  }, [circuitJson, selectionKey, parameterValues])
  return (
    <Context.Provider
      value={{ ...changes, clear: () => setChanges(emptyChanges) }}
    >
      {children}
    </Context.Provider>
  )
}

export const usePackagePreviewChanges = () => useContext(Context)
