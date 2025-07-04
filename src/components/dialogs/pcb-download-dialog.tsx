import {
  DownloadPcbSvgOptions,
  downloadPcbSvg,
} from "@/lib/download-fns/download-pcb-svg"
import { AnyCircuitElement } from "circuit-json"
import { useState } from "react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { createUseDialog } from "./create-use-dialog"

interface PcbDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circuitJson: AnyCircuitElement[]
  fileName: string
}

export const PcbDownloadDialog = ({
  open,
  onOpenChange,
  circuitJson,
  fileName,
}: PcbDownloadDialogProps) => {
  const [layer, setLayer] = useState<"all" | "top" | "bottom">("all")
  const [drawPadding, setDrawPadding] = useState(true)
  const [transparentBg, setTransparentBg] = useState(false)
  const [matchAspectRatio, setMatchAspectRatio] = useState(false)

  const handleDownload = () => {
    const options: DownloadPcbSvgOptions = {
      layer,
      drawPaddingOutsideBoard: drawPadding,
      backgroundColor: transparentBg ? "transparent" : "#000",
      matchAspectRatio,
    }
    downloadPcbSvg(circuitJson, fileName, options)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download PCB SVG</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="layer" className="text-right">
              Layer
            </Label>
            <Select value={layer} onValueChange={(v) => setLayer(v as any)}>
              <SelectTrigger id="layer" className="col-span-3">
                <SelectValue placeholder="Layer" />
              </SelectTrigger>
              <SelectContent className="!z-[999]">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="padding"
              checked={drawPadding}
              onCheckedChange={(v) => setDrawPadding(Boolean(v))}
            />
            <Label htmlFor="padding">Draw Padding and Board Outline</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="transparentBg"
              checked={transparentBg}
              onCheckedChange={(v) => setTransparentBg(Boolean(v))}
            />
            <Label htmlFor="transparentBg">Transparent Background</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="matchAspectRatio"
              checked={matchAspectRatio}
              onCheckedChange={(v) => setMatchAspectRatio(Boolean(v))}
            />
            <Label htmlFor="matchAspectRatio">Match Aspect Ratio</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const usePcbDownloadDialog = createUseDialog(PcbDownloadDialog)
