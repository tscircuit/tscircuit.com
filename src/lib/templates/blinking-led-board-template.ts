

export const blinkingLedBoardTemplate = {
  type: "board",
  code: `
import { Battery } from "@tsci/tscircuit.battery"
import { A555Timer } from "@tsci/tscircuit.a555timer"
import { Axial } from "@tscircuit/footprints"

export const MyCircuit = () => (
  <group>
    <Battery pcb_cx={-10} pcb_cy={0} center={[-5, 0]} name="BAT" voltage="9V" />
    <A555Timer name="B1" />
    <resistor
      name="R1"
      resistance="1K"
      x={-2.5}
      y={-1}
      rotation="90deg"
      footprint="0805"
      pcb_cx={-8}
      pcb_cy={8}
      // footprint={<Axial spread="0.2in" />}
    />
    <resistor
      name="R2"
      resistance="470K"
      x={-2.5}
      y={1}
      pcb_cx={0}
      pcb_cy={-8}
      rotation="90deg"
      footprint="0805"
    />
    <resistor
      name="R3"
      resistance="1K"
      x={2}
      y={1}
      pcb_x={2.5}
      pcb_y={8}
      rotation="90deg"
      footprint="0805"
    />
    <diode
      name="D1"
      x={2}
      y={3}
      pcb_cx={7}
      pcb_cy={3}
      rotation="90deg"
      footprint="0805"
      pcb_rotation="90deg"
    />
    <capacitor
      name="C1"
      capacitance="1uF"
      x={-2.5}
      y={3}
      pcb_cx={-2.5}
      pcb_cy={8}
      rotation="90deg"
      footprint="0805"
    />
    <trace
      from=".BAT > .plus"
      to=".R1 > .left"
      schematic_route_hints={[{ x: -5, y: -2 }]}
    />
    <trace
      from=".R1 > .right"
      to=".R2 > .left"
      pcb_route_hints={[
        {
          x: -7,
          y: 0,
        },
      ]}
    />
    <trace
      from=".R2 > .right"
      to=".C1 > .left"
      pcb_route_hints={[
        {
          x: 3,
          y: -7,
        },
        {
          x: 9,
          y: 0,
        },
        {
          x: 9,
          y: 9,
        },
        {
          x: -3.5,
          y: 9.5,
        },
      ]}
    />
    <trace
      from=".C1 > .right"
      to=".BAT > .minus"
      schematic_route_hints={[
        {
          x: -5,
          y: 3.8,
        },
      ]}
    />
    <trace from=".C1 > .right" to=".D1 > .right" />
    <trace
      from=".B1 > .DISCH"
      to=".R1 > .right"
      schematic_route_hints={[
        {
          x: 1,
          y: 0.25,
        },
        {
          x: -2,
          y: -1.5,
        },
      ]}
    />
    <trace
      from=".B1 > .THRES"
      to=".R2 > .right"
      schematic_route_hints={[
        {
          x: 1.4,
          y: -0.25,
        },
      ]}
    />
    <trace
      from=".B1 > .TRIG"
      to=".R2 > .right"
      schematic_route_hints={[
        {
          x: -1.5,
          y: -0.25,
        },
      ]}
    />
    <trace
      from=".B1 > .OUT"
      to=".R3 > .left"
      schematic_route_hints={[
        {
          x: -1.2,
          y: 0.25,
        },
        {
          x: -1.2,
          y: 1.2,
        },
        {
          x: 1.2,
          y: 1.2,
        },
      ]}
    />
    <trace
      from=".R3 > .right"
      to=".D1 > .left"
      pcb_route_hints={[
        {
          x: 7,
          y: 8,
        },
        {
          x: 8,
          y: 6,
        },
        {
          x: 8,
          y: 3,
        },
      ]}
    />
    <trace from=".D1 > .right" to=".C1 > .right" />
    <trace
      from=".B1 > .GND"
      to=".C1 > .right"
      schematic_route_hints={[{ x: -1.8, y: -0.7 }]}
    />
  </group>
)
`.trim(),
}
