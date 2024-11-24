import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import * as snippets from "@tscircuit/featured-snippets"
import { CodeRunner } from "@tscircuit/prompt-benchmarks"
import {
  safeTranspileCode,
  safeCompileDts,
} from "@tscircuit/prompt-benchmarks/code-runner"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"

const { snippetsVfs } = snippets

export default withRouteSpec({
  methods: ["GET"],
  auth: "none",
  jsonBody: z.any().optional(),
  jsonResponse: z.object({
    ok: z.boolean(),
    results: z.array(z.any()),
  }),
})(async (req, ctx) => {
  const results = await Promise.all(
    Object.entries(snippetsVfs)
      .slice(1, 2)
      .map(([key, code]) => processSnippetPipeline(key, code)),
  )

  return ctx.json({
    ok: true,
    results,
  })
})

const processSnippetPipeline = async (key: string, code: string) => {
  try {
    const runner = new CodeRunner({
      registryApiUrl: "https://registry-api.tscircuit.com",
    })

    const imports = getImportsFromCode(code)

    for (const importName of imports) {
      if (!runner.imports[importName]) {
        await runner.addImportByName(importName)
      }
    }

    const transpileResult = safeTranspileCode(code)
    if (!transpileResult.success) {
      throw new Error(`Transpilation failed: ${transpileResult.error}`)
    }

    const dtsResult = await safeCompileDts(code, {
      importMapMethod: "cdn",
    })
    if (!dtsResult.success) {
      throw new Error(`DTS compilation failed: ${dtsResult.error}`)
    }

    const circuitResult = await runner.runSnippet(code)

    return {
      key,
      imports,
      transpiled: transpileResult.transpiledCode,
      dts: dtsResult.dts,
      evaluatedCircuit: circuitResult.circuit,
      evaluationResult: circuitResult.circuitJson,
      circuit: circuitResult,
      success: true,
    }
  } catch (error: any) {
    return {
      key,
      error: error.message,
      success: false,
    }
  }
}

// Map over snippetsVfs object, and process each snippet
Object.entries(snippetsVfs)
  .splice(1, 2)
  .map(async ([key, code]) => {
    console.log(await processSnippetPipeline(key, code))
  })
