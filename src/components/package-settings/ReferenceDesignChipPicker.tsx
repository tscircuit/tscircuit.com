import { useState } from "react"
import { useQuery } from "react-query"
import { ChevronsUpDown, X } from "lucide-react"
import { useAxios } from "@/hooks/use-axios"
import { useDebounce } from "@/hooks/use-debounce"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ReferenceDesignChipPicker({
  value,
  onChange,
  disabled,
}: {
  value: string[]
  onChange: (chips: string[]) => void
  disabled: boolean
}) {
  const axios = useAxios()
  const apiBaseUrl = useApiBaseUrl()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const query = search.trim()
  const debouncedQuery = useDebounce(query, 250)
  const { data, isFetching, isError } = useQuery(
    ["referenceDesignChipSearch", apiBaseUrl, debouncedQuery],
    async () => {
      const { data } = await axios.get<{ datasheets: { chip_name: string }[] }>(
        "/datasheets/list",
        { params: { chip_name: debouncedQuery, limit: 30 } },
      )
      return data.datasheets
    },
    { enabled: open && /[a-z0-9]/i.test(debouncedQuery), retry: false },
  )
  const options =
    query === debouncedQuery
      ? (data?.filter(({ chip_name }) => !value.includes(chip_name)) ?? [])
      : []
  const searchStatus = !/[a-z0-9]/i.test(query)
    ? "Enter a chip name or part number."
    : query !== debouncedQuery || isFetching
      ? "Searching datasheets…"
      : isError
        ? "Could not search datasheets."
        : "No matching chips to add."

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Selected chips">
          {value.map((chip) => (
            <li
              key={chip}
              className="inline-flex min-w-0 items-center gap-1 rounded-md border bg-slate-50 px-2 py-0.5 text-sm"
            >
              <span className="break-all">{chip}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-6 shrink-0"
                aria-label={`Remove ${chip}`}
                disabled={disabled}
                onClick={() => onChange(value.filter((name) => name !== chip))}
              >
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal sm:max-w-sm"
            disabled={disabled || value.length >= 50}
          >
            Add chips
            <ChevronsUpDown
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command label="Search chips" shouldFilter={false}>
            <CommandInput
              aria-label="Search chips"
              placeholder="Search by chip name…"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{searchStatus}</CommandEmpty>
              {options.map(({ chip_name }) => (
                <CommandItem
                  key={chip_name}
                  value={chip_name}
                  disabled={value.length >= 50}
                  onSelect={() => {
                    onChange([...value, chip_name].sort())
                    setSearch("")
                  }}
                >
                  {chip_name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length >= 50 && (
        <p className="text-sm text-muted-foreground">
          Up to 50 chips per package.
        </p>
      )}
    </div>
  )
}
