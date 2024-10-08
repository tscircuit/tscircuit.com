import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Zap } from "lucide-react"
import { Link, useLocation } from "wouter"
import { useState } from "react"

export default function HeaderDropdown() {
  const [isOpen, setIsOpen] = useState(false) // Control dropdown visibility
  const [, navigate] = useLocation()

  const blankTemplates = [
    { name: "Blank Circuit Board", type: "board", badgeColor: "bg-blue-500" },
    {
      name: "Blank Circuit Module",
      type: "package",
      badgeColor: "bg-green-500",
    },
    { name: "Blank 3D Model", type: "model", badgeColor: "bg-purple-500" },
    { name: "Blank Footprint", type: "footprint", badgeColor: "bg-pink-500" },
  ]

  const handleClickNewButton = () => {
    setIsOpen(false) // Close the dropdown
    navigate("/quickstart") // Navigate to /editor
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
          onMouseEnter={() => setIsOpen(true)} // Show dropdown on hover
          onClick={handleClickNewButton} // Navigate and close dropdown on click
        >
          New <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-fit max-h-96 overflow-auto" // Prevent scroll bar issues
        onMouseEnter={() => setIsOpen(true)} // Keep dropdown open when hovering over content
        onMouseLeave={() => setIsOpen(false)} // Close dropdown when not hovering
      >
        <DropdownMenuItem asChild>
          <Link href="/quickstart" className="flex items-center cursor-pointer">
            <Zap className="mr-2 h-3 w-3" />
            Quickstart Templates
          </Link>
        </DropdownMenuItem>
        {blankTemplates.map((template, index) => (
          <DropdownMenuItem key={index} asChild>
            <a
              href={`/editor?template=${template.name
                .toLowerCase()
                .replace(/ /g, "-")}`}
              className="flex items-center cursor-pointer"
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${template.badgeColor}`}
              />
              {template.name}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
