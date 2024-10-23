import { JLCPCBImportDialog } from "@/components/JLCPCBImportDialog";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAxios } from "@/hooks/use-axios";
import { useGlobalStore } from "@/hooks/use-global-store";
import { useNotImplementedToast } from "@/hooks/use-toast";
import { Snippet } from "fake-snippets-api/lib/db/schema";
import React from 'react';
import { useQuery } from "react-query";

type SnippetType =
  | "board"
  | "package"
  | "model"
  | "footprint"
  | "snippet"
  | "search-result"

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

interface CommandItemData {
  label: string
  href?: string
  type: SnippetType
  disabled?: boolean
  action?: () => void
  subtitle?: string
  description?: string
}

interface CommandGroup {
  group: string
  items: CommandItemData[]
}

// Debounce helper function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const CmdKMenu: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300) // 300ms debounce
  const [isJLCPCBDialogOpen, setIsJLCPCBDialogOpen] = React.useState(false)
  const toastNotImplemented = useNotImplementedToast()
  const axios = useAxios()
  const currentUser = useGlobalStore((s) => s.session?.github_username)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const { data: recentSnippets } = useQuery<Snippet[]>(
    ["userSnippets", currentUser],
    async () => {
      if (!currentUser) return []
      const response = await axios.get<{ snippets: Snippet[] }>(
        `/snippets/list?owner_name=${currentUser}`,
      )
      return response.data.snippets
    },
    {
      enabled: !!currentUser,
    },
  )

  const { data: searchResults, isLoading: isSearching } = useQuery(
    ["snippetSearch", debouncedSearchQuery], // Use debounced query
    async () => {
      if (!debouncedSearchQuery) return []
      const { data } = await axios.get("/snippets/search", {
        params: { q: debouncedSearchQuery },
      })
      return data.snippets
    },
    {
      enabled: Boolean(debouncedSearchQuery),
      keepPreviousData: true, 
      staleTime: 30000, // Cache results for 30 seconds
      retry: false, 
    },
  )

  // Templates and import options
  const blankTemplates: Template[] = [
    { name: "Blank Circuit Board", type: "board" },
    { name: "Blank Circuit Module", type: "package" },
    { name: "Blank 3D Model", type: "model", disabled: true },
    { name: "Blank Footprint", type: "footprint", disabled: true },
  ]

  const templates: Template[] = [{ name: "Blinking LED Board", type: "board" }]

  const importOptions: ImportOption[] = [
    { name: "KiCad Footprint", type: "footprint" },
    { name: "KiCad Project", type: "board" },
    { name: "KiCad Module", type: "package" },
    { name: "JLCPCB Component", type: "package", special: true },
  ]

  const baseCommands: CommandGroup[] = [
    // Only include Recent Snippets when there's no search query
    ...(!debouncedSearchQuery ? [{  
      group: "Recent Snippets",
      items: (recentSnippets?.slice(0, 6) || []).map((snippet) => ({
        label: snippet.unscoped_name,
        href: `/editor?snippet_id=${snippet.snippet_id}`,
        type: "snippet" as const,
        subtitle: `Last edited: ${new Date(snippet.updated_at).toLocaleDateString()}`,
      })),
    }] : []),
    {
      group: "Start Blank Snippet",
      items: blankTemplates.map((template) => ({
        label: template.name,
        href: template.disabled
          ? undefined
          : `/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`,
        type: template.type,
        disabled: template.disabled,
      })),
    },
    {
      group: "Start from Template",
      items: templates.map((template) => ({
        label: template.name,
        href: `/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`,
        type: template.type,
      })),
    },
    {
      group: "Import",
      items: importOptions.map((option) => ({
        label: `Import ${option.name}`,
        action: option.special
          ? () => {
              setOpen(false)
              setIsJLCPCBDialogOpen(true)
            }
          : () => {
              setOpen(false)
              toastNotImplemented(`${option.name} Import`)
            },
        type: option.type,
      })),
    },
  ]

  const filteredBaseCommands = debouncedSearchQuery  
    ? baseCommands
        .map((group) => ({
          ...group,
          items: group.items.filter((command) =>
            command.label.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
          ),
        }))
        .filter((group) => group.items.length > 0)
    : baseCommands

  // Combine search results with filtered base commands
  const allCommands = [
    ...(isSearching
      ? [
          {
            group: "Search Results",
            items: searchResult.length ? searchResults.map((snippet: any) => ({
              label: snippet.name,
              href: `/editor?snippet_id=${snippet.snippet_id}`,
              type: "search-result" as const,
              subtitle: `By ${snippet.owner_name}`,
              description: snippet.description,
            })) : [{ label: "Searching...", type: "search-result" as const, disabled: true }],
          },
        ]
      : searchResults && searchResults.length > 0
      ? [
          {
            group: "Search Results",
            items: searchResults.map((snippet: any) => ({
              label: snippet.name,
              href: `/editor?snippet_id=${snippet.snippet_id}`,
              type: "search-result" as const,
              subtitle: `By ${snippet.owner_name}`,
              description: snippet.description,
            })),
          },
        ]
      : []),
    ...filteredBaseCommands,
  ]

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search snippets and commands..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {allCommands.length > 0 ? (
            allCommands.map((group, groupIndex) => (
              <CommandGroup key={groupIndex} heading={group.group}>
                {group.items.map((command: CommandItemData, itemIndex: number) => (
                  <CommandItem
                    key={itemIndex}
                    onSelect={() => {
                      if (command.action) {
                        command.action()
                      } else if (command.href && !command.disabled) {
                        window.location.href = command.href
                        setOpen(false)
                      }
                    }}
                    disabled={command.disabled}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span>{command.label}</span>
                      {command.subtitle && (
                        <span className="text-sm text-gray-500">
                          {command.subtitle}
                        </span>
                      )}
                      {command.description && (
                        <span className="text-sm text-gray-500">
                          {command.description}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      {command.type}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>

      <JLCPCBImportDialog
        open={isJLCPCBDialogOpen}
        onOpenChange={setIsJLCPCBDialogOpen}
      />
    </>
  )
}

export default CmdKMenu