export const blankCircuitBoardTemplate = {
  type: "board",
  code: `
export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
    />
    <capacitor
      capacitance="1000pF"
      footprint="0402"
      name="C1"
    />
    <trace from=".R1 > .pin1" to=".C1 > .pin1" />
  </board>
)
`.trim(),
}
