import { Circuit } from "@tscircuit/core"
import { useEffect, useMemo, useState } from "react"
import * as React from "react"
import { useCompiledTsx } from "../use-compiled-tsx"
import { createJSCADRenderer } from "jscad-fiber"
import { jscadPlanner } from "jscad-planner"
import { jlcPartsEngine } from "@/lib/jlc-parts-engine"

export const constructCircuit = ({
  UserElm,
  type,
  circuitDisplayName,
}: {
  UserElm: any
  type: "board" | "footprint" | "package" | "model"
  circuitDisplayName?: string
}) => {
  const circuit = new Circuit()

  if (circuitDisplayName) {
    circuit.name = circuitDisplayName
  }

  if (type === "board") {
    circuit.add(<UserElm />)
    // HACK: switch to selectOne when root fixes bug with selecting board
    const board = circuit.root?.children[0]
    // const board = circuit.selectOne("board")
    if (board) {
      console.log("board props", board.props)
      board.setProps({
        ...board.props,
        partsEngine: jlcPartsEngine,
      })
    }
  } else if (type === "package") {
    circuit.add(
      <board width="50mm" height="50mm">
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
