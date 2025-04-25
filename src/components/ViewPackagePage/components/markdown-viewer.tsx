import React, { useEffect } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"

export default function MarkdownViewer({
  markdownContent,
}: {
  markdownContent: string
}) {
  const { highlighter } = useShikiHighlighter()
  return (
    <div className="markdown-code">
      {/* Inject global CSS once to hide Shiki’s line-number pseudo-elements */}
      <style>{`
        .markdown-code .shiki .line::before {
          content: none !important;
          display: none !important;
        }

        .markdown-code .shiki .line {
          padding-left: 0 !important;
        }

        .markdown-code pre {
          padding: 12px !important;
          margin: 0 !important;
        }
      `}</style>

      <div className="prose dark:prose-invert prose-pre:py-0 prose-pre:px-6 prose-pre:bg-white dark:prose-pre:bg-gray-800 prose-code:font-mono markdown-content">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }) {
              const isCodeBlock =
                className?.includes("language-") || /\n/.test(String(children))
              const dom = document.createElement("div")
              if (highlighter) {
                dom.innerHTML = highlighter.codeToHtml(
                  children?.toString() || "",
                  {
                    lang: "typescript",
                    themes: {
                      light: "github-light",
                      dark: "github-dark",
                    },
                  },
                )
              }
              // Don’t use <code> tags (they leave backticks intact)
              return isCodeBlock ? (
                <div
                  dangerouslySetInnerHTML={{ __html: dom.innerHTML }}
                  className="border rounded-lg"
                ></div>
              ) : (
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 font-semibold font-mono dark:text-gray-200 px-1 py-0.5 rounded">
                  {children}
                </span>
              )
            },
          }}
        >
          {markdownContent}
        </Markdown>
      </div>
    </div>
  )
}
