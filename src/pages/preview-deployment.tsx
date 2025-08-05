import { useState } from "react"
import { useParams } from "wouter"
import { Loader2, ChevronLeft, ChevronRight, File, Folder } from "lucide-react"
import Header from "@/components/Header"
import { SuspenseRunFrame } from "@/components/SuspenseRunFrame"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"
import { cn } from "@/lib/utils"
import { MOCK_DEPLOYMENTS } from "@/components/deployment/DeploymentCard"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"
import NotFoundPage from "./404"
import { getDeploymentStatus } from "@/components/deployment"

const MOCK_DEPLOYMENT_FILES: Record<
  string,
  Array<{ path: string; content: string }>
> = {
  pb_1a2b3c4d: [
    {
      path: "index.tsx",
      content: `export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
      schX={3}
      pcbX={3}
    />
    <capacitor
      capacitance="1000pF"
      footprint="0402"
      name="C1"
      schX={-3}
      pcbX={-3}
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)`,
    },
    {
      path: "components/Button.tsx",
      content: `export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
      schX={3}
      pcbX={3}
    />
    <capacitor
      capacitance="1000pF"
      footprint="0402"
      name="C1"
      schX={-3}
      pcbX={-3}
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)`,
    },
  ],
  pb_9i8j7k6l: [
    {
      path: "index.tsx",
      content: `export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
      schX={3}
      pcbX={3}
    />
    <capacitor
      capacitance="1000pF"
      footprint="0402"
      name="C1"
      schX={-3}
      pcbX={-3}
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)`,
    },
    {
      path: "utils/helpers.ts",
      content: `export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
      schX={3}
      pcbX={3}
    />
    <capacitor
      capacitance="1000pF"
      footprint="0402"
      name="C1"
      schX={-3}
      pcbX={-3}
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)`,
    },
  ],
  pb_1q2w3e4r: [
    {
      path: "index.tsx",
      content: `export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
      schX={3}
      pcbX={3}
    />
    <capacitor
      capacitance="1000pF"
      footprint="0402"
      name="C1"
      schX={-3}
      pcbX={-3}
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)`,
    },
  ],
  pb_9o8i7u6y: [
    {
      path: "index.tsx",
      content: `export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
      schX={3}
      pcbX={3}
    />
    <capacitor
      capacitance="1000pF"
      footprint="0402"
      name="C1"
      schX={-3}
      pcbX={-3}
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)`,
    },
  ],
}

const getDeploymentFiles = (deploymentId: string | null) => {
  if (!deploymentId) return []
  return MOCK_DEPLOYMENT_FILES[deploymentId] || []
}

const getDeploymentFsMap = (deploymentId: string | null) => {
  const files = getDeploymentFiles(deploymentId)
  return Object.fromEntries(files.map((f) => [f.path, f.content]))
}

const StatusPill = ({ status }: { status: string }) => {
  const color =
    status === "success"
      ? "bg-emerald-600"
      : status === "failed"
        ? "bg-red-600"
        : status === "building"
          ? "bg-blue-600 animate-pulse"
          : "bg-gray-500"
  return <span className={cn("inline-block w-2 h-2 rounded-full", color)} />
}

export default function PreviewDeploymentPage() {
  const params = useParams<{ deploymentId: string }>()
  const deploymentId = params?.deploymentId || null

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>("index.tsx")
  const [selectedItemId, setSelectedItemId] = useState<string>("")

  const deploymentFiles = getDeploymentFiles(deploymentId)
  const deploymentFsMap = getDeploymentFsMap(deploymentId)

  const deployment = deploymentId
    ? MOCK_DEPLOYMENTS.find((d) => d.package_build_id === deploymentId)
    : MOCK_DEPLOYMENTS[0]

  if (!deployment) {
    return <NotFoundPage heading="Deployment Not Found" />
  }
  const { status, label } = getDeploymentStatus(deployment)
  const convertFilesToTreeData = (
    files: Array<{ path: string; content: string }>,
  ): TreeDataItem[] => {
    const tree: TreeDataItem[] = []
    const pathMap = new Map<string, TreeDataItem>()

    files.forEach((file) => {
      const parts = file.path.split("/")
      let currentPath = ""

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!pathMap.has(currentPath)) {
          const item: TreeDataItem = {
            id: currentPath,
            name: part,
            icon: isLast ? File : Folder,
            children: isLast ? undefined : [],
          }

          pathMap.set(currentPath, item)

          if (index === 0) {
            tree.push(item)
          } else {
            const parentPath = parts.slice(0, index).join("/")
            const parent = pathMap.get(parentPath)
            if (parent && parent.children) {
              parent.children.push(item)
            }
          }
        }
      })
    })

    return tree
  }

  const treeData = convertFilesToTreeData(deploymentFiles)

  return (
    <>
      <Header />
      <div className="flex flex-col h-screen overflow-hidden  !-mt-1">
        <div className="flex flex-1 overflow-hidden">
          <aside
            className={cn(
              "relative border-r border-gray-200 rounded-r-lg z-[5] h-full transition-all duration-300 ease-in-out bg-white",
              sidebarCollapsed ? "w-3" : "w-80",
            )}
          >
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute top-4 -right-3 z-10 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            {!sidebarCollapsed && (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Deployment
                      </h2>
                      <StatusPill status={status} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          ID
                        </span>
                        <PrefetchPageLink
                          href={`/deployment/${deployment.package_build_id}`}
                          className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded"
                        >
                          {deployment.package_build_id}
                        </PrefetchPageLink>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Commit
                        </span>
                        <PrefetchPageLink
                          href={`https://github.com/${deployment.commit_author}/tscircuit.com/commit/${deployment.commit_message}`}
                          className="font-mono text-xs text-gray-600 bg-gray-50 px-2 text-right py-1 rounded line-clamp-1"
                        >
                          {deployment.commit_message}
                        </PrefetchPageLink>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          Status
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                            status === "success"
                              ? "bg-emerald-100 text-emerald-800"
                              : status === "failed"
                                ? "bg-red-100 text-red-800"
                                : status === "building"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Files
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {deploymentFiles.length} file
                      {deploymentFiles.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="px-2 py-2 overflow-y-auto select-none">
                    <TreeView
                      selectedItemId={selectedItemId || ""}
                      setSelectedItemId={(v) => setSelectedItemId(v || "")}
                      data={treeData}
                      className="w-full"
                      onSelectChange={(item) => {
                        if (item && !item.children) {
                          setSelectedFile(item.id)
                        }
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div className="flex flex-col h-full overflow-h-hidden">
              {status === "success" ? (
                <SuspenseRunFrame
                  fsMap={deploymentFsMap}
                  mainComponentPath={selectedFile ?? "index.tsx"}
                  showRunButton={false}
                  className="[&>div]:overflow-y-hidden"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  {status === "building" ? (
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <p>Building…</p>
                    </div>
                  ) : status === "failed" ? (
                    <div className="text-center">
                      <p className="text-red-600 font-medium mb-2">
                        Build Failed
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
