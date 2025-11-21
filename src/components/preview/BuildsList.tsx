import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GitBranch, MoreHorizontal, GitCommit } from "lucide-react"
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
import { Package, PackageBuild } from "fake-snippets-api/lib/db/schema"
import { usePackageReleasesByPackageId } from "@/hooks/use-package-release"
import { useQueries } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useLocation } from "wouter"

export const BuildsList = ({ pkg }: { pkg: Package }) => {
  const { data: releases, isLoading: isLoadingReleases } =
    usePackageReleasesByPackageId(pkg.package_id)
  const axios = useAxios()
  const [, setLocation] = useLocation()
  // Get the latest build for each release to show status
  const latestBuildQueries = useQueries(
    (releases || [])
      .filter((release) => release.latest_package_build_id)
      .map((release) => ({
        queryKey: ["packageBuild", release.latest_package_build_id],
        queryFn: async () => {
          if (!release.latest_package_build_id) return null
          const { data } = await axios.get("/package_builds/get", {
            params: { package_build_id: release.latest_package_build_id },
          })
          return data.package_build
        },
        enabled: Boolean(release.latest_package_build_id),
        retry: false,
        refetchOnWindowFocus: false,
      })),
  )

  const isLoading =
    isLoadingReleases || latestBuildQueries.some((q) => q.isLoading)

  // Create a map of release ID to latest build for easy access
  const latestBuildsMap = new Map<string, PackageBuild>()

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
                        const { status, label } = getBuildStatus(latestBuild)
                        return (
                          <TableRow
                            key={release.package_release_id}
                            className="cursor-pointer hover:bg-gray-50 no-scrollbar"
                            onClick={() => {
                              setLocation(
                                `/${pkg.name}/releases/${release.package_release_id}`,
                              )
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
                                        window.location.href = `/${pkg.name}/releases/${release.package_release_id}`
                                      }}
                                    >
                                      View Release
                                    </DropdownMenuItem>
                                    {status !== "error" && (
                                      <DropdownMenuItem>
                                        <a
                                          href={`/${pkg.name}/releases/${latestBuild?.package_release_id}/preview`}
                                        >
                                          Preview Release
                                        </a>
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        window.location.href = `/${pkg.name}/releases/${release.package_release_id}/builds`
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
      </div>
    </>
  )
}
