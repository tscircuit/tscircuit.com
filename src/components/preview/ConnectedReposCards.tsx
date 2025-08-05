import React, { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitBranch, Rocket, Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { PrefetchPageLink } from "../PrefetchPageLink"
import { formatTimeAgo } from "@/lib/utils/formatTimeAgo"
import { getBuildStatus, MOCK_DEPLOYMENTS, PackageBuild, StatusIcon } from "."

interface ConnectedRepoCardProps {
  ConnectedRepo: PackageBuild
  className?: string
}

export const ConnectedRepoCard = ({
  ConnectedRepo,
  className,
}: ConnectedRepoCardProps) => {
  const { status, label } = getBuildStatus(ConnectedRepo)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden",
        "border border-gray-200",
        "hover:border-gray-300",
        "bg-white",
        "p-6",
        "flex flex-col",
        "min-h-[200px]",
        className,
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            tsc-deploy
          </a>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge
            variant={
              status === "success"
                ? "default"
                : status === "error"
                  ? "destructive"
                  : "secondary"
            }
            className="text-xs flex items-center"
          >
            {label}
          </Badge>
          <div className="flex items-center justify-center">
            <StatusIcon status={status} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Github className="w-4 h-4 text-gray-600" />
        <a
          href={`https://github.com/${ConnectedRepo.commit_author}/tsc-deploy`}
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          {ConnectedRepo.commit_author}/tsc-deploy
        </a>
      </div>

      {ConnectedRepo.commit_message && (
        <div className="mb-6 flex-1">
          <h4
            title={ConnectedRepo.commit_message}
            className="text-sm font-medium truncate text-gray-900 mb-2"
          >
            {ConnectedRepo.commit_message}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatTimeAgo(ConnectedRepo.created_at)} on</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                {ConnectedRepo.branch_name || "main"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 w-full mt-auto">
        <PrefetchPageLink
          className="w-full"
          href={`/build/${ConnectedRepo.package_build_id}`}
        >
          <Button
            size="sm"
            className="bg-blue-600 w-full hover:bg-blue-700 text-white px-4 py-2"
          >
            View
          </Button>
        </PrefetchPageLink>
        {ConnectedRepo.preview_url && status === "success" && (
          <PrefetchPageLink
            className="w-full"
            href={`/build/${ConnectedRepo.package_build_id}/preview`}
          >
            <Button size="sm" variant="outline" className="px-4 py-2 w-full">
              Preview
            </Button>
          </PrefetchPageLink>
        )}
      </div>
    </Card>
  )
}

export const ConnectedRepoCardSkeleton: React.FC = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-12 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
              <div className="w-20 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="w-full h-4 bg-gray-200 rounded" />
        <div className="flex gap-2">
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-8 bg-gray-200 rounded" />
          <div className="flex-1 h-8 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export const ConnectedReposCards = ({ user }: { user: string }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [ConnectedRepos, setConnectedRepos] = useState(MOCK_DEPLOYMENTS)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <ConnectedRepoCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (ConnectedRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-black">
        <Rocket className="w-12 h-12 mb-4 text-black" />
        <h3 className="text-xl font-semibold mb-3">
          No Connected Repositories
        </h3>
        <p className="text-sm text-center max-w-md text-gray-600">
          Connect your GitHub repositories to start building and deploying your
          circuits. Your connected repositories and builds will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ConnectedRepos.map((repo) => (
          <ConnectedRepoCard key={repo.package_build_id} ConnectedRepo={repo} />
        ))}
      </div>
    </div>
  )
}
