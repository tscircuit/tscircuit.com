import { CheckCircle, XCircle } from "lucide-react"
import { Link, useParams } from "wouter"

export interface BuildStep {
  id: string
  name: string
  status: "success" | "failed"
  message?: string
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
      {step.status === "success" ? (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-[#8b949e]" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600 dark:text-[#8b949e]" />
      )}
      <span className="text-sm text-gray-500 dark:text-[#8b949e]">
        {step.name}
      </span>
    </Link>
  )
}
