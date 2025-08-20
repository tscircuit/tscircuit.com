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
import { downloadSpiceFile } from "@/lib/download-fns/download-spice-file"
import { downloadAssemblySvg } from "@/lib/download-fns/download-assembly-svg"
import { usePcbDownloadDialog } from "@/components/dialogs/pcb-download-dialog"
import { downloadKicadFiles } from "@/lib/download-fns/download-kicad-files"
import { AnyCircuitElement } from "circuit-json"
import { ChevronDown, Download, Hammer } from "lucide-react"
import { downloadGltfFromCircuitJson } from "@/lib/download-fns/download-gltf-from-circuit-json"
import { downloadPngImage } from "@/lib/download-fns/download-png-utils"
import { ImageFormat } from "@/lib/download-fns/download-circuit-png"
import { CubeIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useAxios } from "@/hooks/use-axios"
import { useCurrentPackageId } from "@/hooks/use-current-package-id"

interface DownloadButtonAndMenuProps {
  className?: string
  unscopedName?: string
  author?: string
  hasCircuitJson?: boolean
  desiredImageType?: string
  offerMultipleImageFormats?: boolean
  circuitJson?: AnyCircuitElement[] | null
}

export function DownloadButtonAndMenu({
  className,
  unscopedName,
  author,
  desiredImageType = "pcb",
  hasCircuitJson,
  offerMultipleImageFormats = false,
  circuitJson,
}: DownloadButtonAndMenuProps) {
  const notImplemented = useNotImplementedToast()
  const { Dialog: PcbDownloadDialog, openDialog: openPcbDownloadDialog } =
    usePcbDownloadDialog()
  const axios = useAxios()
  const { packageId } = useCurrentPackageId()
  const [fetchedCircuitJson, setFetchedCircuitJson] = useState<
    AnyCircuitElement[] | null
  >(null)
  const [isFetchingCircuitJson, setIsFetchingCircuitJson] = useState(false)

  const canDownload = Boolean(
    hasCircuitJson || (circuitJson && circuitJson.length),
  )

  const getCircuitJson = async (): Promise<AnyCircuitElement[]> => {
    if (circuitJson && circuitJson.length) return circuitJson
    if (fetchedCircuitJson && fetchedCircuitJson.length)
      return fetchedCircuitJson
    setIsFetchingCircuitJson(true)
    try {
      const { data } = await axios.get("/package_files/get", {
        params: { package_id: packageId, file_path: "dist/circuit.json" },
      })
      const content = data?.package_file?.content_text
      if (!content) throw new Error("Circuit JSON not found")
      const parsed = JSON.parse(content)
      setFetchedCircuitJson(parsed)
      return parsed
    } catch (error: any) {
      toast({
        title: "Failed to fetch Circuit JSON",
        description: error?.message || error?.toString?.() || "Unknown error",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsFetchingCircuitJson(false)
    }
  }

  if (!canDownload) {
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
            onSelect={async () => {
              const cj = await getCircuitJson()
              downloadCircuitJson(cj, unscopedName || "circuit" + ".json")
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
                const cj = await getCircuitJson()
                await downloadGltfFromCircuitJson(
                  cj,
                  unscopedName || "circuit",
                  { format: "glb", boardTextureResolution: 2048 },
                )
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
              try {
                const cj = await getCircuitJson()
                await downloadGltfFromCircuitJson(
                  cj,
                  unscopedName || "circuit",
                  { format: "gltf", boardTextureResolution: 2048 },
                )
              } catch (error: any) {
                toast({
                  title: "Error Downloading 3D Model (GLTF)",
                  description: error.toString(),
                  variant: "destructive",
                })
              }
            }}
          >
            <CubeIcon className="mr-1 h-3 w-3" />
            <span className="flex-grow  mr-6">3D Model</span>
            <span className="text-[0.6rem] bg-green-500 opacity-80 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              gltf
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={async () => {
              const cj = await getCircuitJson()
              await downloadFabricationFiles({
                circuitJson: cj,
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
            onSelect={async () => {
              const cj = await getCircuitJson()
              downloadKicadFiles(cj, unscopedName || "kicad_project")
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
            onSelect={async () => {
              const cj = await getCircuitJson()
              downloadSchematicSvg(cj, unscopedName || "circuit")
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
            onSelect={async () => {
              const cj = await getCircuitJson()
              downloadAssemblySvg(cj, unscopedName || "circuit")
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
            onSelect={async () => {
              const cj = await getCircuitJson()
              setFetchedCircuitJson(cj)
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
            onSelect={async () => {
              const cj = await getCircuitJson()
              downloadDsnFile(cj, unscopedName || "circuit")
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
            onClick={async () => {
              const cj = await getCircuitJson()
              downloadReadableNetlist(cj, unscopedName || "circuit")
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
            onSelect={async () => {
              const cj = await getCircuitJson()
              downloadSpiceFile(cj, unscopedName || "circuit")
            }}
          >
            <Download className="mr-1 h-3 w-3" />
            <span className="flex-grow mr-6">SPICE Netlist</span>
            <span className="text-[0.6rem] opacity-80 bg-blue-500 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
              spice
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onSelect={async () => {
              const cj = await getCircuitJson()
              downloadSimpleRouteJson(cj, unscopedName || "circuit")
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
              onClick={async () => {
                const desiredImageFormat = [
                  "pcb",
                  "schematic",
                  "assembly",
                  "3d",
                ].includes(desiredImageType)
                  ? desiredImageType
                  : "pcb"
                const cj = await getCircuitJson()
                downloadPngImage({
                  circuitJson: cj,
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
                onClick={async () =>
                  downloadPngImage({
                    circuitJson: await getCircuitJson(),
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
                onClick={async () =>
                  downloadPngImage({
                    circuitJson: await getCircuitJson(),
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
                onClick={async () =>
                  downloadPngImage({
                    circuitJson: await getCircuitJson(),
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
              <DropdownMenuItem
                className="text-xs"
                onClick={async () =>
                  downloadPngImage({
                    circuitJson: await getCircuitJson(),
                    unscopedName,
                    author,
                    format: "3d",
                  })
                }
              >
                <Download className="mr-1 h-3 w-3" />
                <span className="flex-grow mr-6">3D PNG</span>
                <span className="text-[0.6rem] opacity-80 bg-teal-600 text-white font-mono rounded-md px-1 text-center py-0.5 mr-1">
                  png
                </span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <PcbDownloadDialog
        circuitJson={fetchedCircuitJson || circuitJson || []}
        fileName={unscopedName || "circuit"}
      />
    </div>
  )
}
