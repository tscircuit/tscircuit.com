import { HelpCircle } from "lucide-react"
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
    <div className="flex items-center gap-2 ml-0.5">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-blue-600 group cursor-pointer"
      >
        <span className="font-bold text-sm min-w-[18px] flex-shrink-0">K</span>
        <span className="group-hover:underline">KiCad PCM URL</span>
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
              <HelpCircle className="w-3.5 h-3.5" />
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
