import { JLCPCBImportDialog } from "@/components/JLCPCBImportDialog"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useHotkeyCombo } from "@/hooks/use-hotkey"
import { useNotImplementedToast } from "@/hooks/use-toast"
import { fuzzyMatch } from "@/components/ViewPackagePage/utils/fuzz-search"
import { Command } from "cmdk"
import { Package } from "fake-snippets-api/lib/db/schema"
import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { useQuery } from "react-query"
import {
  Search,
  Package2,
  CircuitBoard,
  Download,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

const CmdKMenu = () => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isJLCPCBDialogOpen, setIsJLCPCBDialogOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const toastNotImplemented = useNotImplementedToast()
  const axios = useAxios()
  const currentUser = useGlobalStore((s) => s.session?.github_username)
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
        name: "KiCad Footprint",
        type: "footprint",
        icon: <Download className="w-4 h-4 text-gray-500" />,
      },
      {
        name: "KiCad Project",
        type: "board",
        icon: <Download className="w-4 h-4 text-gray-500" />,
      },
      {
        name: "KiCad Module",
        type: "package",
        icon: <Download className="w-4 h-4 text-gray-500" />,
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
      const { data } = await axios.post("/packages/search", {
        query: searchQuery,
      })
      return data.packages || []
    },
    {
      enabled: Boolean(searchQuery),
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
      .slice(0, 8)
  }, [allPackages, searchQuery])

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
        const { score, matches } = fuzzyMatch(searchQuery, option.name)
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
      type: "package" | "recent" | "template" | "blank" | "import"
      item: any
      disabled?: boolean
    }> = []

    if (searchQuery && searchResults.length > 0) {
      searchResults.forEach((pkg) => {
        items.push({ type: "package", item: pkg })
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
  }, [searchQuery, searchResults, recentPackages, filteredStaticOptions])

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
          window.location.href = `/editor?package_id=${item.package_id}`
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
            setOpen(false)
            setIsJLCPCBDialogOpen(true)
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
      group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer
      transition-all duration-150 border border-transparent text-sm
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
              <div className="flex items-center gap-2 min-w-0">
                <Package2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-gray-900 truncate">
                    {type === "package"
                      ? renderHighlighted(data, data.name)
                      : data.name}
                  </span>
                  {data.description && (
                    <span className="text-xs text-gray-500 truncate">
                      {data.description}
                    </span>
                  )}
                  {type === "recent" && (
                    <span className="text-xs text-gray-400">
                      {new Date(data.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  package
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
              <div className="flex items-center gap-2">
                {data.icon}
                <span className="font-medium text-gray-900">
                  {renderHighlighted(data, data.name)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
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
              <div className="flex items-center gap-2">
                {data.icon}
                <span className="font-medium text-gray-900">
                  Import {renderHighlighted(data, data.name)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
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
      <JLCPCBImportDialog
        open={isJLCPCBDialogOpen}
        onOpenChange={setIsJLCPCBDialogOpen}
      />
    )

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={() => setOpen(false)}
      />

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command Menu"
        className="fixed top-16 left-1/2 -translate-x-1/2 max-w-2xl w-[90vw] bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        loop={false}
        onKeyDown={handleKeyDown}
        aria-describedby="dialog-description"
      >
        <DialogTitle className="sr-only">Command Menu</DialogTitle>
        <DialogDescription id="dialog-description" className="sr-only">
          Use this menu to search packages and commands.
        </DialogDescription>
        <div className="flex items-center border-b border-gray-200 px-4 py-3">
          <Search className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          <Command.Input
            placeholder="Search packages and commands..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
          />
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2 space-y-4">
          {isSearching ? (
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
                    Search Results
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
                            ? searchResults.length
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
                            ? searchResults.length
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
                            ? searchResults.length
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
                !filteredStaticOptions.blankTemplates.length &&
                !filteredStaticOptions.templates.length &&
                !filteredStaticOptions.importOptions.length &&
                !isSearching && (
                  <Command.Empty className="py-8 text-center">
                    <div className="text-gray-400 mb-1">No results found</div>
                    <div className="text-gray-500 text-xs">
                      Try different search terms
                    </div>
                  </Command.Empty>
                )}
            </>
          )}
        </Command.List>

        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50/50 rounded-b-lg">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-white border border-gray-300 rounded text-xs">
                  ↑↓
                </kbd>
                <span>navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-white border border-gray-300 rounded text-xs">
                  ↵
                </kbd>
                <span>select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-white border border-gray-300 rounded text-xs">
                ⌘K
              </kbd>
              <span>close</span>
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
