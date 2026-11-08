import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { normalizePreviewPath } from "@/lib/preview-circuit-files"
import { useCurrentPackageCircuitJson } from "../hooks/use-current-package-circuit-json"

export default function PreviewFileSelector() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { previewFiles, previewFilePath } = useCurrentPackageCircuitJson()

  if (previewFiles.length < 2) return null

  const selectFile = (path?: string) => {
    const url = new URL(window.location.href)
    if (path) url.searchParams.set("preview_file", path)
    else url.searchParams.delete("preview_file")
    window.history.pushState({}, "", url)
    window.dispatchEvent(new Event("popstate"))
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          size="sm"
          role="combobox"
          aria-label="Preview file"
          aria-expanded={open}
          className="bg-white shadow-none text-gray-900 hover:bg-gray-100 border border-gray-300 px-1 pl-2 select-none"
        >
          {previewFiles.length} Builds
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <Command>
          <CommandInput
            placeholder="Find a preview file…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No matching preview files.</CommandEmpty>
            <CommandGroup heading="Preview files">
              <CommandItem
                value="Package default"
                onSelect={() => selectFile()}
              >
                Package default
              </CommandItem>
              {previewFiles.map((file) => {
                const path = normalizePreviewPath(file.file_path)
                return (
                  <CommandItem
                    key={file.package_file_id}
                    value={path}
                    onSelect={() => selectFile(path)}
                    className="gap-2"
                  >
                    <span className="break-all text-xs font-mono flex-1">
                      {path.replace(/^dist\//, "")}
                    </span>
                    {previewFilePath === path && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
