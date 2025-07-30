import { Button } from "@/components/ui/button"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useRebuildPackageReleaseMutation } from "@/hooks/use-rebuild-package-release-mutation"
import { Github, RefreshCw } from "lucide-react"
import { useParams } from "wouter"
import { DownloadButtonAndMenu } from "../DownloadButtonAndMenu"
import { useGlobalStore } from "@/hooks/use-global-store"

export function PackageBuildHeader() {
  const { author, packageName } = useParams()
  const session = useGlobalStore((s) => s.session)
  const { packageRelease } = useCurrentPackageRelease({
    include_logs: true,
  })
  const { mutate: rebuildPackage, isLoading } =
    useRebuildPackageReleaseMutation()

  return (
    <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 container mx-auto max-w-7xl">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="whitespace-nowrap">Package Build</span>
            <a
              className="bg-gray-100 px-2 py-1 rounded font-mono text-blue-600 text-sm sm:text-base truncate w-fit"
              href={`/${author}/${packageName}`}
            >
              {author}/{packageName}
            </a>
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm"
            asChild
          >
            <a
              href="https://github.com/tscircuit/tscircuit.com/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Report Issue</span>
              <span className="xs:hidden">Report</span>
            </a>
          </Button>
          {session?.github_username == author && (
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm"
              disabled={isLoading || !packageRelease}
              onClick={() =>
                packageRelease &&
                rebuildPackage({
                  package_release_id: packageRelease.package_release_id,
                })
              }
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {isLoading ? "Rebuilding..." : "Rebuild"}
            </Button>
          )}
          <DownloadButtonAndMenu unscopedName={packageName} author={author} />
        </div>
      </div>
    </div>
  )
}
