import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { Link, useParams } from "wouter"

export interface BuildStep {
  id: string
  name: string
  status: "pending" | "running" | "success" | "error"
}

export interface BuildStatusProps {
  step: BuildStep
  packageReleaseId: string
}

export const BuildStatus = ({ step, packageReleaseId }: BuildStatusProps) => {
  const { author, packageName } = useParams()
  const href = `/${author}/${packageName}/builds?package_release_id=${packageReleaseId}`

  return (
    <Link href={href} className="flex items-center gap-2">
      {step.status === "success" && (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-[#8b949e]" />
      )}
      {step.status === "error" && (
        <XCircle className="h-4 w-4 text-red-600 dark:text-[#8b949e]" />
      )}
      {step.status === "running" && (
        <Loader2 className="h-4 w-4 text-blue-600 animate-spin dark:text-[#8b949e]" />
      )}
      {step.status === "pending" && (
        <Clock className="h-4 w-4 text-yellow-600 dark:text-[#8b949e]" />
      )}
      <span className="text-sm text-gray-500 dark:text-[#8b949e]">
        {step.name}
      </span>
    </Link>
  )
}
