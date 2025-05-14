import type { AnyCircuitElement } from "circuit-json"
import { runTscircuitCode } from "@tscircuit/eval"

export const generateCircuitJson = async ({
  code,
}: {
  code: string
}): Promise<AnyCircuitElement[]> => {
  return (await runTscircuitCode(code)) as any
}
