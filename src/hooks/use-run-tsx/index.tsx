import { useEffect, useMemo, useState } from "react"
import * as React from "react"
import { useCompiledTsx } from "../use-compiled-tsx"
import { Circuit } from "@tscircuit/core"
import { createJSCADRenderer } from "jscad-fiber"
import { jscadPlanner } from "jscad-planner"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import { evalCompiledJs } from "./eval-compiled-js"
import { constructCircuit } from "./construct-circuit"
import { useSnippetsBaseApiUrl } from "../use-snippets-base-api-url"

type RunTsxResult = {
  compiledModule: any
  message: string
  circuitJson: any
  compiledJs?: string
  isLoading: boolean
}

export const useRunTsx = (
  code?: string,
  type?: "board" | "footprint" | "package" | "model",
  { isStreaming = false }: { isStreaming?: boolean } = {},
): RunTsxResult => {
  type ??= "board"
  const compiledJs = useCompiledTsx(code, { isStreaming })
  const [tsxResult, setTsxResult] = useState<RunTsxResult>({
    compiledModule: null,
    message: "",
    circuitJson: null,
    isLoading: false,
  })
  const apiBaseUrl = useSnippetsBaseApiUrl()

  useEffect(() => {
    async function run() {
      if (isStreaming || !compiledJs || !code) {
        setTsxResult({
          compiledModule: null,
          message: "",
          circuitJson: null,
          isLoading: false,
        })
        return
      }

      const imports = getImportsFromCode(code!).filter((imp) =>
        imp.startsWith("@tsci/"),
      )

      const preSuppliedImports: Record<string, any> = {}

      for (const importName of imports) {
        const fullSnippetName = importName
          .replace("@tsci/", "")
          .replace(".", "/")
        console.log({ importName, fullSnippetName })
        // Fetch compiled code from the server
        const { snippet: importedSnippet } = await fetch(
          `${apiBaseUrl}/snippets/get?name=${fullSnippetName}`,
        ).then((res) => res.json())

        try {
          console.log("importedSnippet", importedSnippet)
          // eval the imported snippet compiled_js
          preSuppliedImports[importName] = evalCompiledJs(
            importedSnippet.compiled_js,
          )
        } catch (e) {
          console.error("Error importing snippet", e)
        }
      }

      const __tscircuit_require = (name: string) => {
        if (!preSuppliedImports[name]) {
          throw new Error(`Import "${name}" not found`)
        }
        return preSuppliedImports[name]
      }
      ;(globalThis as any).__tscircuit_require = __tscircuit_require

      try {
        globalThis.React = React

        const module = evalCompiledJs(compiledJs)

        if (Object.keys(module.exports).length > 1) {
          throw new Error(
            `Too many exports, only export one thing. You exported: ${JSON.stringify(Object.keys(module.exports))}`,
          )
        }

        const primaryKey = Object.keys(module.exports)[0]

        const UserElm = (props: any) =>
          React.createElement(module.exports[primaryKey], props)

        try {
          const circuit = constructCircuit(UserElm, type as any)
          circuit.render()
          const circuitJson = circuit.getCircuitJson()

          setTsxResult({
            compiledModule: module,
            compiledJs,
            message: "",
            circuitJson,
            isLoading: false,
          })
        } catch (error: any) {
          console.error("Evaluation error:", error)
          setTsxResult({
            compiledModule: module,
            message: `Render Error: ${error.message}`,
            circuitJson: null,
            isLoading: false,
          })
        }
      } catch (error: any) {
        console.error("Evaluation error:", error)
        setTsxResult({
          compiledModule: null,
          message: `Eval Error: ${error.message}\n\n${error.stack}`,
          circuitJson: null,
          isLoading: false,
        })
      }
    }
    run()
  }, [compiledJs, isStreaming])

  return tsxResult
}
