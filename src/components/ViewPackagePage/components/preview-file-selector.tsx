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
import { usePackagePreviewScope } from "@/components/PackagePreviewScope"

const configurationLabel = (path?: string) => {
  if (!path) return "Default"
  const label = path
    .replace(/^dist\//, "")
    .replace(/\/circuit\.json(?:\.gz)?$/, "")
    .replace(/^index(?:\/|$)/, "")
  if (!label) return "Default"
  const words = label.replace(/[_/-]+/g, " ")
  return words[0].toUpperCase() + words.slice(1).replace(/\bled\b/g, "LED")
}

export default function PreviewFileSelector({
  label,
}: { label?: string } = {}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { previewFiles, previewFilePath } = useCurrentPackageCircuitJson()
  const scope = usePackagePreviewScope()

  if (previewFiles.length < 2) return null

  const selectFile = (path: string) => {
    if (scope) {
      scope.selectFile(path)
      setOpen(false)
      setSearch("")
      return
    }
    const url = new URL(window.location.href)
    url.searchParams.set("preview_file", path)
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
          aria-label={label ?? "Preview file"}
          aria-expanded={open}
          className="bg-white shadow-none text-gray-900 hover:bg-gray-100 border border-gray-300 px-1 pl-2 select-none"
        >
          {label
            ? configurationLabel(previewFilePath)
            : `${previewFiles.length} Builds`}
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
            <CommandGroup>
              {previewFiles.map((file) => {
                const path = normalizePreviewPath(file.file_path)
                return (
                  <CommandItem
                    key={file.package_file_id}
                    value={path}
                    onSelect={() => selectFile(path)}
                    className="cursor-pointer gap-2 hover:bg-gray-100 data-[selected=true]:bg-gray-100 dark:hover:bg-gray-800 dark:data-[selected=true]:bg-gray-800"
                  >
                    <span className="break-all text-xs font-mono flex-1">
                      {label
                        ? configurationLabel(path)
                        : path.replace(/^dist\//, "")}
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
