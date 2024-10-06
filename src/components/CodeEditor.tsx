import Editor from "react-simple-code-editor"
// @ts-ignore
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism.css"
import { useState } from "react"

export const CodeEditor = ({
  onCodeChange,
  readOnly = false,
  code,
}: {
  onCodeChange: (code: string) => void
  code: string
  readOnly?: boolean
}) => {
  return (
    <Editor
      readOnly={readOnly}
      value={code}
      onValueChange={(newCode) => {
        onCodeChange(newCode)
      }}
      highlight={(code) => highlight(code, languages.js)}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 12,
        height: 640,
        width: "100%",
      }}
    />
  )
}
