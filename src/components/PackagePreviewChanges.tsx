import {
  type PackageCircuitChanges,
  emptyCircuitChanges,
  getPackageCircuitChanges,
} from "@/lib/package-circuit-changes"
import type { AnyCircuitElement } from "circuit-json"
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

const Context = createContext<PackageCircuitChanges | null>(null)

export function PackagePreviewChangesProvider({
  circuitJson,
  selectionKey,
  children,
}: {
  circuitJson: AnyCircuitElement[] | null
  selectionKey: string
  children: ReactNode
}) {
  const previous = useRef<{
    circuitJson: AnyCircuitElement[]
    selectionKey: string
  }>()
  const [changes, setChanges] = useState(emptyCircuitChanges)
  useLayoutEffect(() => {
    if (!circuitJson) return
    const previousSelection = previous.current
    previous.current = { circuitJson, selectionKey }
    if (!previousSelection || previousSelection.selectionKey === selectionKey)
      return
    setChanges(
      getPackageCircuitChanges({
        previousCircuit: previousSelection.circuitJson,
        currentCircuit: circuitJson,
      }),
    )
  }, [circuitJson, selectionKey])
  useEffect(() => {
    if (changes === emptyCircuitChanges) return
    const timeout = window.setTimeout(
      () => setChanges(emptyCircuitChanges),
      3000,
    )
    return () => window.clearTimeout(timeout)
  }, [changes])
  return <Context.Provider value={changes}>{children}</Context.Provider>
}

export const usePackagePreviewChanges = () => useContext(Context)
