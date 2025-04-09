import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast, useNotImplementedToast } from "@/hooks/use-toast"
import { downloadCircuitJson } from "@/lib/download-fns/download-circuit-json-fn"
import { downloadSimpleRouteJson } from "@/lib/download-fns/download-simple-route-json"
import { downloadDsnFile } from "@/lib/download-fns/download-dsn-file-fn"
import { downloadFabricationFiles } from "@/lib/download-fns/download-fabrication-files"
import { downloadSchematicSvg } from "@/lib/download-fns/download-schematic-svg"
import { downloadReadableNetlist } from "@/lib/download-fns/download-readable-netlist"
import { downloadAssemblySvg } from "@/lib/download-fns/download-assembly-svg"
import { downloadKicadFiles } from "@/lib/download-fns/download-kicad-files"
import { AnyCircuitElement } from "circuit-json"
import { ChevronDown, Download, Hammer } from "lucide-react"
import { downloadGltf } from "@/lib/download-fns/download-gltf"
import { CubeIcon } from "@radix-ui/react-icons"

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
      <div>
        <Button
          disabled
          var="ghost"
          size="sm"
          className="h-9 border-gray-300 dark:border-[#30363d] bg-gray-100 hover:bg-gray-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-gray-700 dark:text-[#c9d1d9]"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export
          <ChevronDown className="h-4 w-4 ml-0.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 border-gray-300 dark:border-[#30363d] bg-gray-100 hover:bg-gray-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-gray-700 dark:text-[#c9d1d9]"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
            <ChevronDown className="h-4 w-4 ml-0.5" />
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
            <span className="flex-grow mr-6">Circuit JSON</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              json
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={async () => {
              try {
                await downloadGltf(
                  circuitJson,
                  snippetUnscopedName || "circuit",
                )
              } catch (error: any) {
                toast({
                  title: "Error Downloading 3D Model",
                  description: error.toString(),
                })
              }
            }}
          >
            <CubeIcon className="mr-1 h-3 w-3" />
            <span className="flex-grow  mr-6">3D Model</span>
            <span className="text-[0.6rem] bg-green-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              glb
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
            <Hammer className="mr-1 h-3 w-3" />
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
            <span className="flex-grow mr-6">KiCad Footprint</span>
            <span className="text-[0.6rem] bg-orange-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              kicad_mod
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadKicadFiles(
                circuitJson,
                snippetUnscopedName || "kicad_project",
              )
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">KiCad Project</span>
            <span className="text-[0.6rem] bg-orange-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              kicad_*.zip
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
            <span className="flex-grow mr-6">Schematic SVG</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              svg
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadAssemblySvg(circuitJson, snippetUnscopedName || "circuit")
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Assembly SVG</span>
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
            <span className="flex-grow mr-6">Specctra DSN</span>
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
            <span className="flex-grow mr-6">Readable Netlist</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              txt
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadSimpleRouteJson(
                circuitJson,
                snippetUnscopedName || "circuit",
              )
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Simple Route JSON</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              json
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
