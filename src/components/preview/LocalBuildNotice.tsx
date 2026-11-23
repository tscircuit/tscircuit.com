import { LaptopMinimalCheck } from "lucide-react"

/**
 * Shown in place of build logs for builds that were built locally and uploaded
 * with their dist output, since no cloud build was run for them
 */
export const LocalBuildNotice = ({
  canStartCloudBuild = false,
}: {
  canStartCloudBuild?: boolean
}) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
      <LaptopMinimalCheck className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900">Built locally</h3>
        <p className="text-sm text-gray-600">
          This build's output was uploaded with{" "}
          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
            tsci push --include-dist
          </code>
          , so no cloud build was run and there are no build logs.
          {canStartCloudBuild && (
            <> Use "Build in cloud" above to rebuild it on tscircuit.com.</>
          )}
        </p>
      </div>
    </div>
  </div>
)
