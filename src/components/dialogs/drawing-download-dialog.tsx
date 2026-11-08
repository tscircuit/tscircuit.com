import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { downloadDrawingSvg } from "@/lib/download-fns/download-drawing-svg"
import type { CircuitJson } from "circuit-json"
import { useId, useState } from "react"

interface DrawingDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circuitJson: CircuitJson
  fileName: string
}

export const DrawingDownloadDialog = ({
  open,
  onOpenChange,
  circuitJson,
  fileName,
}: DrawingDownloadDialogProps) => {
  const drawingPages = circuitJson.filter(
    (element) => element.type === "drawing_page",
  )
  const [selectedPageId, setSelectedPageId] = useState(
    drawingPages[0]?.drawing_page_id,
  )
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const pageSelectId = useId()
  const selectedPage =
    drawingPages.find((page) => page.drawing_page_id === selectedPageId) ??
    drawingPages[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Engineering Drawing</DialogTitle>
          <DialogDescription>
            Choose a drawing sheet to download as an SVG.
          </DialogDescription>
        </DialogHeader>
        {drawingPages.length ? (
          <div className="space-y-2 py-2">
            <Label htmlFor={pageSelectId}>Drawing</Label>
            <Select
              value={selectedPage?.drawing_page_id}
              onValueChange={setSelectedPageId}
              disabled={isDownloading}
            >
              <SelectTrigger id={pageSelectId}>
                <SelectValue placeholder="Choose a drawing" />
              </SelectTrigger>
              <SelectContent className="!z-[999]">
                {drawingPages.map((page) => (
                  <SelectItem
                    key={page.drawing_page_id}
                    value={page.drawing_page_id}
                  >
                    {page.display_name ?? page.name ?? page.drawing_page_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No engineering drawings are available for this circuit.
          </p>
        )}
        {downloadError && (
          <p role="alert" className="text-sm text-destructive">
            {downloadError}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selectedPage || isDownloading}
            onClick={async () => {
              if (!selectedPage) return
              setIsDownloading(true)
              setDownloadError(null)
              try {
                await downloadDrawingSvg({
                  circuitJson,
                  drawingPageId: selectedPage.drawing_page_id,
                  fileName,
                })
                onOpenChange(false)
              } catch (error) {
                setDownloadError(
                  error instanceof Error ? error.message : String(error),
                )
              } finally {
                setIsDownloading(false)
              }
            }}
          >
            {isDownloading ? "Preparing SVG…" : "Download SVG"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
