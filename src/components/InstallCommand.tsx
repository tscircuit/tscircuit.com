import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function InstallCommand({
  packageName,
  version,
}: {
  packageName: string
  version?: string | null
}) {
  const [copied, setCopied] = useState(false)
  const installCmd = `tsci add ${packageName}${version ? `@${version}` : ""}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
        Install
      </p>
      <div className="flex items-center lg:w-fit bg-gray-100 rounded-md px-3 py-2">
        <code className="flex-1 text-xs font-mono text-gray-800 overflow-x-auto">
          {installCmd}
        </code>
        <button
          onClick={handleCopy}
          className="ml-2 p-1 hover:bg-gray-200 rounded flex-shrink-0 transition-colors"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-gray-500" />
          )}
        </button>
      </div>
    </>
  )
}
