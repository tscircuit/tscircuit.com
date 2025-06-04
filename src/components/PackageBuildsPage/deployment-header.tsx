import { ChevronDown, Download, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link" // Corrected import
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DeploymentHeader() {
  return (
    <div className="border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Package Build
          <code className="ml-2 bg-gray-800 px-2 py-1 rounded font-mono text-blue-500">seveibar/led-matrix</code>
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 bg-gray-800 hover:text-white text-xs sm:text-sm"
            asChild
          >
            <Link
              href="https://github.com/tscircuit/tscircuit.com/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Report Issue
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-white text-black hover:bg-gray-100">
                <Download className="w-4 h-4 mr-2" />
                Download
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
              <DropdownMenuItem className="text-white hover:bg-gray-700">Circuit JSON</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-700">PCB SVG</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-700">Schematic SVG</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-700">3D Model (stl)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
