import { usePcbDownloadDialog } from "@/components/dialogs/pcb-download-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast, useNotImplementedToast } from "@/hooks/useToast"
import { downloadAssemblySvg } from "@/lib/download-fns/download-assembly-svg"
import { downloadCircuitJson } from "@/lib/download-fns/download-circuit-json-fn"
import type { ImageFormat } from "@/lib/download-fns/download-circuit-png"
import { downloadDsnFile } from "@/lib/download-fns/download-dsn-file-fn"
import { downloadFabricationFiles } from "@/lib/download-fns/download-fabrication-files"
import { downloadGltf } from "@/lib/download-fns/download-gltf"
import { downloadKicadFiles } from "@/lib/download-fns/download-kicad-files"
import { downloadPngImage } from "@/lib/download-fns/download-png-utils"
import { downloadReadableNetlist } from "@/lib/download-fns/download-readable-netlist"
import { downloadSchematicSvg } from "@/lib/download-fns/download-schematic-svg"
import { downloadSimpleRouteJson } from "@/lib/download-fns/download-simple-route-json"
import { CubeIcon } from "@radix-ui/react-icons"
import type { AnyCircuitElement } from "circuit-json"
import { ChevronDown, Download, Hammer } from "lucide-react"

interface DownloadButtonAndMenuProps {
  className?: string
  unscopedName?: string
  author?: string
  circuitJson?: AnyCircuitElement[] | null
  desiredImageType?: string
  offerMultipleImageFormats?: boolean
}

export function DownloadButtonAndMenu({
  className,
  unscopedName,
  author,
  desiredImageType = "pcb",
  circuitJson,
  offerMultipleImageFormats = false,
}: DownloadButtonAndMenuProps) {
  const notImplemented = useNotImplementedToast()
  const { Dialog: PcbDownloadDialog, openDialog: openPcbDownloadDialog } =
    usePcbDownloadDialog()

  if (!circuitJson) {
    return (
      <div className={className}>
        <Button
          disabled
          size="sm"
          className="shadow-none bg-muted text-muted-foreground border border-input cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="bg-white shadow-none text-gray-900 hover:bg-gray-100 border border-gray-300 px-1 pl-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="!z-[101]">
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadCircuitJson(
                circuitJson,
                unscopedName || "circuit" + ".json",
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
                await downloadGltf(unscopedName || "circuit")
              } catch (error: any) {
                toast({
                  title: "Error Downloading 3D Model",
                  description: error.toString(),
                  variant: "destructive",
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
                snippetUnscopedName: unscopedName || "snippet",
              }).catch((error) => {
                console.error(error)
                console.log(error, error.stack)
                toast({
                  title: "Error Downloading Fabrication Files",
                  description: error.toString(),
                  variant: "destructive",
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
              downloadKicadFiles(circuitJson, unscopedName || "kicad_project")
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
              downloadSchematicSvg(circuitJson, unscopedName || "circuit")
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
              downloadAssemblySvg(circuitJson, unscopedName || "circuit")
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
              openPcbDownloadDialog()
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">PCB SVG</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              svg
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => {
              downloadDsnFile(circuitJson, unscopedName || "circuit")
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
              downloadReadableNetlist(circuitJson, unscopedName || "circuit")
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
              downloadSimpleRouteJson(circuitJson, unscopedName || "circuit")
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">Simple Route JSON</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              json
            </span>
          </DropdownMenuItem>

          {!offerMultipleImageFormats && (
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                const desiredImageFormat = [
                  "pcb",
                  "schematic",
                  "assembly",
                  "3d",
                ].includes(desiredImageType)
                  ? desiredImageType
                  : "pcb"
                downloadPngImage({
                  circuitJson,
                  unscopedName,
                  author,
                  format: desiredImageFormat as ImageFormat,
                })
              }}
            >
              <Download className="mr-1 h-3 w-3" />
              <span className="flex-grow mr-6">Image PNG</span>
              <span className="text-[0.6rem] opacity-80 bg-teal-600 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
                png
              </span>
            </DropdownMenuItem>
          )}
          {offerMultipleImageFormats && (
            <>
              <DropdownMenuItem
                className="text-xs"
                onClick={() =>
                  downloadPngImage({
                    circuitJson,
                    unscopedName,
                    author,
                    format: "schematic",
                  })
                }
              >
                <Download className="mr-1 h-3 w-3" />
                <span className="flex-grow mr-6">Schematic PNG</span>
                <span className="text-[0.6rem] opacity-80 bg-teal-600 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
                  png
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() =>
                  downloadPngImage({
                    circuitJson,
                    unscopedName,
                    author,
                    format: "pcb",
                  })
                }
              >
                <Download className="mr-1 h-3 w-3" />
                <span className="flex-grow mr-6">PCB PNG</span>
                <span className="text-[0.6rem] opacity-80 bg-teal-600 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
                  png
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs"
                onClick={() =>
                  downloadPngImage({
                    circuitJson,
                    unscopedName,
                    author,
                    format: "assembly",
                  })
                }
              >
                <Download className="mr-1 h-3 w-3" />
                <span className="flex-grow mr-6">Assembly PNG</span>
                <span className="text-[0.6rem] opacity-80 bg-teal-600 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
                  png
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <PcbDownloadDialog
        circuitJson={circuitJson}
        fileName={unscopedName || "circuit"}
      />
    </div>
  )
}
