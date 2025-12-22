export const analogSimulationTemplate = {
  type: "board",
  code: `
export default () => (
  <board width="20mm" height="20mm">
    <analogsimulation duration={0.01} timePerStep={1e-6} />
    
    <voltagesource
      name="V1"
      voltage="5V"
      waveShape="sine"
      frequency="1kHz"
      amplitude="5V"
      offset="0V"
    />
    <resistor name="R1" resistance="1k" footprint="0402" />
    <capacitor name="C1" capacitance="1uF" footprint="0402" />
    <ground name="GND" />

    <trace from=".V1 > .pos" to=".R1 > .pin1" />
    <trace from=".R1 > .pin2" to=".C1 > .pin1" />
    <trace from=".C1 > .pin2" to=".GND > .pin1" />
    <trace from=".V1 > .neg" to=".GND > .pin1" />

    <voltageprobe connectsTo=".R1 > .pin2" />
  </board>
)
`.trim(),
}
