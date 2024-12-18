export function getSyntaxError(code: string): string | null {
  try {
    window.Babel.transform(code, {
      filename: "index.tsx",
      presets: ["react", "typescript"],
    })
    return null
  } catch (error: unknown) {
    return (error as Error).message
  }
}
