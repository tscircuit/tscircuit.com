import { Github, RefreshCw, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useRebuildPackageReleaseMutation } from "@/hooks/use-rebuild-package-release-mutation"
import { Github, RefreshCw, RotateCcw } from "lucide-react"
import { useParams } from "wouter"
import { DownloadButtonAndMenu } from "../DownloadButtonAndMenu"

export function PackageBuildHeader() {
  const { author, packageName } = useParams()
  const { packageRelease, refetch, isFetching } = useCurrentPackageRelease({
    include_logs: true,
  })
  const { mutate: rebuildPackage, isLoading } =
    useRebuildPackageReleaseMutation()

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between container mx-auto">
        <h1 className="text-2xl font-semibold">
          Package Build
          <a
            className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono text-blue-600"
            href={`/${author}/${packageName}`}
          >
            {author}/{packageName}
          </a>
        </h1>
        <div className="flex items-center gap-3">
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
              Report Issue
            </a>
          </Button>
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
          <Button
            variant="outline"
            size="icon"
            aria-label="Reload logs"
            className="border-gray-300 bg-white hover:bg-gray-50"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <DownloadButtonAndMenu
            snippetUnscopedName={`${author}/${packageName}`}
          />
        </div>
      </div>
    </div>
  )
}
