import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast, useNotImplementedToast } from "@/hooks/use-toast"
import { downloadCircuitJson } from "@/lib/download-fns/download-circuit-json-fn"
import { downloadDsnFile } from "@/lib/download-fns/download-dsn-file-fn"
import { downloadFabricationFiles } from "@/lib/download-fns/download-fabrication-files"
import { downloadSchematicSvg } from "@/lib/download-fns/download-schematic-svg"
import { downloadReadableNetlist } from "@/lib/download-fns/download-readable-netlist"
import { downloadAssemblySvg } from "@/lib/download-fns/download-assembly-svg"
import { AnyCircuitElement } from "circuit-json"
import { ChevronDown, Download } from "lucide-react"
import React from "react"

interface DownloadButtonAndMenuProps {
  className?: string
  snippetUnscopedName: string | undefined
  circuitJson?: AnyCircuitElement[] | null
}

export function DownloadButtonAndMenu({
  className,
  snippetUnscopedName,
  circuitJson,
}: DownloadButtonAndMenuProps) {
  const notImplemented = useNotImplementedToast()

  if (!circuitJson) {
    return (
      <Button disabled variant="ghost" size="sm" className="px-2 text-xs">
        <Download className="mr-1 h-3 w-3" />
        Download
      </Button>
    )
  }

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
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadCircuitJson(
                circuitJson,
                snippetUnscopedName || "circuit" + ".json",
              )
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download Circuit JSON</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              json
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => notImplemented("3d model downloads")}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow  mr-6">Download 3D Model</span>
            <span className="text-[0.6rem] bg-green-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              stl
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={async () => {
              await downloadFabricationFiles({
                circuitJson,
                snippetUnscopedName: snippetUnscopedName || "snippet",
              }).catch((error) => {
                console.error(error)
                toast({
                  title: "Error Downloading Fabrication Files",
                  description: error.toString(),
                })
              })
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow  mr-6">Fabrication Files</span>
            <span className="text-[0.6rem] bg-purple-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              gerber/pnp/bom/csv
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => notImplemented("kicad footprint download")}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download Footprint</span>
            <span className="text-[0.6rem] bg-orange-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              kicad_mod
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => notImplemented("kicad project download")}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download KiCad Project</span>
            <span className="text-[0.6rem] bg-orange-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              kicad_*
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadSchematicSvg(
                circuitJson,
                snippetUnscopedName || "circuit",
              )
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download Schematic SVG</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              svg
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadAssemblySvg(
                circuitJson,
                snippetUnscopedName || "circuit",
              )
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download Assembly SVG</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              svg
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadDsnFile(circuitJson, snippetUnscopedName || "circuit")
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download DSN file</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              dsn
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => {
              downloadReadableNetlist(
                circuitJson,
                snippetUnscopedName || "circuit",
              )
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Download Readable Netlist</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              txt
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
