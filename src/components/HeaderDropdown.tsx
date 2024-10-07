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
  const [isHovered, setIsHovered] = useState(false)
  const [, navigate] = useLocation() // useLocation to navigate on button click
  const blankTemplates = [
    { name: "Blank Circuit Board", type: "board", badgeColor: "bg-blue-500" },
    {
      name: "Blank Circuit Module",
      type: "package",
      badgeColor: "bg-green-500",
    },
    { name: "Blank 3D Model", type: "model", badgeColor: "bg-purple-500 " },
    { name: "Blank Footprint", type: "footprint", badgeColor: "bg-pink-500 " },
  ]

  return (
    <DropdownMenu open={isHovered}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
          onMouseEnter={() => setIsHovered(true)} // Show dropdown on hover
          onMouseLeave={() => setIsHovered(false)} // Hide dropdown when not hovering
          onClick={() => navigate("/quickstart")} // Navigate on click
        >
          New <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-fit"
        onMouseEnter={() => setIsHovered(true)} // Keep dropdown open when hovering over content
        onMouseLeave={() => setIsHovered(false)} // Hide dropdown when not hovering
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
