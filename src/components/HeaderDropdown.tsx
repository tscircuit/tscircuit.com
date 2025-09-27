import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDown, FileUp, Upload, Zap } from "lucide-react"
import { Link } from "wouter"

export default function HeaderDropdown() {
  const blankTemplates = [
    { name: "Blank Circuit Board", type: "board", badgeColor: "bg-blue-500" },
    {
      name: "Blank Circuit Module",
      type: "package",
      badgeColor: "bg-green-500",
    },
    {
      name: "Blank 3D Model",
      type: "model",
      badgeColor: "bg-purple-500 ",
      disabled: true,
    },
    {
      name: "Blank Footprint",
      type: "footprint",
      badgeColor: "bg-pink-500 ",
      disabled: true,
    },
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
        <DropdownMenuItem asChild>
          <Link href="/quickstart" className="flex items-center cursor-pointer">
            <Zap className="mr-2 h-3 w-3" />
            Quickstart Templates
          </Link>
        </DropdownMenuItem>
        {blankTemplates.map((template, index) => (
          <DropdownMenuItem key={index} asChild disabled={template.disabled}>
            <Link
              href={`/editor?template=${template.name.toLowerCase().replace(/ /g, "-")}`}
              className={cn(
                "flex items-center cursor-pointer",
                template.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${template.badgeColor}`}
              />
              {template.name}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link href="/quickstart" className="flex items-center cursor-pointer">
            <Upload className="mr-2 h-3 w-3" />
            Import Part
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
