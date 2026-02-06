import { ExternalLink, HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const KICAD_PCM_DOCS_URL =
  "https://docs.tscircuit.com/command-line/tsci-dev#adding-the-pcm-repository-to-kicad"

export function KicadPcmCommand({ url }: { url: string }) {
  return (
    <div className="inline-flex ml-0.5 items-center gap-2 text-xs">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:underline transition-all"
      >
        <ExternalLink className="w-3 h-3 flex-shrink-0" />
        <span className="font-medium">KiCad PCM URL</span>
      </a>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={KICAD_PCM_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <HelpCircle className="size-3" />
            </a>
          </TooltipTrigger>
          <TooltipContent>
            <p>Learn how to use this URL in KiCad</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
