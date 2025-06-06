import { Github, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "wouter"
import { DownloadButtonAndMenu } from "../DownloadButtonAndMenu"

export function PackageBuildHeader() {
  const { author, packageName } = useParams()

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
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Rebuild
          </Button>
          <DownloadButtonAndMenu
            snippetUnscopedName={`${author}/${packageName}`}
          />
        </div>
      </div>
    </div>
  )
}
