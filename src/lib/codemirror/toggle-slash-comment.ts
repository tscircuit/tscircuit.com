import type { StateCommand } from "@codemirror/state"
import { EditorState } from "@codemirror/state"

/**
 * Toggle line comments using // regardless of language configuration.
 */
export const toggleSlashComment: StateCommand = ({ state, dispatch }) => {
  if (state.readOnly) return false

  const ranges = state.selection.ranges
  let commentAll = true

  for (const { from, to } of ranges) {
    for (let pos = from; pos <= to; ) {
      const line = state.doc.lineAt(pos)
      const indent = /^\s*/.exec(line.text)?.[0].length || 0
      if (!line.text.slice(indent).startsWith("//")) {
        commentAll = false
        break
      }
      pos = line.to + 1
    }
    if (!commentAll) break
  }

  const changes = []
  for (const { from, to } of ranges) {
    for (let pos = from; pos <= to; ) {
      const line = state.doc.lineAt(pos)
      const indent = /^\s*/.exec(line.text)?.[0].length || 0
      const lineStart = line.from + indent
      if (commentAll) {
        if (line.text.slice(indent).startsWith("//")) {
          let end = lineStart + 2
          if (line.text.slice(indent + 2, indent + 3) === " ") end++
          changes.push({ from: lineStart, to: end })
        }
      } else {
        if (line.text.trim().length) {
          changes.push({ from: lineStart, insert: "// " })
        }
      }
      pos = line.to + 1
    }
  }

  if (!changes.length) return false

  dispatch(state.update({ changes, scrollIntoView: true }))
  return true
}
