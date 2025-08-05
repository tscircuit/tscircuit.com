import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Activity,
  Settings,
  List,
  Github,
  MoreHorizontal,
  Zap,
  Clock,
  GitBranch,
  Hash,
  User,
  Eye,
} from "lucide-react"
import { useLocation } from "wouter"
import { ConnectedRepoOverview } from "./ConnectedRepoOverview"
import { BuildsList } from "./BuildsList"
import { ConnectedRepoSettings } from "./ConnectedRepoSettings"
import Header from "../Header"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { getBuildStatus, PackageBuild, MOCK_DEPLOYMENTS } from "."

interface ConnectedRepoDashboardProps {
  projectName?: string
  builds?: PackageBuild[]
  selectedBuild?: PackageBuild
}

export const ConnectedRepoDashboard = ({
  projectName = "tscircuit-project",
  builds = MOCK_DEPLOYMENTS,
  selectedBuild,
}: ConnectedRepoDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [currentBuild, setCurrentBuild] = useState<PackageBuild | undefined>(
    selectedBuild || builds[0],
  )
  const [, setLocation] = useLocation()

  const handleSelectBuild = (build: PackageBuild) => {
    setLocation(`/build/${build.package_build_id}`)
  }

  const latestBuild = builds[0]
  const { status, label } = getBuildStatus(latestBuild)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Project Header */}
        <div className="bg-gray-50 border-b md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 hidden md:block h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src="https://github.com/tscircuit.png"
                    alt="tscircuit logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {projectName}
                    </h1>
                    <Badge
                      variant={
                        status === "success"
                          ? "default"
                          : status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                      className="flex items-center gap-1 w-fit"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          status === "success"
                            ? "bg-green-500"
                            : status === "error"
                              ? "bg-red-500"
                              : status === "building"
                                ? "bg-blue-500 animate-pulse"
                                : "bg-gray-500"
                        }`}
                      />
                      {label}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {latestBuild.branch_name || "main"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Last deployed {formatTimeAgo(latestBuild.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {latestBuild.commit_author || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4 flex-shrink-0" />
                      <span className="font-mono text-xs truncate">
                        {latestBuild.package_build_id?.slice(-8) || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 justify-center min-w-[120px] h-9"
                  onClick={() =>
                    window.open(
                      `https://github.com/${latestBuild.commit_author}/${projectName}`,
                      "_blank",
                    )
                  }
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">Repository</span>
                  <span className="sm:hidden">Repository</span>
                </Button>
                {latestBuild.preview_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 justify-center min-w-[120px] h-9"
                    onClick={() =>
                      window.open(
                        `/build/${latestBuild.package_build_id}/preview`,
                        "_blank",
                      )
                    }
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                    <span className="sm:hidden">Preview</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  className="flex items-center gap-2 justify-center min-w-[120px] h-9 bg-black text-white"
                >
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Redeploy</span>
                  <span className="sm:hidden">Redeploy</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 sm:w-9 p-0"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a
                        href={`https://github.com/${latestBuild.commit_author}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Source
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="#" download>
                        Download Build
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: projectName,
                            url: window.location.href,
                          })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                        }
                      }}
                    >
                      Share Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="builds" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Builds
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {currentBuild && <ConnectedRepoOverview build={currentBuild} />}
            </TabsContent>

            <TabsContent value="builds" className="space-y-6">
              <BuildsList builds={builds} onSelectBuild={handleSelectBuild} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <ConnectedRepoSettings
                projectName={projectName}
                onSave={(settings) => console.log("Settings saved:", settings)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
