import { useMemo } from "react"
import * as Babel from "@babel/standalone"

export const safeCompileTsx = (
  code: string,
):
  | { success: true; compiledTsx: string; error?: undefined }
  | { success: false; error: Error; compiledTsx?: undefined } => {
  try {
    return {
      success: true,
      compiledTsx:
        Babel.transform(code, {
          presets: ["react", "typescript"],
          plugins: ["transform-modules-commonjs"],
          filename: "virtual.tsx",
        }).code || "",
    }
  } catch (error: any) {
    return { success: false, error }
  }
}

export const useCompiledTsx = (
  code?: string,
  { isStreaming = false }: { isStreaming?: boolean } = {},
) => {
  return useMemo(() => {
    if (!code) return ""
    if (isStreaming) return ""
    const result = safeCompileTsx(code)
    if (result.success) {
      return result.compiledTsx
    }
    return `Error: ${result.error.message}`
  }, [code, isStreaming])
}
