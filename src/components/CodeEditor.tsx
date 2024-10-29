import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { autocompletion } from "@codemirror/autocomplete"
import { indentWithTab } from "@codemirror/commands"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { EditorState } from "@codemirror/state"
import { keymap } from "@codemirror/view"
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
} from "@typescript/vfs"
import {
  tsAutocomplete,
  tsFacet,
  tsHover,
  tsLinter,
  tsSync,
} from "@valtown/codemirror-ts"
import { EditorView, basicSetup } from "codemirror"
import { useEffect, useRef, useState } from "react"
import ts from "typescript"
import { useImportSnippetDialog } from "./dialogs/import-snippet-dialog"

export const CodeEditor = ({
  onCodeChange,
  onDtsChange,
  readOnly = false,
  code = "",
  isStreaming = false,
}: {
  onCodeChange: (code: string, filename?: string) => void
  onDtsChange?: (dts: string) => void
  code: string
  readOnly?: boolean
  isStreaming?: boolean
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { Dialog: ImportSnippetDialog, openDialog: openImportDialog } =
    useImportSnippetDialog()
  const { toast } = useToast()

  const [files, setFiles] = useState<Record<string, string>>({
    "index.tsx": code,
    "manual-edits.json": "",
  })
  const [currentFile, setCurrentFile] = useState("index.tsx")

  useEffect(() => {
    if (code !== files["index.tsx"]) {
      setFiles((prev) => ({
        ...prev,
        "index.tsx": code,
      }))
    }
  }, [code])

  useEffect(() => {
    if (!editorRef.current) return

    const fsMap = new Map<string, string>()
    Object.entries(files).forEach(([filename, content]) => {
      fsMap.set(filename, content)
    })

    const system = createSystem(fsMap)
    const env = createVirtualTypeScriptEnvironment(system, [], ts, {
      jsx: ts.JsxEmit.ReactJSX,
      declaration: true,
      allowJs: true,
      resolveJsonModule: true,
    })

    // Determine language support based on file extension
    const getLanguageExtension = (filename: string) => {
      if (filename.endsWith(".json")) {
        return json()
      }
      return javascript({ typescript: true, jsx: true })
    }

    // Only add TypeScript-specific extensions for .ts/.tsx files
    const getTypeScriptExtensions = (filename: string) => {
      if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
        return [
          tsFacet.of({ env, path: filename }),
          tsSync(),
          tsLinter(),
          autocompletion({ override: [tsAutocomplete()] }),
          tsHover(),
        ]
      }
      return []
    }

    const state = EditorState.create({
      doc: files[currentFile],
      extensions: [
        basicSetup,
        getLanguageExtension(currentFile),
        ...getTypeScriptExtensions(currentFile),
        keymap.of([indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newContent = update.state.doc.toString()
            setFiles((prev) => ({
              ...prev,
              [currentFile]: newContent,
            }))
            onCodeChange(newContent, currentFile)

            if (currentFile === "index.tsx") {
              const { outputFiles } = env.languageService.getEmitOutput(
                currentFile,
                true,
              )

              const indexDts = outputFiles.find(
                (file) => file.name === "index.d.ts",
              )
              if (indexDts?.text && onDtsChange) {
                onDtsChange(indexDts.text)
              }
            }
          }
        }),
        EditorState.readOnly.of(readOnly),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [currentFile, !isStreaming])

  useEffect(() => {
    if (viewRef.current) {
      const state = viewRef.current.state
      const currentContent = files[currentFile] || ""
      if (state.doc.toString() !== currentContent) {
        viewRef.current.dispatch({
          changes: { from: 0, to: state.doc.length, insert: currentContent },
        })
      }
    }
  }, [files, currentFile])

  const updateFileContent = (filename: string, newContent: string) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: newContent,
    }))

    // If updating index.tsx, also notify parent component
    if (filename === "index.tsx") {
      onCodeChange(newContent, filename)
    }

    // Update editor view if it exists
    if (viewRef.current && currentFile === filename) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: newContent,
        },
      })
    }
  }

  const handleFileChange = (filename: string) => {
    setCurrentFile(filename)
  }

  const formatCurrentFile = () => {
    if (!window.prettier || !window.prettierPlugins) return

    try {
      const currentContent = files[currentFile]

      // For JSON files, use JSON.parse/stringify
      if (currentFile.endsWith(".json")) {
        try {
          const jsonObj = JSON.parse(currentContent)
          const formattedJson = JSON.stringify(jsonObj, null, 2)

          setFiles((prev) => ({
            ...prev,
            [currentFile]: formattedJson,
          }))

          if (viewRef.current) {
            viewRef.current.dispatch({
              changes: {
                from: 0,
                to: viewRef.current.state.doc.length,
                insert: formattedJson,
              },
            })
          }
          return
        } catch (jsonError) {
          throw new Error("Invalid JSON content")
        }
      }

      // For TypeScript files, use Prettier with typescript parser
      const formattedCode = window.prettier.format(currentContent, {
        semi: false,
        parser: "typescript",
        plugins: window.prettierPlugins,
      })

      setFiles((prev) => ({
        ...prev,
        [currentFile]: formattedCode,
      }))

      // If currently viewing the formatted file, update the editor
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: formattedCode,
          },
        })
      }

      // If formatting index.tsx, also update the parent's code state
      if (currentFile === "index.tsx") {
        onCodeChange(formattedCode, "index.tsx")
      }
    } catch (error) {
      console.error("Formatting error:", error)
      toast({
        title: "Formatting error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to format the code. Please check for syntax errors.",
        variant: "destructive",
      })
    }
  }

  if (isStreaming) {
    return (
      <div className="font-mono whitespace-pre-wrap text-xs">
        {files[currentFile]}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-200">
        <Select value={currentFile} onValueChange={handleFileChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select file" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(files).map((filename) => (
              <SelectItem key={filename} value={filename}>
                {filename}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center px-2 py-1 ml-auto">
          <Button size="sm" variant="ghost" onClick={() => openImportDialog()}>
            Import
          </Button>
          <Button size="sm" variant="ghost" onClick={() => formatCurrentFile()}>
            Format
          </Button>
        </div>
      </div>
      <div ref={editorRef} className="flex-1 overflow-auto" />
      <ImportSnippetDialog
        onSnippetSelected={(snippet) => {
          const newContent = `import {} from "@tsci/${snippet.owner_name}.${snippet.unscoped_name}"\n${files[currentFile]}`
          updateFileContent(currentFile, newContent)
        }}
      />
    </div>
  )
}
