import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useEffect, useMemo } from "react"
import { useQuery } from "react-query"

export const ShikiCodeViewer = ({
  code,
  filePath,
}: { code: string; filePath: string }) => {
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
        {["w-1/3", "w-1/4", "w-1/2", "w-2/3", "w-3/4", "w-5/6"]
          .sort(() => Math.random() - 0.5)
          .map((w, i) => (
            <div
              key={i}
              className={`h-4 bg-gray-200 rounded animate-pulse mb-2 ${w}`}
            />
          ))}
      </div>
    )
  }

  return (
    <div className="text-sm shiki" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
