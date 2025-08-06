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
  List,
  MoreHorizontal,
  Zap,
  Clock,
  GitBranch,
  Eye,
} from "lucide-react"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { useLocation } from "wouter"
import { ConnectedRepoOverview } from "./ConnectedRepoOverview"
import { BuildsList } from "./BuildsList"
import Header from "../Header"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { getBuildStatus } from "."
import { PrefetchPageLink } from "../PrefetchPageLink"
import { Package, PackageBuild } from "fake-snippets-api/lib/db/schema"
import { usePackageReleaseById } from "@/hooks/use-package-release"

export const PackageReleasesDashboard = ({
  latestBuild,
  pkg,
}: {
  latestBuild: PackageBuild
  pkg: Package
}) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [, setLocation] = useLocation()
  const handleSelectBuild = (build: PackageBuild) => {
    setLocation(`/build/${build.package_build_id}`)
    setActiveTab("overview")
  }
  const { status, label } = getBuildStatus(latestBuild)
  const { data: packageRelease } = usePackageReleaseById(
    latestBuild?.package_release_id,
  )

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
                    <PrefetchPageLink
                      href={"/" + pkg.name}
                      className="text-2xl font-bold text-gray-900 truncate"
                    >
                      {pkg.unscoped_name}
                    </PrefetchPageLink>
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
                    <div
                      className="flex cursor-pointer items-center gap-1"
                      onClick={() =>
                        window?.open(
                          `https://github.com/${pkg.github_repo_full_name}/tree/${latestBuild.branch_name || "main"}`,
                          "_blank",
                        )
                      }
                    >
                      <GitBranch className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {latestBuild.branch_name || "main"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>
                        <time dateTime={latestBuild.created_at}>
                          Last built {formatTimeAgo(latestBuild.created_at)}
                        </time>
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
                      `https://github.com/${pkg.github_repo_full_name}`,
                      "_blank",
                    )
                  }
                >
                  <GitHubLogoIcon className="w-4 h-4" />
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
                  <span className="hidden sm:inline">Rebuild</span>
                  <span className="sm:hidden">Rebuild</span>
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
                        href={`https://github.com/${pkg.github_repo_full_name}`}
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
                            title: pkg.unscoped_name,
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
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="builds" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Builds
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {latestBuild && packageRelease && (
                <ConnectedRepoOverview
                  build={latestBuild}
                  pkg={pkg}
                  packageRelease={packageRelease}
                />
              )}
            </TabsContent>

            <TabsContent value="builds" className="space-y-6">
              <BuildsList pkg={pkg} onSelectBuild={handleSelectBuild} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
