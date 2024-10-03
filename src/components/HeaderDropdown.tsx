import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export default function HeaderDropdown() {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          New <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit">
        {blankTemplates.map((template, index) => (
          <DropdownMenuItem key={index} asChild>
            <a
              href={`/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`}
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
