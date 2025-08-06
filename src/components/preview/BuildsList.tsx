import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Clock,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  GitCommit,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getBuildStatus, StatusIcon } from "."
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { Package } from "fake-snippets-api/lib/db/schema"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { useQueries } from "react-query"
import { useAxios } from "@/hooks/use-axios"

export const BuildsList = ({ pkg }: { pkg: Package }) => {
  const { data: releases, isLoading: isLoadingReleases } =
    usePackageReleasesByPackageId(pkg.package_id)
  const axios = useAxios()

  // Get the latest build for each release to show status
  const latestBuildQueries = useQueries(
    (releases || []).map((release) => ({
      queryKey: ["latestBuildByRelease", release.package_release_id],
      queryFn: async () => {
        const { data } = await axios.get("/package_builds/latest", {
          params: { package_release_id: release.package_release_id },
        })
        return data.package_build
      },
      enabled: Boolean(release.package_release_id),
      retry: false,
      refetchOnWindowFocus: false,
    })),
  )

  const isLoading =
    isLoadingReleases || latestBuildQueries.some((q) => q.isLoading)

  // Create a map of release ID to latest build for easy access
  const latestBuildsMap = new Map()
  latestBuildQueries.forEach((query, index) => {
    if (query.data && releases?.[index]) {
      latestBuildsMap.set(releases[index].package_release_id, query.data)
    }
  })
  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Releases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto [&>div]:no-scrollbar">
              <Table className="no-scrollbar">
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Release ID</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Branch/PR</TableHead>
                    <TableHead>Latest Build</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-12" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-8" />
                          </TableCell>
                        </TableRow>
                      ))
                    : releases?.map((release) => {
                        const latestBuild = latestBuildsMap.get(
                          release.package_release_id,
                        )
                        const { status, label } = latestBuild
                          ? getBuildStatus(latestBuild)
                          : { status: "unknown", label: "No builds" }
                        return (
                          <TableRow
                            key={release.package_release_id}
                            className="cursor-pointer hover:bg-gray-50 no-scrollbar"
                            onClick={() => {
                              window.location.href = `/${pkg.name}/release/${release.package_release_id}`
                            }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <StatusIcon status={status} />
                                <Badge
                                  variant={
                                    status === "success"
                                      ? "default"
                                      : status === "error"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {release.package_release_id.slice(-8)}
                              </code>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {release.version ||
                                  "v" + release.package_release_id.slice(-6)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {release.is_pr_preview ? (
                                  <GitBranch className="w-3 h-3 text-gray-500" />
                                ) : (
                                  <GitCommit className="w-3 h-3 text-gray-500" />
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {release.is_pr_preview
                                    ? `#${release.github_pr_number}`
                                    : "main"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                {latestBuild ? (
                                  <p className="text-sm text-gray-600">
                                    {formatTimeAgo(latestBuild.created_at)}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400">
                                    No builds
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {formatTimeAgo(release.created_at)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        window.location.href = `/${pkg.name}/release/${release.package_release_id}`
                                      }}
                                    >
                                      View Release
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        window.location.href = `/${pkg.name}/release/${release.package_release_id}/builds`
                                      }}
                                    >
                                      View All Builds
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {releases?.filter((release) => {
                        const latestBuild = latestBuildsMap.get(
                          release.package_release_id,
                        )
                        return (
                          latestBuild &&
                          getBuildStatus(latestBuild).status === "success"
                        )
                      }).length || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {releases?.filter((release) => {
                        const latestBuild = latestBuildsMap.get(
                          release.package_release_id,
                        )
                        return (
                          latestBuild &&
                          getBuildStatus(latestBuild).status === "error"
                        )
                      }).length || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Building</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {releases?.filter((release) => {
                        const latestBuild = latestBuildsMap.get(
                          release.package_release_id,
                        )
                        return (
                          latestBuild &&
                          getBuildStatus(latestBuild).status === "building"
                        )
                      }).length || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {releases?.length || 0}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
