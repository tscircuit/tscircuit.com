import { useCurrentSnippetId } from "@/hooks/use-current-snippet-id"
import { usePackageFile } from "@/hooks/use-package-files"
import { useEffect, useState } from "react"

export function useCurrentPackageCircuitJson() {
  const { packageId } = useCurrentSnippetId()

  const [circuitJson, setCircuitJson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Try to load circuit.json from the standard location
  const { data: circuitJsonFile, isError } = usePackageFile(
    packageId
      ? {
          package_id: packageId,
          file_path: "dist/circuit.json",
        }
      : null,
  )

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    if (circuitJsonFile) {
      try {
        const parsedCircuitJson = JSON.parse(circuitJsonFile.content_text!)
        setCircuitJson(parsedCircuitJson)
        setIsLoading(false)
      } catch (e) {
        setError("Invalid circuit.json format")
        setIsLoading(false)
      }
    } else if (isError) {
      setError("Circuit JSON not found in package")
      setIsLoading(false)
    }
  }, [circuitJsonFile, isError])

  return { circuitJson, isLoading, error }
}
