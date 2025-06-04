import { ChevronDown, Download, Github, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useParams } from "wouter"

export function DeploymentHeader() {
  const { author, packageName } = useParams()

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between container mx-auto">
        <h1 className="text-2xl font-semibold">
          Package Build
          <a
            className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono text-blue-600"
            href={`/${author}/${packageName}`}
          >
            {author}/{packageName}
          </a>
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white hover:bg-gray-50 text-xs sm:text-sm"
            asChild
          >
            <a
              href="https://github.com/tscircuit/tscircuit.com/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Report Issue
            </a>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border-gray-200"
            >
              <DropdownMenuItem className="text-gray-900 hover:bg-gray-100">
                Circuit JSON
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-900 hover:bg-gray-100">
                PCB SVG
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-900 hover:bg-gray-100">
                Schematic SVG
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-900 hover:bg-gray-100">
                3D Model (stl)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
