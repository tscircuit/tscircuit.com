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
import { Package, PackageBuild } from "fake-snippets-api/lib/db/schema"
import { usePackageBuilds } from "@/hooks/use-package-builds"
import { usePackageReleaseById } from "@/hooks/use-package-release"
import { useQueries } from "react-query"
import { useAxios } from "@/hooks/use-axios"

export const BuildsList = ({
  pkg,
  onSelectBuild,
}: {
  pkg: Package
  onSelectBuild?: (build: PackageBuild) => void
}) => {
  const { data: builds, isLoading } = usePackageBuilds({
    package_id: pkg.package_id,
  })
  const axios = useAxios()

  const uniqueReleaseIds = [
    ...new Set(
      builds?.map((build) => build.package_release_id).filter(Boolean) || [],
    ),
  ]

  const packageReleaseQueries = useQueries(
    uniqueReleaseIds.map((releaseId) => ({
      queryKey: ["packageRelease", { package_release_id: releaseId }],
      queryFn: async () => {
        const { data } = await axios.post("/package_releases/get", {
          package_release_id: releaseId,
        })
        return data.package_release
      },
      enabled: Boolean(releaseId),
      retry: false,
      refetchOnWindowFocus: false,
    })),
  )

  const packageReleasesMap = new Map()
  packageReleaseQueries.forEach((query, index) => {
    if (query.data) {
      packageReleasesMap.set(uniqueReleaseIds[index], query.data)
    }
  })
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Builds</h2>
            <p className="text-gray-600">Manage and monitor your builds</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto [&>div]:no-scrollbar">
              <Table className="no-scrollbar">
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Build ID</TableHead>
                    <TableHead>Branch/PR</TableHead>
                    <TableHead>Commit</TableHead>
                    <TableHead>Author</TableHead>
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
                    : builds?.map((build) => {
                        const { status, label } = getBuildStatus(build)
                        const packageRelease = packageReleasesMap.get(
                          build.package_release_id,
                        )
                        return (
                          <TableRow
                            key={build.package_build_id}
                            className="cursor-pointer hover:bg-gray-50 no-scrollbar"
                            onClick={() => onSelectBuild?.(build)}
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
                                {build.package_build_id.slice(-8)}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {packageRelease?.is_pr_preview ? (
                                  <GitBranch className="w-3 h-3 text-gray-500" />
                                ) : (
                                  <GitCommit className="w-3 h-3 text-gray-500" />
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {packageRelease?.is_pr_preview
                                    ? `#${packageRelease.github_pr_number}`
                                    : packageRelease?.branch_name || "main"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm font-medium truncate">
                                  {build.commit_message || "No commit message"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {build.commit_author || "Unknown"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {formatTimeAgo(build.created_at)}
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
                                      onClick={() => onSelectBuild?.(build)}
                                    >
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onSelectBuild?.(build)}
                                    >
                                      View Logs
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
                      {builds?.filter(
                        (d) => getBuildStatus(d).status === "success",
                      ).length || 0}
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
                      {builds?.filter(
                        (d) => getBuildStatus(d).status === "error",
                      ).length || 0}
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
                      {builds?.filter(
                        (d) => getBuildStatus(d).status === "building",
                      ).length || 0}
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
                      {builds?.length || 0}
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
