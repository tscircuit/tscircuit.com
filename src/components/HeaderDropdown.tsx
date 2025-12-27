import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Upload, Zap } from "lucide-react"
import { Link } from "wouter"
import { templateCatalogue } from "@/lib/get-snippet-template"

export default function HeaderDropdown() {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          New <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-fit"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuItem asChild>
          <Link
            href="/quickstart"
            className="flex items-center cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <Zap className="mr-2 h-3 w-3" />
            Quickstart Templates
          </Link>
        </DropdownMenuItem>
        {templateCatalogue.map((template) => (
          <DropdownMenuItem key={template.templateKey} asChild>
            <a
              href={`/editor?template=${template.templateKey}`}
              className="flex items-center cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${template.badgeColor}`}
              />
              {template.name}
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link
            href="/quickstart"
            className="flex items-center cursor-pointer"
            onClick={() => setOpen(false)}
          >
            <Upload className="mr-2 h-3 w-3" />
            Import Part
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
