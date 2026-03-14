export const TEMPLATES: Record<string, { code: string; preview: string }> = {
  "board.circuit.tsx": {
    code: `export default () => (
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
      connections={{ pin1: "R1.pin1" }}
    />
  </board>
)`,
    preview:
      "https://svg.tscircuit.com/?svg_type=3d&format=png&code=H4sIAPh6sGkAA5WQsQ6CMBCGX%2BXSCRYoxokAi4kP4MxSaZFGuTZtjSSEd7cVi6xu99%2F9%2Be6%2Fm4lELqbM2YmURExaGQdc9Oz5cJCkUDeQtAhQXRUzHF6Su6FuSUHHsSUwCHkb3Kab4PReI6y0TplVAqyaYSeC9d6SOOiVctpIDAh6pIffBNkYzJcitvII75hmndzRv42Ip5Tq8x8rTtsKj1KIonNSoa3nGbTEooSQIgulP3hZ9mmq%2FPMVX6dkeQPpRRS8SgEAAA%3D%3D",
  },
  "motordriver.circuit.tsx": {
    code: `export default () => (
  <board width="10mm" height="10mm">
    <resistor
      resistance="1k"
      footprint="0402"
      name="R1"
    />

  </board>
)`,
    preview:
      "https://svg.tscircuit.com/?svg_type=3d&format=png&code=H4sIAPh6sGkAA5WQsQ6CMBCGX%2BXSCRYoxokAi4kP4MxSaZFGuTZtjSSEd7cVi6xu99%2F9%2Be6%2Fm4lELqbM2YmURExaGQdc9Oz5cJCkUDeQtAhQXRUzHF6Su6FuSUHHsSUwCHkb3Kab4PReI6y0TplVAqyaYSeC9d6SOOiVctpIDAh6pIffBNkYzJcitvII75hmndzRv42Ip5Tq8x8rTtsKj1KIonNSoa3nGbTEooSQIgulP3hZ9mmq%2FPMVX6dkeQPpRRS8SgEAAA%3D%3D",
  },
  "keyboard.circuit.tsx": {
    code: `export default () => (
  <board width="10mm" height="10mm">
  </board>
)`,
    preview:
      "https://svg.tscircuit.com/?svg_type=3d&format=png&code=H4sIAPh6sGkAA5WQsQ6CMBCGX%2BXSCRYoxokAi4kP4MxSaZFGuTZtjSSEd7cVi6xu99%2F9%2Be6%2Fm4lELqbM2YmURExaGQdc9Oz5cJCkUDeQtAhQXRUzHF6Su6FuSUHHsSUwCHkb3Kab4PReI6y0TplVAqyaYSeC9d6SOOiVctpIDAh6pIffBNkYzJcitvII75hmndzRv42Ip5Tq8x8rTtsKj1KIonNSoa3nGbTEooSQIgulP3hZ9mmq%2FPMVX6dkeQPpRRS8SgEAAA%3D%3D",
  },
}
