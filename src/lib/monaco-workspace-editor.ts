import "./monaco-workers"
import "@tscircuit/monaco-code-editor/styles.css"
import { WorkspaceCodeEditor } from "@tscircuit/monaco-code-editor"

// Side-effect imports above configure Monaco workers and styles only when this
// module is dynamically imported (desktop editor mount), not from main.tsx.
export { WorkspaceCodeEditor }
