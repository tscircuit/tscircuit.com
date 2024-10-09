import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download, ChevronDown } from "lucide-react"
import { useDownloadCurrentSnippetCircuitJson } from "@/hooks/use-download-json"
import { createBlobURL } from "@/lib/createBlobURL"

export function DownloadButtonAndMenu({ className }: { className?: string }) {
  const { jsonContent, jsonFileName } = useDownloadCurrentSnippetCircuitJson()

  const downloadJson = createBlobURL(jsonContent)

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="sm" className="px-2 text-xs">
            <Download className="mr-1 h-3 w-3" />
            Download
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="text-xs">
            <a
              href={downloadJson}
              download={jsonFileName}
              target="_blank"
              className="flex items-center w-full"
            >
              <Download className="mr-1 h-3 w-3" />
              <span className="flex-grow mr-6">Download Circuit JSON</span>
              <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
                json
              </span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow  mr-6">Download 3D Model</span>
            <span className="text-[0.6rem] bg-green-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              stl
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow  mr-6">Fabrication Files</span>
            <span className="text-[0.6rem] bg-purple-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              gerber/pnp/bom/csv
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download Footprint</span>
            <span className="text-[0.6rem] bg-orange-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              kicad_mod
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs">
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download KiCad Zip</span>
            <span className="text-[0.6rem] bg-orange-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              kicad_*
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
