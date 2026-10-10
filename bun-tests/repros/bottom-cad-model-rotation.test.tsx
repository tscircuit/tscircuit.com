import { expect, test } from "bun:test"
import { Circuit } from "@tscircuit/core"

/**
 * Reproduces the U_USB_ESD placement from
 * ShiboSoftwareDev/nema8-20mm-dual-usbc-stepper-controller.
 *
 * The component and imported model both have a 90 degree PCB rotation. On the
 * bottom layer those rotations must be composed as modelOffset - pcbRotation,
 * which leaves the CAD model at 0 degrees around Z. Older core versions add
 * the rotations before negating them and emit 180 degrees instead.
 */
const renderRepro = () => {
  const circuit = new Circuit()

  circuit.add(
    <board width="10mm" height="10mm">
      <chip
        name="U_USB_ESD"
        layer="bottom"
        pcbX={0}
        pcbY={0}
        pcbRotation={90}
        pinLabels={{
          pin1: ["DM_IN"],
          pin2: ["GND"],
          pin3: ["DP_IN"],
          pin4: ["DP_OUT"],
          pin5: ["VBUS"],
          pin6: ["DM_OUT"],
        }}
        footprint={
          <footprint>
            <smtpad
              portHints={["pin1"]}
              pcbX={1.15}
              pcbY={-0.95}
              width={1.07}
              height={0.53}
              shape="rect"
            />
            <smtpad
              portHints={["pin2"]}
              pcbX={1.15}
              pcbY={0}
              width={1.07}
              height={0.53}
              shape="rect"
            />
            <smtpad
              portHints={["pin3"]}
              pcbX={1.15}
              pcbY={0.95}
              width={1.07}
              height={0.53}
              shape="rect"
            />
            <smtpad
              portHints={["pin4"]}
              pcbX={-1.15}
              pcbY={0.95}
              width={1.07}
              height={0.53}
              shape="rect"
            />
            <smtpad
              portHints={["pin5"]}
              pcbX={-1.15}
              pcbY={0}
              width={1.07}
              height={0.53}
              shape="rect"
            />
            <smtpad
              portHints={["pin6"]}
              pcbX={-1.15}
              pcbY={-0.95}
              width={1.07}
              height={0.53}
              shape="rect"
            />
          </footprint>
        }
        cadModel={{
          objUrl:
            "https://modelcdn.tscircuit.com/easyeda_models/assets/C7519.obj",
          pcbRotationOffset: 90,
          modelOriginPosition: { x: 0, y: 0, z: -0.048939 },
        }}
      />
    </board>,
  )
  circuit.render()

  const circuitJson = circuit.getCircuitJson()
  const cadComponent = circuitJson.find(
    (element) => element.type === "cad_component",
  )

  return cadComponent
}

test("bottom CAD rotation repro creates a CAD component", () => {
  expect(renderRepro()).toBeDefined()
})

test.failing(
  "bottom CAD rotation subtracts the PCB rotation from the model offset",
  () => {
    const cadComponent = renderRepro()

    expect(cadComponent?.rotation).toEqual({ x: 0, y: 180, z: 0 })
  },
)
