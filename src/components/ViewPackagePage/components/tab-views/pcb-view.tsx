import { usePackageFile, usePackageFileByPath } from "@/hooks/use-package-files"
import { PcbViewerWithContainerHeight } from "@/components/PcbViewerWithContainerHeight"
import { useEffect, useState } from "react"

interface PCBViewProps {
  packageName?: string | null
}

export default function PCBView({ packageName }: PCBViewProps) {
  const [circuitJson, setCircuitJson] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Try to load circuit.json from the standard location
  const { data: circuitJsonFile, isError } = usePackageFile(
    packageName
      ? {
          package_name: packageName,
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

  if (isLoading) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <p className="text-gray-500 dark:text-[#8b949e]">Loading PCB view...</p>
      </div>
    )
  }

  if (error || !circuitJson) {
    return (
      <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-8 mb-4 bg-white dark:bg-[#0d1117] flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">
          {error || "Circuit JSON not available"}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-[#30363d] rounded-md p-4 mb-4 bg-white dark:bg-[#0d1117]">
      <PcbViewerWithContainerHeight
        clickToInteractEnabled
        circuitJson={circuitJson}
        containerClassName="w-full h-[620px]"
      />
    </div>
  )
}
