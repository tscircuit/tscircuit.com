import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  GitCommit,
  Plus,
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
import { getDeploymentStatus, PackageBuild } from "."
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"

interface DeploymentsListProps {
  deployments: PackageBuild[]
  onSelectDeployment?: (deployment: PackageBuild) => void
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "error":
      return <AlertCircle className="w-4 h-4 text-red-500" />
    case "building":
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

export const DeploymentsList = ({
  deployments,
  onSelectDeployment,
}: DeploymentsListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deployments</h2>
          <p className="text-gray-600">Manage and monitor your deployments</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Deployment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Build ID</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Commit</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map((deployment) => {
                  const { status, label } = getDeploymentStatus(deployment)

                  return (
                    <TableRow
                      key={deployment.package_build_id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => onSelectDeployment?.(deployment)}
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
                          {deployment.package_build_id.slice(-8)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {deployment.branch_name?.includes("/") ? (
                            <GitBranch className="w-3 h-3 text-gray-500" />
                          ) : (
                            <GitCommit className="w-3 h-3 text-gray-500" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            {deployment.branch_name || "main"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm font-medium truncate">
                            {deployment.commit_message || "No commit message"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {deployment.commit_author || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatTimeAgo(deployment.created_at)}
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>View Logs</DropdownMenuItem>
                              <DropdownMenuItem>Redeploy</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Cancel
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
                <p className="text-2xl font-bold text-gray-900">
                  {
                    deployments.filter(
                      (d) => getDeploymentStatus(d).status === "success",
                    ).length
                  }
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {
                    deployments.filter(
                      (d) => getDeploymentStatus(d).status === "error",
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Building</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    deployments.filter(
                      (d) => getDeploymentStatus(d).status === "building",
                    ).length
                  }
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {deployments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
