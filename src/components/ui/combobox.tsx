import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover"

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(0)
  const filteredOptions = React.useMemo(
    () =>
      options.filter((option) =>
        option.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [options, searchValue],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Tab":
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev,
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case "Enter":
        e.preventDefault()
        if (filteredOptions.length > 0) {
          const selectedOption = filteredOptions[highlightedIndex]
          onChange(selectedOption)
          setSearchValue("")
          setOpen(false)
          setHighlightedIndex(0)
        }
        break
      case "Escape":
        setOpen(false)
        setHighlightedIndex(0)
        break
    }
  }

  // Reset highlighted index when filtered options change
  React.useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredOptions.length])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0 z-[100]">
        <Command onKeyDown={handleKeyDown} shouldFilter={false}>
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder={searchPlaceholder}
          />
          <CommandEmpty
            className="text-sm text-slate-500                      
 py-6"
          >
            {emptyText}
          </CommandEmpty>
          <CommandGroup
            className="max-h-[400px] overflow-y-auto overscroll-contain scroll-smooth"
            onWheel={(e) => {
              e.stopPropagation()
              const target = e.currentTarget
              target.scrollTop += e.deltaY
            }}
            ref={(ref) => {
              if (ref && filteredOptions.length > 0) {
                const items = ref.getElementsByClassName("cmd-item")
                const highlighted = items[highlightedIndex] as HTMLElement
                if (highlighted) {
                  highlighted.scrollIntoView({
                    block: "nearest",
                    behavior: "instant",
                  })
                }
              }
            }}
          >
            {filteredOptions.map((option, index) => (
              <CommandItem
                key={option}
                onSelect={(currentValue) => {
                  onChange(currentValue)
                  setSearchValue("")
                  setOpen(false)
                  setHighlightedIndex(0)
                }}
                className={cn(
                  "cmd-item cursor-pointer transition-all ease-in-out",
                  index === highlightedIndex
                    ? "bg-indigo-500 text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 transition-opacity",
                    value === option ? "opacity-100" : "opacity-0",
                    index === highlightedIndex
                      ? "text-white"
                      : "text-indigo-500",
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
