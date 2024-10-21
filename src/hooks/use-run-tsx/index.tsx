import { useEffect, useMemo, useReducer, useRef, useState } from "react"
import * as React from "react"
import { safeCompileTsx, useCompiledTsx } from "../use-compiled-tsx"
import * as tscircuitCore from "@tscircuit/core"
import { createJSCADRenderer } from "jscad-fiber"
import { jscadPlanner } from "jscad-planner"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"
import { evalCompiledJs } from "./eval-compiled-js"
import { constructCircuit } from "./construct-circuit"
import { useSnippetsBaseApiUrl } from "../use-snippets-base-api-url"
import * as jscadFiber from "jscad-fiber"
import { AnyCircuitElement } from "circuit-json"

type RunTsxResult = {
  compiledModule: any
  message: string
  circuitJson: AnyCircuitElement[] | null
  compiledJs?: string
  isLoading: boolean
}

export const useRunTsx = ({
  code,
  type,
  isStreaming = false,
}: {
  code?: string
  type?: "board" | "footprint" | "package" | "model"
  isStreaming?: boolean
} = {}): RunTsxResult & {
  triggerRunTsx: () => void
  tsxRunTriggerCount: number
} => {
  type ??= "board"
  const [tsxRunTriggerCount, incTsxRunTriggerCount] = useReducer(
    (c) => c + 1,
    0,
  )
  const [tsxResult, setTsxResult] = useState<RunTsxResult>({
    compiledModule: null,
    message: "",
    circuitJson: null,
    isLoading: false,
  })
  const apiBaseUrl = useSnippetsBaseApiUrl()
  const preSuppliedImportsRef = useRef<Record<string, any>>({})

  useEffect(() => {
    if (tsxRunTriggerCount === 0) return
    if (isStreaming) {
      setTsxResult({
        compiledModule: null,
        message: "",
        circuitJson: null,
        isLoading: false,
      })
    }
    if (!code) return
    async function run() {
      const userCodeTsciImports = getImportsFromCode(code!).filter((imp) =>
        imp.startsWith("@tsci/"),
      )

      const preSuppliedImports: Record<string, any> =
        preSuppliedImportsRef.current

      const __tscircuit_require = (name: string) => {
        if (!preSuppliedImports[name]) {
          throw new Error(
            `Import "${name}" not found (imports available: ${Object.keys(preSuppliedImports).join(",")})`,
          )
        }
        return preSuppliedImports[name]
      }
      ;(globalThis as any).__tscircuit_require = __tscircuit_require
      preSuppliedImports["@tscircuit/core"] = tscircuitCore
      preSuppliedImports["react"] = React
      preSuppliedImports["jscad-fiber"] = jscadFiber
      globalThis.React = React

      async function addImport(importName: string, depth: number = 0) {
        if (!importName.startsWith("@tsci/")) return
        if (preSuppliedImports[importName]) return
        if (depth > 5) {
          console.log("Max depth for imports reached")
          return
        }

        const fullSnippetName = importName
          .replace("@tsci/", "")
          .replace(".", "/")
        const { snippet: importedSnippet, error } = await fetch(
          `${apiBaseUrl}/snippets/get?name=${fullSnippetName}`,
        )
          .then((res) => res.json())
          .catch((e) => ({ error: e }))

        if (error) {
          console.error("Error fetching import", importName, error)
          return
        }

        const { compiled_js, code } = importedSnippet

        const importNames = getImportsFromCode(code!)

        for (const importName of importNames) {
          if (!preSuppliedImports[importName]) {
            await addImport(importName, depth + 1)
          }
        }

        try {
          preSuppliedImports[importName] = evalCompiledJs(compiled_js).exports
        } catch (e) {
          console.error("Error importing snippet", e)
        }
      }

      for (const userCodeTsciImport of userCodeTsciImports) {
        await addImport(userCodeTsciImport)
      }

      const { success, compiledTsx: compiledJs, error } = safeCompileTsx(code!)

      if (!success) {
        setTsxResult({
          compiledModule: null,
          message: `Compile Error: ${error.message}`,
          circuitJson: null,
          isLoading: false,
        })
      }

      try {
        const module = evalCompiledJs(compiledJs!)

        const componentExportKeys = Object.keys(module.exports).filter(
          (key) => !key.startsWith("use"),
        )

        if (componentExportKeys.length > 1) {
          throw new Error(
            `Too many exports, only export one component. You exported: ${JSON.stringify(Object.keys(module.exports))}`,
          )
        }

        const primaryKey = componentExportKeys[0]

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
            circuitJson: circuitJson as AnyCircuitElement[],
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
  }, [tsxRunTriggerCount])

  return {
    ...tsxResult,
    triggerRunTsx: incTsxRunTriggerCount,
    tsxRunTriggerCount,
  }
}
