import { useEffect, useRef } from "react"
import { EditorState } from "@codemirror/state"
import { EditorView } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { basicSetup } from "@/lib/codemirror/basic-setup"
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language"
import { tags as t } from "@lezer/highlight"

const githubDarkHighlightStyle = HighlightStyle.define([
  { tag: [t.standard(t.tagName), t.tagName], color: "#7ee787" },
  { tag: [t.comment, t.lineComment], color: "#8b949e" },
  {
    tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.modifier],
    color: "#ff7b72",
  },
  { tag: [t.variableName, t.attributeName], color: "#c9d1d9" },
  {
    tag: [t.function(t.variableName), t.function(t.propertyName)],
    color: "#d2a8ff",
  },
  {
    tag: [t.className, t.typeName, t.definition(t.typeName)],
    color: "#f0883e",
  },
  { tag: [t.string, t.special(t.string)], color: "#a5d6ff" },
  { tag: [t.number, t.bool, t.null], color: "#79c0ff" },
  { tag: [t.propertyName], color: "#c9d1d9" },
  { tag: [t.operator, t.punctuation], color: "#79c0ff" },
  { tag: [t.angleBracket, t.squareBracket, t.paren], color: "#c9d1d9" },
])

const darkTheme = EditorView.theme(
  {
    "&": {
      color: "#c9d1d9",
      backgroundColor: "#0d1117",
      height: "100%",
    },
    ".cm-content": {
      caretColor: "#c9d1d9",
      minHeight: "100%",
    },
    ".cm-scroller": {
      minHeight: "100%",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#c9d1d9",
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#3392FF44",
    },
    ".cm-gutters": {
      backgroundColor: "#0d1117",
      color: "#484f58",
      border: "none",
      minHeight: "100%",
    },
    ".cm-activeLine": {
      backgroundColor: "#161b22",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#161b22",
    },
  },
  { dark: true },
)

export function MinimalEditor({
  code,
  onChange,
}: { code: string; onChange: (code: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        javascript({ typescript: true, jsx: true }),
        darkTheme,
        syntaxHighlighting(githubDarkHighlightStyle),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== code) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: code,
        },
      })
    }
  }, [code])

  return (
    <div
      ref={containerRef}
      className="w-full h-full text-sm sm:text-[15px] overflow-auto [&_.cm-editor]:h-full [&_.cm-scroller]:font-mono [&_.cm-editor]:outline-none"
    />
  )
}
