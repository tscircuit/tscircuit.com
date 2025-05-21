import { JLCPCBImportDialog } from "@/components/JLCPCBImportDialog"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useNotImplementedToast } from "@/hooks/use-toast"
import { Command } from "cmdk"
import { Package, Snippet } from "fake-snippets-api/lib/db/schema"
import React from "react"
import { useQuery } from "react-query"

type SnippetType = "board" | "package" | "model" | "footprint"

interface Template {
  name: string
  type: SnippetType
  disabled?: boolean
}

interface ImportOption {
  name: string
  type: SnippetType
  special?: boolean
}

const CmdKMenu = () => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isJLCPCBDialogOpen, setIsJLCPCBDialogOpen] = React.useState(false)
  const toastNotImplemented = useNotImplementedToast()
  const axios = useAxios()
  const currentUser = useGlobalStore((s) => s.session?.github_username)

  // Search results query
  const { data: searchResults = [], isLoading: isSearching } = useQuery(
    ["packageSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      const { data } = await axios.post("/packages/search", {
        query: searchQuery,
      })
      return data.packages || []
    },
    {
      enabled: Boolean(searchQuery),
    },
  )

  // Recent packages query
  const { data: recentPackages = [] } = useQuery<Package[]>(
    ["userPackages", currentUser],
    async () => {
      if (!currentUser) return []
      const response = await axios.post(`/packages/list`, {
        owner_github_username: currentUser,
      })
      return response.data.packages || []
    },
    {
      enabled: !!currentUser && !searchQuery,
    },
  )

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const blankTemplates: Template[] = [
    { name: "New Circuit Board", type: "board" },
    { name: "New Circuit Module", type: "package" },
    { name: "New 3D Model", type: "model", disabled: true },
    { name: "New Footprint", type: "footprint", disabled: true },
  ]

  const templates: Template[] = [
    { name: "Blinking LED Board", type: "board" },
    { name: "USB-C LED Flashlight", type: "board" },
  ]

  const importOptions: ImportOption[] = [
    { name: "KiCad Footprint", type: "footprint" },
    { name: "KiCad Project", type: "board" },
    { name: "KiCad Module", type: "package" },
    { name: "JLCPCB Component", type: "package", special: true },
  ]

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command Menu"
        className="fixed top-32 left-1/2 -translate-x-1/2 max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
        loop
      >
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3">
          <svg
            className="w-4 h-4 mr-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Command.Input
            placeholder="Search packages and commands..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="w-full h-12 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
        </div>

        <Command.List className="max-h-96 overflow-y-auto p-2">
          {isSearching ? (
            <Command.Loading className="p-4 text-sm text-gray-500">
              Loading results...
            </Command.Loading>
          ) : (
            <>
              {searchQuery && searchResults.length > 0 && (
                <Command.Group
                  heading="Search Results"
                  className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {searchResults.map((pkg: Package) => (
                    <Command.Item
                      key={pkg.package_id}
                      value={pkg.unscoped_name}
                      onSelect={() => {
                        window.location.href = `/editor?package_id=${pkg.package_id}`
                        setOpen(false)
                      }}
                      className="flex items-center justify-between px-2 py-1.5 rounded-sm text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-gray-100">
                          {pkg.name}
                        </span>
                        {pkg.description && (
                          <span className="text-sm text-gray-500">
                            {pkg.description}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">package</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {!searchQuery && recentPackages.length > 0 && (
                <Command.Group
                  heading="Recent Packages"
                  className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {recentPackages.slice(0, 6).map((pkg) => (
                    <Command.Item
                      key={pkg.package_id}
                      value={pkg.unscoped_name}
                      onSelect={() => {
                        window.location.href = `/editor?package_id=${pkg.package_id}`
                        setOpen(false)
                      }}
                      className="flex items-center justify-between px-2 py-1.5 rounded-sm text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-gray-100">
                          {pkg.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          Last edited:{" "}
                          {new Date(pkg.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">package</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group
                heading="Start Blank Package"
                className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {blankTemplates.map((template) => (
                  <Command.Item
                    key={template.name}
                    value={template.name}
                    disabled={template.disabled}
                    onSelect={() => {
                      if (!template.disabled) {
                        window.location.href = `/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`
                        setOpen(false)
                      }
                    }}
                    className="flex items-center justify-between px-2 py-1.5 rounded-sm text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default disabled:opacity-50 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      {template.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {template.type}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group
                heading="Start from Template"
                className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {templates.map((template) => (
                  <Command.Item
                    key={template.name}
                    value={template.name}
                    onSelect={() => {
                      window.location.href = `/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`
                      setOpen(false)
                    }}
                    className="flex items-center justify-between px-2 py-1.5 rounded-sm text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      {template.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {template.type}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group
                heading="Import"
                className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {importOptions.map((option) => (
                  <Command.Item
                    key={option.name}
                    value={option.name}
                    onSelect={() => {
                      if (option.special) {
                        setOpen(false)
                        setIsJLCPCBDialogOpen(true)
                      } else {
                        setOpen(false)
                        toastNotImplemented(`${option.name} Import`)
                      }
                    }}
                    className="flex items-center justify-between px-2 py-1.5 rounded-sm text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-default aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      Import {option.name}
                    </span>
                    <span className="text-sm text-gray-500">{option.type}</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {searchQuery && !searchResults.length && !isSearching && (
                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                  No results found.
                </Command.Empty>
              )}
            </>
          )}
        </Command.List>

        <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex space-x-4">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
            <div>
              <span>⌘K to toggle</span>
            </div>
          </div>
        </div>
      </Command.Dialog>

      <JLCPCBImportDialog
        open={isJLCPCBDialogOpen}
        onOpenChange={setIsJLCPCBDialogOpen}
      />
    </>
  )
}

export default CmdKMenu
