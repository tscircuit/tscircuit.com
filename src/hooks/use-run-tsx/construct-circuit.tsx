import { Circuit } from "@tscircuit/core"
import { useEffect, useMemo, useState } from "react"
import * as React from "react"
import { useCompiledTsx } from "../use-compiled-tsx"
import { createJSCADRenderer } from "jscad-fiber"
import { jscadPlanner } from "jscad-planner"
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils"

export const constructCircuit = (
  UserElm: any,
  type: "board" | "footprint" | "package" | "model",
) => {
  const circuit = new Circuit()

  if (type === "board") {
    circuit.add(<UserElm />)
  } else if (type === "package") {
    circuit.add(
      <board width="10mm" height="10mm">
        <UserElm name="U1" />
      </board>,
    )
  } else if (type === "footprint") {
    circuit.add(
      <board width="10mm" height="10mm">
        <chip name="U1" footprint={<UserElm />} />
      </board>,
    )
  } else if (type === "model") {
    const jscadGeoms: any[] = []
    const { createJSCADRoot } = createJSCADRenderer(jscadPlanner as any)
    const jscadRoot = createJSCADRoot(jscadGeoms)
    jscadRoot.render(<UserElm />)
    circuit.add(
      <board width="10mm" height="10mm">
        <chip
          name="U1"
          cadModel={{
            jscad: jscadGeoms[0],
          }}
        />
      </board>,
    )
  }
  return circuit
}
