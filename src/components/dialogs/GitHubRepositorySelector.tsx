import { useRef } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAxios } from "@/hooks/use-axios"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useQuery } from "react-query"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Minus, Plus } from "lucide-react"
import { Switch } from "../ui/switch"

interface GitHubRepositorySelectorProps {
  selectedRepository?: string
  setSelectedRepository?: (value: string | null) => void
  disabled?: boolean
  open?: boolean
  addFormContent?: (props: {
    allowPrPreviews?: boolean
  }) => void
  formData?: any
}

export const GitHubRepositorySelector = ({
  selectedRepository,
  setSelectedRepository,
  disabled = false,
  open = false,
  addFormContent,
  formData,
}: GitHubRepositorySelectorProps) => {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const initialValue = useRef(selectedRepository).current
  // Fetch available repositories
  const { data: repositoriesData, error: repositoriesError } = useQuery(
    ["github-repositories"],
    async () => {
      const response = await axios.get("/github/repos/list_available")
      return response.data
    },
    {
      enabled: open, // Only fetch when needed
      retry: false,
    },
  )

  const handleConnectMoreRepos = async () => {
    window.location.href = `${apiBaseUrl}/github/installations/create_new_installation_redirect?return_to_page=${window.location.pathname}`
  }

  const handleValueChange = (newValue: string) => {
    if (newValue === "connect-more") {
      handleConnectMoreRepos()
    } else if (newValue === "unlink//repo") {
      setSelectedRepository?.("unlink//repo")
    } else {
      setSelectedRepository?.(newValue)
    }
  }

  return (
    <>
      <div className="space-y-1 mb-3">
        <Label htmlFor="repository">GitHub Repository</Label>
        {(repositoriesError as any)?.response?.status === 400 &&
        (repositoriesError as any)?.response?.data?.error_code ===
          "github_not_connected" ? (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Connect your GitHub account to link this package to a repository.
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleConnectMoreRepos}
              className="w-full"
              disabled={disabled}
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              Connect GitHub Account
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Select
              value={selectedRepository}
              onValueChange={handleValueChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent className="!z-[999]">
                {repositoriesData?.repos?.map((repo: any) => (
                  <SelectItem key={repo.full_name} value={repo.full_name}>
                    <div className="flex items-center space-x-2">
                      <span>{repo.unscoped_name}</span>
                      {repo.private && (
                        <span className="text-xs text-muted-foreground">
                          (private)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="connect-more">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Plus className="w-3 h-3" />
                    <span>Connect More Repos</span>
                  </div>
                </SelectItem>
                {Boolean(initialValue) && (
                  <SelectItem value="unlink//repo">
                    <div className="flex items-center space-x-2 text-red-600">
                      <Minus className="w-3 h-3" />
                      <span>Unlink Repo</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {initialValue && selectedRepository !== "unlink//repo" && (
        <div className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Enable PR Preview</Label>
              <p className="text-xs text-gray-500">
                Generate preview builds for pull requests
              </p>
            </div>
            <Switch
              checked={formData?.allowPrPreviews}
              onCheckedChange={(checked) =>
                addFormContent?.({
                  allowPrPreviews: checked,
                })
              }
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </>
  )
}
