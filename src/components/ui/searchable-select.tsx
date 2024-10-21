import React, { useState, useRef, useEffect } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { ScrollArea } from "./scroll-area"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const getScrollAreaHeight = () => {
    const maxHeight = 288 // 72px * 4 options
    const optionHeight = 36 // Approximate height of each option
    const calculatedHeight = filteredOptions.length * optionHeight
    return Math.min(calculatedHeight, maxHeight)
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "" : "text-slate-500 font-normal"}>
          {value || placeholder}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {isOpen && (
        <div className="absolute mt-2 w-full z-10 bg-white rounded-md shadow-lg">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <ScrollArea style={{ height: `${getScrollAreaHeight()}px` }}>
            {filteredOptions.map((option) => (
              <Button
                key={option}
                variant="ghost"
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                  setSearch("")
                }}
                className={cn(
                  "w-full justify-start",
                  value === option && "bg-slate-100",
                )}
              >
                {option}
                {value === option && <Check className="ml-auto h-4 w-4" />}
              </Button>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
