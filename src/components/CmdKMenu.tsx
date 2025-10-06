import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useHotkeyCombo } from "@/hooks/use-hotkey"
import { useNotImplementedToast } from "@/hooks/use-toast"
import { fuzzyMatch } from "@/components/ViewPackagePage/utils/fuzz-search"
import { useImportComponentDialog } from "@/components/dialogs/import-component-dialog"
import { useJlcpcbComponentImport } from "@/hooks/use-jlcpcb-component-import"
import { Command } from "cmdk"
import { Package, Account } from "fake-snippets-api/lib/db/schema"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "react-query"
import {
  Search,
  Package2,
  CircuitBoard,
  Download,
  Sparkles,
  Clock,
  ArrowRight,
  Star,
  User,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CircuitJsonImportDialog } from "./CircuitJsonImportDialog"
import { JlcpcbComponentTsxLoadedPayload } from "@tscircuit/runframe/runner"

type SnippetType = "board" | "package" | "model" | "footprint"

interface Template {
  name: string
  type: SnippetType
  disabled?: boolean
  icon?: React.ReactNode
}

interface ImportOption {
  name: string
  type: SnippetType
  special?: boolean
  icon?: React.ReactNode
}

interface ScoredPackage extends Package {
  score: number
  matches: number[]
}

interface ScoredAccount extends Account {
  score: number
  matches: number[]
}

const CmdKMenu = () => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCircuitJsonImportDialogOpen, setIsCircuitJsonImportDialogOpen] =
    useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const toastNotImplemented = useNotImplementedToast()
  const axios = useAxios()
  const { Dialog: ImportComponentDialog, openDialog: openImportDialog } =
    useImportComponentDialog()
  const { importComponent: importJlcpcbComponent } = useJlcpcbComponentImport()
  const session = useGlobalStore((s) => s.session)
  const currentUser = session?.github_username
  const jlcpcbProxyRequestHeaders = useMemo(
    () =>
      session?.token
        ? {
            Authorization: `Bearer ${session.token}`,
          }
        : undefined,
    [session?.token],
  )
  const handleJlcpcbComponentSelected = useCallback(
    async (payload: JlcpcbComponentTsxLoadedPayload) => {
      await importJlcpcbComponent(payload)
    },
    [importJlcpcbComponent],
  )
  const selectedItemRef = useRef<HTMLDivElement>(null)

  const blankTemplates = useMemo(
    (): Template[] => [
      {
        name: "Blank Circuit Board",
        type: "board",
        icon: <CircuitBoard className="w-4 h-4 text-green-500" />,
      },
      {
        name: "Blank Circuit Module",
        type: "package",
        icon: <Package2 className="w-4 h-4 text-blue-500" />,
      },
    ],
    [],
  )

  const templates = useMemo(
    (): Template[] => [
      {
        name: "Blinking LED Board",
        type: "board",
        icon: <Sparkles className="w-4 h-4 text-yellow-500" />,
      },
      {
        name: "USB-C LED Flashlight",
        type: "board",
        icon: <Sparkles className="w-4 h-4 text-yellow-500" />,
      },
    ],
    [],
  )

  const importOptions = useMemo(
    (): ImportOption[] => [
      {
        name: "Circuit JSON",
        type: "package",
        special: true,
        icon: <Download className="w-4 h-4 text-red-500" />,
      },
      {
        name: "JLCPCB Component",
        type: "package",
        special: true,
        icon: <Download className="w-4 h-4 text-red-500" />,
      },
    ],
    [],
  )

  const { data: allPackages = [], isLoading: isSearching } = useQuery(
    ["packageSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      try {
        const { data } = await axios.post("/packages/search", {
          query: searchQuery,
        })
        return data.packages || []
      } catch (error) {
        console.warn("Failed to fetch packages:", error)
        return []
      }
    },
    {
      enabled: Boolean(searchQuery),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )

  const { data: allAccounts = [], isLoading: isSearchingAccounts } = useQuery(
    ["accountSearch", searchQuery],
    async () => {
      if (!searchQuery) return []
      try {
        const { data } = await axios.post("/accounts/search", {
          query: searchQuery,
          limit: 5,
        })
        return data.accounts || []
      } catch (error) {
        console.warn("Failed to fetch accounts:", error)
        return []
      }
    },
    {
      enabled: Boolean(searchQuery) && Boolean(currentUser),
      retry: false,
      refetchOnWindowFocus: false,
    },
  )

  const searchResults = useMemo((): ScoredPackage[] => {
    if (!searchQuery || !allPackages.length) return []

    return allPackages
      .map((pkg: Package) => {
        const { score, matches } = fuzzyMatch(searchQuery, pkg.name)
        return { ...pkg, score, matches }
      })
      .filter((pkg: ScoredPackage) => pkg.score >= 0)
      .sort((a: ScoredPackage, b: ScoredPackage) => b.score - a.score)
      .slice(0, 6)
  }, [allPackages, searchQuery])

  const accountSearchResults = useMemo((): ScoredAccount[] => {
    if (!searchQuery || !allAccounts.length) return []

    return allAccounts
      .map((account: Account) => {
        const { score, matches } = fuzzyMatch(
          searchQuery,
          account.github_username,
        )
        return { ...account, score, matches }
      })
      .filter((account: ScoredAccount) => account.score >= 0)
      .sort((a: ScoredAccount, b: ScoredAccount) => b.score - a.score)
      .slice(0, 5)
  }, [allAccounts, searchQuery])

  const { data: recentPackages = [] } = useQuery<Package[]>(
    ["userPackages", currentUser],
    async () => {
      if (!currentUser) return []
      try {
        const response = await axios.post(`/packages/list`, {
          owner_github_username: currentUser,
        })
        return response.data.packages || []
      } catch (error) {
        console.warn("Failed to fetch recent packages:", error)
        return []
      }
    },
    {
      enabled: !!currentUser && !searchQuery,
      retry: false,
      refetchOnWindowFocus: false,
    },
  )

  const filteredStaticOptions = useMemo(() => {
    if (!searchQuery) {
      return {
        blankTemplates: blankTemplates,
        templates: templates,
        importOptions: importOptions,
      }
    }

    const searchBlankTemplates = blankTemplates
      .map((template) => {
        const { score, matches } = fuzzyMatch(searchQuery, template.name)
        return { ...template, score, matches }
      })
      .filter((template) => template.score >= 0)
      .sort((a, b) => b.score - a.score)

    const searchTemplates = templates
      .map((template) => {
        const { score, matches } = fuzzyMatch(searchQuery, template.name)
        return { ...template, score, matches }
      })
      .filter((template) => template.score >= 0)
      .sort((a, b) => b.score - a.score)

    const searchImportOptions = importOptions
      .map((option) => {
        const { score, matches } = fuzzyMatch(
          searchQuery,
          `Import ${option.name}`,
        )
        return { ...option, score, matches }
      })
      .filter((option) => option.score >= 0)
      .sort((a, b) => b.score - a.score)

    return {
      blankTemplates: searchBlankTemplates,
      templates: searchTemplates,
      importOptions: searchImportOptions,
    }
  }, [searchQuery, blankTemplates, templates, importOptions])

  const allItems = useMemo(() => {
    const items: Array<{
      type: "package" | "account" | "recent" | "template" | "blank" | "import"
      item: any
      disabled?: boolean
    }> = []

    if (searchQuery && searchResults.length > 0) {
      searchResults.forEach((pkg) => {
        items.push({ type: "package", item: pkg })
      })
    }

    if (searchQuery && accountSearchResults.length > 0) {
      accountSearchResults.forEach((account) => {
        items.push({ type: "account", item: account })
      })
    }

    if (!searchQuery && recentPackages.length > 0) {
      recentPackages.slice(0, 6).forEach((pkg) => {
        items.push({ type: "recent", item: pkg })
      })
    }

    filteredStaticOptions.blankTemplates.forEach((template) => {
      items.push({ type: "blank", item: template, disabled: template.disabled })
    })

    filteredStaticOptions.templates.forEach((template) => {
      items.push({ type: "template", item: template })
    })

    filteredStaticOptions.importOptions.forEach((option) => {
      items.push({ type: "import", item: option })
    })

    return items
  }, [
    searchQuery,
    searchResults,
    accountSearchResults,
    recentPackages,
    filteredStaticOptions,
  ])

  useHotkeyCombo("cmd+k", () => {
    setOpen((prev) => !prev)
  })

  useEffect(() => {
    setSelectedIndex(0)
  }, [allItems.length])

  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex((prev) => {
          const next = Math.min(prev + 1, allItems.length - 1)
          return next
        })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        e.stopPropagation()
        setSelectedIndex((prev) => {
          const next = Math.max(prev - 1, 0)
          return next
        })
      } else if (e.key === "Enter") {
        e.preventDefault()
        e.stopPropagation()
        if (allItems[selectedIndex] && !allItems[selectedIndex].disabled) {
          handleItemSelect(allItems[selectedIndex])
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        setOpen(false)
      }
    },
    [selectedIndex, allItems.length],
  )

  const handleItemSelect = useCallback(
    (selectedItem: any) => {
      const { type, item } = selectedItem

      switch (type) {
        case "package":
        case "recent":
          window.location.href = `/${item.owner_github_username}/${item.unscoped_name}`
          setOpen(false)
          break
        case "account":
          window.location.href = `/${item.github_username}`
          setOpen(false)
          break
        case "blank":
        case "template":
          if (!item.disabled) {
            window.location.href = `/editor?template=${item.name.toLowerCase().replace(/ /g, "-")}`
            setOpen(false)
          }
          break
        case "import":
          if (item.special) {
            switch (item.name) {
              case "Circuit JSON":
                setOpen(false)
                setIsCircuitJsonImportDialogOpen(true)
                break
              case "JLCPCB Component":
                setOpen(false)
                openImportDialog()
                break
            }
          } else {
            setOpen(false)
            toastNotImplemented(`${item.name} Import`)
          }
          break
      }
    },
    [toastNotImplemented],
  )

  const renderHighlighted = useCallback(
    (item: any, text: string) => {
      if (!searchQuery || !item.matches) return text

      const chars = text.split("")
      return chars.map((char, i) => (
        <span key={i} className={item.matches.includes(i) ? "bg-blue-200" : ""}>
          {char}
        </span>
      ))
    },
    [searchQuery],
  )

  const renderItem = useCallback(
    (item: any, index: number) => {
      const { type, item: data, disabled } = item
      const isSelected = index === selectedIndex

      const baseClasses = `
      group flex items-center justify-between px-2 sm:px-3 py-2 rounded-md cursor-pointer
      transition-all duration-150 border border-transparent text-sm w-full
      ${isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `

      switch (type) {
        case "package":
        case "recent":
          return (
            <div
              key={`${type}-${data.package_id}`}
              ref={isSelected ? selectedItemRef : null}
              className={baseClasses}
              onClick={() => !disabled && handleItemSelect(item)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <Package2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                  <span className="font-medium text-gray-900 truncate max-w-full">
                    {type === "package"
                      ? renderHighlighted(data, data.name)
                      : data.name}
                  </span>
                  {data.description && (
                    <span className="text-xs text-gray-500 truncate max-w-full">
                      {data.description}
                    </span>
                  )}
                  {type === "recent" && (
                    <span className="text-xs text-gray-400 hidden sm:block truncate">
                      {new Date(data.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 text-gray-500">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{data.star_count ?? 0}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline">
                  package
                </span>
                {isSelected && <ArrowRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>
          )

        case "account":
          return (
            <div
              key={`account-${data.account_id}`}
              ref={isSelected ? selectedItemRef : null}
              className={baseClasses}
              onClick={() => !disabled && handleItemSelect(item)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {data.github_username ? (
                  <>
                    <img
                      src={`https://github.com/${data.github_username}.png`}
                      alt={`${data.github_username} avatar`}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        target.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                    <User className="w-6 h-6 text-gray-400 flex-shrink-0 hidden" />
                  </>
                ) : (
                  <User className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-gray-900 truncate">
                    {renderHighlighted(data, data.github_username)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline">
                  user
                </span>
                {isSelected && <ArrowRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>
          )

        case "blank":
        case "template":
          return (
            <div
              key={`${type}-${data.name}`}
              ref={isSelected ? selectedItemRef : null}
              className={baseClasses}
              onClick={() => !disabled && handleItemSelect(item)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {data.icon}
                <span className="font-medium text-gray-900 truncate">
                  {renderHighlighted(data, data.name)}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline">
                  {data.type}
                </span>
                {isSelected && <ArrowRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>
          )

        case "import":
          return (
            <div
              key={`import-${data.name}`}
              ref={isSelected ? selectedItemRef : null}
              className={baseClasses}
              onClick={() => handleItemSelect(item)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {data.icon}
                <span className="font-medium text-gray-900 truncate">
                  Import {renderHighlighted(data, data.name)}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline">
                  {data.type}
                </span>
                {isSelected && <ArrowRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>
          )

        default:
          return null
      }
    },
    [selectedIndex, handleItemSelect, renderHighlighted],
  )

  if (!open)
    return (
      <>
        <ImportComponentDialog
          onJlcpcbComponentTsxLoaded={handleJlcpcbComponentSelected}
          jlcpcbProxyRequestHeaders={jlcpcbProxyRequestHeaders}
        />
        <CircuitJsonImportDialog
          open={isCircuitJsonImportDialogOpen}
          onOpenChange={setIsCircuitJsonImportDialogOpen}
        />
      </>
    )

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl lg:max-w-2xl w-[95vw] bg-white rounded-lg shadow-xl border border-gray-200 p-0 top-[10vh] translate-y-0">
          <DialogTitle className="sr-only">Command Menu</DialogTitle>
          <DialogDescription className="sr-only">
            Use this menu to search packages and commands.
          </DialogDescription>
          <Command
            className="w-full overflow-hidden"
            loop={false}
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center border-b border-gray-200 px-3 sm:px-4 py-3">
              <Search className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <Command.Input
                placeholder="Search packages and commands..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-500"
              />
            </div>

            <Command.List className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto p-2 sm:p-3 space-y-3 no-scrollbar">
              {isSearching || isSearchingAccounts ? (
                <Command.Loading className="p-6 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    Loading...
                  </div>
                </Command.Loading>
              ) : (
                <>
                  {searchQuery && searchResults.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Packages
                      </h3>
                      <div className="space-y-1">
                        {searchResults.slice(0, 8).map((pkg, localIndex) => {
                          const globalIndex = localIndex
                          return renderItem(
                            { type: "package", item: pkg },
                            globalIndex,
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {searchQuery && accountSearchResults.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Users
                      </h3>
                      <div className="space-y-1">
                        {accountSearchResults
                          .slice(0, 5)
                          .map((account, localIndex) => {
                            const globalIndex =
                              searchResults.length + localIndex
                            return renderItem(
                              { type: "account", item: account },
                              globalIndex,
                            )
                          })}
                      </div>
                    </div>
                  )}

                  {!searchQuery && recentPackages.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Recent
                      </h3>
                      <div className="space-y-1">
                        {recentPackages.slice(0, 6).map((pkg, localIndex) => {
                          const globalIndex = localIndex
                          return renderItem(
                            { type: "recent", item: pkg },
                            globalIndex,
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {filteredStaticOptions.blankTemplates.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Create
                      </h3>
                      <div className="space-y-1">
                        {filteredStaticOptions.blankTemplates.map(
                          (template, localIndex) => {
                            const globalIndex =
                              (searchQuery
                                ? searchResults.length +
                                  accountSearchResults.length
                                : recentPackages.length) + localIndex
                            return renderItem(
                              {
                                type: "blank",
                                item: template,
                                disabled: template.disabled,
                              },
                              globalIndex,
                            )
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {filteredStaticOptions.templates.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Templates
                      </h3>
                      <div className="space-y-1">
                        {filteredStaticOptions.templates.map(
                          (template, localIndex) => {
                            const globalIndex =
                              (searchQuery
                                ? searchResults.length +
                                  accountSearchResults.length
                                : recentPackages.length) +
                              filteredStaticOptions.blankTemplates.length +
                              localIndex
                            return renderItem(
                              { type: "template", item: template },
                              globalIndex,
                            )
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {filteredStaticOptions.importOptions.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Import
                      </h3>
                      <div className="space-y-1">
                        {filteredStaticOptions.importOptions.map(
                          (option, localIndex) => {
                            const globalIndex =
                              (searchQuery
                                ? searchResults.length +
                                  accountSearchResults.length
                                : recentPackages.length) +
                              filteredStaticOptions.blankTemplates.length +
                              filteredStaticOptions.templates.length +
                              localIndex
                            return renderItem(
                              { type: "import", item: option },
                              globalIndex,
                            )
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {searchQuery &&
                    !searchResults.length &&
                    !accountSearchResults.length &&
                    !filteredStaticOptions.blankTemplates.length &&
                    !filteredStaticOptions.templates.length &&
                    !filteredStaticOptions.importOptions.length &&
                    !isSearching &&
                    !isSearchingAccounts && (
                      <Command.Empty className="py-8 text-center">
                        <div className="text-gray-400 mb-1">
                          No results found
                        </div>
                        <div className="text-gray-500 text-xs">
                          Try different search terms
                        </div>
                      </Command.Empty>
                    )}
                </>
              )}
            </Command.List>

            <div className="border-t border-gray-200 px-2 py-2 bg-gray-50/50 rounded-b-lg">
              <div className="flex justify-between items-center text-[11px] sm:text-xs text-gray-500">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 font-mono bg-white border border-gray-200 shadow-sm rounded text-[10px] sm:text-xs">
                      ↑↓
                    </kbd>
                    <span className="hidden sm:inline">navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 font-mono bg-white border border-gray-200 shadow-sm rounded text-[10px] sm:text-xs">
                      ↵
                    </kbd>
                    <span className="hidden sm:inline">select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 font-mono bg-white border border-gray-200 shadow-sm rounded text-[10px] sm:text-xs">
                    ⌘K
                  </kbd>
                  <span className="hidden sm:inline">close</span>
                </div>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>

      <ImportComponentDialog
        onJlcpcbComponentTsxLoaded={handleJlcpcbComponentSelected}
        jlcpcbProxyRequestHeaders={jlcpcbProxyRequestHeaders}
      />
    </>
  )
}

export default CmdKMenu
