import { useCurrentPackageId } from "@/hooks/use-current-package-id"
import { usePackageFile } from "@/hooks/use-package-files"
import { useEffect, useState } from "react"

export function useCurrentPackageCircuitJson() {
  const { packageId } = useCurrentPackageId()

  const [circuitJson, setCircuitJson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Try to load circuit.json from the new location (dist/index/circuit.json)
  const { data: circuitJsonFileNew, isError: isErrorNew } = usePackageFile(
    packageId
      ? {
          package_id: packageId,
          file_path: "dist/index/circuit.json",
        }
      : null,
    {
      cacheTime: 60_000 * 2,
      staleTime: 60_000 * 2,
    },
  )

  // Fallback to load circuit.json from the old location (dist/circuit.json)
  const { data: circuitJsonFileOld, isError: isErrorOld } = usePackageFile(
    packageId && isErrorNew
      ? {
          package_id: packageId,
          file_path: "dist/circuit.json",
        }
      : null,
    {
      cacheTime: 60_000 * 2,
      staleTime: 60_000 * 2,
    },
  )

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    // Use the new location if available, otherwise use the old location
    const circuitJsonFile = circuitJsonFileNew || circuitJsonFileOld

    if (circuitJsonFile) {
      try {
        const parsedCircuitJson = JSON.parse(circuitJsonFile.content_text!)
        setCircuitJson(parsedCircuitJson)
        setIsLoading(false)
      } catch (e) {
        setError("Invalid circuit.json format")
        setIsLoading(false)
      }
    } else if (isErrorNew && isErrorOld) {
      setError("Circuit JSON not found in package")
      setIsLoading(false)
    }
  }, [circuitJsonFileNew, circuitJsonFileOld, isErrorNew, isErrorOld])

  return { circuitJson, isLoading, error }
}
