import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Pre-randomized array to avoid flickering on re-renders
const SKELETON_WIDTHS = ["w-2/3", "w-1/4", "w-5/6", "w-1/3", "w-1/2", "w-3/4"]

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

  if (!html) {
    return (
      <div className="text-sm p-4">
        {SKELETON_WIDTHS.map((w, i) => (
          <Skeleton key={i} className={`h-4 mb-2 ${w}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="text-sm shiki" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
