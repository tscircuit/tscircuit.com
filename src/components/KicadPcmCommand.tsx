import { ExternalLink } from "lucide-react"

export function KicadPcmCommand({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex ml-0.5 items-center gap-2 text-xs text-blue-600 hover:underline transition-all"
    >
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
      <span className="font-medium">KiCad PCM URL</span>
    </a>
  )
}
