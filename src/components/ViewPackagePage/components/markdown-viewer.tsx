import React, { useEffect, useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useToast } from "@/hooks/use-toast"
import { Check, Clipboard, Copy, CopyPlus } from "lucide-react"

export default function MarkdownViewer({
  markdownContent,
}: {
  markdownContent: string
}) {
  const { highlighter } = useShikiHighlighter()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()

  const copyCodeToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      // changes check icon back to clipboard
      setTimeout(() => {
        setCopiedCode(null)
      }, 1500)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
      })
    }
  }

  return (
    <div className="markdown-code">
      <div className="prose dark:prose-invert prose-pre:py-0 prose-pre:px-6 prose-pre:bg-white dark:prose-pre:bg-gray-800 prose-code:font-mono markdown-content">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }) {
              const isCodeBlock =
                className?.includes("language-") || /\n/.test(String(children))
              const codeString = children?.toString() || ""

              const dom = document.createElement("div")
              if (highlighter) {
                dom.innerHTML = highlighter.codeToHtml(codeString, {
                  lang: "tsx",
                  themes: {
                    light: "github-light",
                    dark: "github-dark",
                  },
                })
              }

              return isCodeBlock ? (
                <div className="flex border rounded-lg relative">
                  <div
                    dangerouslySetInnerHTML={{ __html: dom.innerHTML }}
                    className="flex-1 overflow-auto"
                  ></div>
                  {copiedCode === codeString ? (
                    <Check
                      size={25}
                      className="text-green-500 hover:bg-gray-100 p-1 mt-1 mr-1 cursor-pointer rounded-md absolute top-2 right-2"
                    />
                  ) : (
                    <Copy
                      onClick={() => copyCodeToClipboard(codeString)}
                      size={25}
                      className="text-slate-500 hover:bg-gray-100 p-1 mt-1 mr-1 cursor-pointer rounded-md absolute top-2 right-2"
                    />
                  )}
                </div>
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
