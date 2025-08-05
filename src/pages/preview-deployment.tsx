import React, { useState } from "react"
import { useParams } from "wouter"
import { Loader2, ChevronLeft, ChevronRight, File, Folder } from "lucide-react"
import Header from "@/components/Header"
import { SuspenseRunFrame } from "@/components/SuspenseRunFrame"
import { TreeView, TreeDataItem } from "@/components/ui/tree-view"
import { cn } from "@/lib/utils"
import { MOCK_DEPLOYMENTS } from "@/components/Deployment"

interface Deployment {
  id: string
  commitHash: string
  status: "queued" | "building" | "success" | "failed"
  createdAt: string
  previewUrl?: string
  logUrl?: string
}

const MOCK_DEPLOYMENT_FILES: Record<
  string,
  Array<{ path: string; content: string }>
> = {
  pb_1a2b3c4d: [
    {
      path: "index.tsx",
      content: `import React from 'react';\nexport default function App() {\n  return <div>Hello from Deployment 1!</div>;\n}`,
    },
    {
      path: "components/Button.tsx",
      content: `import React from 'react';\nexport const Button = ({ children }: { children: React.ReactNode }) => {\n  return <button className="btn">{children}</button>;\n}`,
    },
    {
      path: "README.md",
      content: `# Deployment 1\n\nThis is the first deployment.`,
    },
  ],
  pb_9i8j7k6l: [
    {
      path: "index.tsx",
      content: `import React from 'react';\nexport default function App() {\n  return <div>Hello from Deployment 2!</div>;\n}`,
    },
    {
      path: "utils/helpers.ts",
      content: `export const formatDate = (date: Date) => {\n  return date.toLocaleDateString();\n}`,
    },
  ],
  pb_1q2w3e4r: [
    {
      path: "index.tsx",
      content: `import React from 'react';\nexport default function App() {\n  return <div>Failed deployment</div>;\n}`,
    },
  ],
  pb_9o8i7u6y: [
    {
      path: "index.tsx",
      content: `import React from 'react';\nexport default function App() {\n  return <div>Initial project setup</div>;\n}`,
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

const StatusPill: React.FC<{ status: Deployment["status"] }> = ({ status }) => {
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

  const deploymentData = deploymentId
    ? MOCK_DEPLOYMENTS.find((d) => d.package_build_id === deploymentId)
    : MOCK_DEPLOYMENTS[0]

  const deployment: Deployment = deploymentData
    ? {
        id: deploymentData.package_build_id,
        commitHash: deploymentData.package_build_id.slice(-7),
        status:
          deploymentData.build_error ||
          deploymentData.transpilation_error ||
          deploymentData.circuit_json_build_error
            ? "failed"
            : deploymentData.build_in_progress ||
                deploymentData.transpilation_in_progress ||
                deploymentData.circuit_json_build_in_progress
              ? "building"
              : deploymentData.build_completed_at &&
                  deploymentData.transpilation_completed_at
                ? "success"
                : "queued",
        createdAt: deploymentData.created_at,
        previewUrl: deploymentData.preview_url || undefined,
        logUrl: undefined,
      }
    : {
        id: "pb_1a2b3c4d",
        commitHash: "1a2b3c4",
        status: "success" as const,
        createdAt: new Date().toISOString(),
        previewUrl: "https://preview.tscircuit.com/pb_1a2b3c4d",
      }

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
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            "relative border-r border-gray-200 transition-all duration-300 ease-in-out bg-white",
            sidebarCollapsed ? "w-12" : "w-80",
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
                    <StatusPill status={deployment.status} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        ID
                      </span>
                      <span className="font-mono text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {deployment.id}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Commit
                      </span>
                      <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {deployment.commitHash}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Status
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                          deployment.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : deployment.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : deployment.status === "building"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {deployment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Files</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {deploymentFiles.length} file
                    {deploymentFiles.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="px-2 py-2 overflow-y-auto">
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
          <div className="flex flex-col h-full">
            {deployment.status === "success" ? (
              <SuspenseRunFrame
                fsMap={deploymentFsMap}
                mainComponentPath={selectedFile ?? "index.tsx"}
                showRunButton={false}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                {deployment.status === "building" ? (
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p>Building…</p>
                  </div>
                ) : deployment.status === "failed" ? (
                  <div className="text-center">
                    <p className="text-red-600 font-medium mb-2">
                      Build Failed
                    </p>
                    {deployment.logUrl && (
                      <a
                        href={deployment.logUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Logs →
                      </a>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
