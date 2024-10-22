import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

interface SearchableSelectProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resourceType?: "state" | "country"
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  resourceType,
}) => {
  const [open, setOpen] = React.useState(false)

  const getPlaceholder = () => {
    if (resourceType === "state") return "Select a state..."
    if (resourceType === "country") return "Select a country..."
    return "Select an option..."
  }
  const placeholder = getPlaceholder()

  const getEmptyMessage = () => {
    if (resourceType === "state") return "No state found."
    if (resourceType === "country") return "No country found."
    return "No option found."
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? (options.find((option) => option.value === value)?.label ??
              placeholder)
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={getPlaceholder()} />
          <CommandList>
            <CommandEmpty>{getEmptyMessage()}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
