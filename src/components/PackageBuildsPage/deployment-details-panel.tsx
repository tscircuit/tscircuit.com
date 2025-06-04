import { Globe, GitBranch, GitCommit, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DeploymentDetailsPanel() {
  return (
    <div className="space-y-6 bg-white p-4 border border-gray-200 rounded-lg">
      {/* Created */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Created</h3>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
            I
          </div>
          <span className="text-sm">imrishabh18</span>
          <span className="text-sm text-gray-500">48m ago</span>
        </div>
      </div>

      {/* Status */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">Ready</span>
          <Badge
            variant="secondary"
            className="bg-gray-200 text-gray-700 text-xs"
          >
            Latest
          </Badge>
        </div>
      </div>

      {/* Time to Ready */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">
          Time to Ready
        </h3>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">1m 3s</span>
          <span className="text-sm text-gray-500">47m ago</span>
        </div>
      </div>

      {/* Version */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Version</h3>
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-sm">v1.0.3</span>
          <Badge variant="default" className="bg-blue-600 text-white text-xs">
            Current
          </Badge>
        </div>
      </div>

      {/* Outputs */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Outputs</h3>
        <div>
          <span className="text-sm text-gray-400">None</span>
        </div>
      </div>

      {/* Source */}
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Source</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-gray-500" />
            <span className="text-sm">main</span>
          </div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              edfdc67 support empty file creation (#356)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
