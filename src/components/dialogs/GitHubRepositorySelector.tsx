import { useRef, useState, useMemo } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAxios } from "@/hooks/use-axios"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useQuery } from "react-query"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Minus, Plus, RefreshCw } from "lucide-react"
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
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  // Fetch available repositories
  const {
    data: repositoriesData,
    error: repositoriesError,
    refetch: refetchRepositories,
    isLoading,
  } = useQuery(
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

  const handleRefreshRepositories = async () => {
    try {
      // First call the refresh endpoint to update repositories
      await axios.post("/github/repos/refresh")
      // Then refetch the repositories list
      refetchRepositories()
    } catch (error) {
      console.error("Failed to refresh repositories:", error)
      // Still try to refetch in case the error is not critical
      refetchRepositories()
    }
  }

  // Create searchable options for the combobox
  const comboboxOptions = useMemo(() => {
    const repos = repositoriesData?.repos || []
    const repoOptions = repos.map((repo: any) => ({
      value: repo.full_name,
      label: repo.unscoped_name,
      isPrivate: repo.private,
      type: "repo" as const,
    }))

    const specialOptions = [
      {
        value: "connect-more",
        label: "Connect More Repos",
        type: "special" as const,
        icon: "plus" as const,
      },
      ...(initialValue
        ? [
            {
              value: "unlink//repo",
              label: "Unlink Repo",
              type: "special" as const,
              icon: "minus" as const,
            },
          ]
        : []),
    ]

    return [...repoOptions, ...specialOptions]
  }, [repositoriesData?.repos, initialValue])

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchValue) return comboboxOptions
    return comboboxOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
        option.value.toLowerCase().includes(searchValue.toLowerCase()),
    )
  }, [comboboxOptions, searchValue])

  const handleComboboxSelect = (value: string) => {
    if (value === "connect-more") {
      handleConnectMoreRepos()
    } else {
      setSelectedRepository?.(value)
    }
    setComboboxOpen(false)
    setSearchValue("")
  }

  const getDisplayValue = () => {
    if (!selectedRepository) return "Select a repository"
    const option = comboboxOptions.find(
      (opt) => opt.value === selectedRepository,
    )
    return option?.label || selectedRepository
  }

  return (
    <>
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="repository">GitHub Repository</Label>
          {!(
            (repositoriesError as any)?.response?.status === 400 &&
            (repositoriesError as any)?.response?.data?.error_code ===
              "github_not_connected"
          ) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRefreshRepositories}
              disabled={disabled || isLoading}
              className="h-auto p-1"
            >
              <RefreshCw
                className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
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
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                  disabled={disabled}
                >
                  {getDisplayValue()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 z-[999]"
                align="start"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    value={searchValue}
                    onValueChange={setSearchValue}
                    placeholder="Search repositories..."
                  />
                  <CommandList className="max-h-[400px] overflow-y-auto">
                    <CommandEmpty className="text-sm text-slate-500 py-6 pl-4">
                      No repositories found.
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleComboboxSelect(option.value)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center space-x-2 w-full">
                            {option.type === "repo" ? (
                              <>
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedRepository === option.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <span>{option.label}</span>
                                {option.isPrivate && (
                                  <span className="text-xs text-muted-foreground">
                                    (private)
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                {option.icon === "plus" ? (
                                  <Plus className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <Minus className="w-3 h-3 text-red-600" />
                                )}
                                <span
                                  className={
                                    option.icon === "plus"
                                      ? "text-blue-600"
                                      : "text-red-600"
                                  }
                                >
                                  {option.label}
                                </span>
                              </>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
