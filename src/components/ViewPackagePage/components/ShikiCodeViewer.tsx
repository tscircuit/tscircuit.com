import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Pre-randomized array to avoid flickering on re-renders
export const SKELETON_WIDTHS = [
  "w-2/3",
  "w-1/4",
  "w-5/6",
  "w-1/3",
  "w-1/2",
  "w-3/4",
]
const PLACEHOLDER_SHIKI_HTML = `<pre class="shiki vitesse-light" style="background-color:#ffffff;color:#393a34" tabindex="0"><code><span class="line"></span></code></pre>`
export const ShikiCodeViewer = ({
  code,
  filePath,
}: {
  code: string
  filePath: string
}) => {
  const { highlighter } = useShikiHighlighter()

  const html = useMemo(
    () =>
      highlighter?.codeToHtml(code, {
        lang: "tsx",
        theme: "vitesse-light",
      }),
    [filePath, code, highlighter],
  )

  if (html && html?.trim() !== PLACEHOLDER_SHIKI_HTML) {
    return (
      <div
        className="text-sm shiki"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <div className="text-sm p-4">
      {SKELETON_WIDTHS.map((w, i) => (
        <Skeleton key={i} className={`h-4 mb-2 ${w}`} />
      ))}
    </div>
  )
}
