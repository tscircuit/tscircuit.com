import { basicSetup } from "@/lib/codemirror/basic-setup"
import { javascript } from "@codemirror/lang-javascript"
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { createSvgUrl } from "@tscircuit/create-snippet-url"
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

const defaultHeroCode = `export default () => (
  <board width="16mm" height="12mm">
    <resistor
      name="R1"
      resistance="1k"
      footprint="0402"
      schX={-3}
      pcbX={-3}
    />
    <led
      name="D1"
      color="red"
      footprint="0603"
      schX={3}
      pcbX={3}
    />
    <trace from=".R1 > .pin2" to=".D1 > .anode" />
  </board>
)`

const previewViews = [
  { id: "schematic", label: "Sch" },
  { id: "pcb", label: "Pcb" },
  { id: "3d", label: "3d" },
] as const

type PreviewView = (typeof previewViews)[number]["id"]

const heroEditorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "#020617",
      color: "#e2e8f0",
    },
    ".cm-editor": {
      height: "100%",
    },
    ".cm-scroller": {
      height: "100%",
      overflow: "auto",
      fontFamily: '"Fira Code", monospace',
    },
    ".cm-content": {
      padding: "16px 0",
      caretColor: "#60a5fa",
    },
    ".cm-line": {
      padding: "0 16px",
    },
    ".cm-gutters": {
      border: "none",
      backgroundColor: "#020617",
      color: "#475569",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(59, 130, 246, 0.08)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(59, 130, 246, 0.08)",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection":
      {
        backgroundColor: "rgba(96, 165, 250, 0.24)",
      },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#60a5fa",
    },
    ".cm-focused": {
      outline: "none",
    },
  },
  { dark: true },
)

export function LandingHeroCodePreview() {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [code, setCode] = useState(defaultHeroCode)
  const [previewCode, setPreviewCode] = useState(defaultHeroCode)
  const deferredPreviewCode = useDeferredValue(previewCode)
  const [previewView, setPreviewView] = useState<PreviewView>("3d")
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return

    const state = EditorState.create({
      doc: defaultHeroCode,
      extensions: [
        basicSetup,
        javascript({ typescript: true, jsx: true }),
        heroEditorTheme,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return
          setCode(update.state.doc.toString())
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      startTransition(() => {
        setPreviewCode(code)
      })
    }, 250)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [code])

  const previewUrl = useMemo(
    () => createSvgUrl(deferredPreviewCode, previewView),
    [deferredPreviewCode, previewView],
  )

  useEffect(() => {
    setIsPreviewLoaded(false)
    setPreviewError(null)
  }, [previewUrl])

  const previewBackgroundClass =
    previewView === "schematic"
      ? "bg-[#F5F1ED]"
      : previewView === "pcb"
        ? "bg-black"
        : "bg-slate-50 dark:bg-slate-950"

  return (
    <div className="space-y-4 lg:pl-4">
      <div className="overflow-hidden rounded-xl bg-slate-950 shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          </div>
          <span>index.circuit.tsx</span>
        </div>
        <div ref={editorRef} className="h-[292px]" />
      </div>

      <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_18px_50px_rgba(59,130,246,0.12)] dark:border-blue-500/20 dark:bg-slate-900">
        <div
          className={`relative aspect-[1.95/1] overflow-hidden ${previewBackgroundClass}`}
        >
          <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-lg bg-white/90 p-1 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/85 dark:ring-slate-700">
            {previewViews.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setPreviewView(view.id)}
                className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  previewView === view.id
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>

          {!isPreviewLoaded && !previewError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-950/80">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Rendering preview...
              </div>
            </div>
          )}

          {previewError && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 p-6 text-center dark:bg-slate-950/90">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Preview unavailable
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {previewError}
                </p>
              </div>
            </div>
          )}

          <img
            alt={`Editable ${previewView} preview generated from tscircuit code`}
            className="h-full w-full object-contain"
            src={previewUrl}
            onLoad={() => setIsPreviewLoaded(true)}
            onError={() => {
              setPreviewError("svg.tscircuit.com could not load this preview.")
              setIsPreviewLoaded(true)
            }}
          />
        </div>
      </div>
    </div>
  )
}
