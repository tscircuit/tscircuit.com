export const blankFootprintTemplate = {
  type: "footprint",
  code: `
export const MyFootprint = (props: any) => (
  <footprint>
    <smtpad
      shape="rect"
      width="0.5mm"
      height="0.5mm"
      schX={-1}
      schY={0}
      pcbX={-1}
      pcbY={0}
      portHints={["1"]}
    />
    <smtpad
      shape="rect"
      width="0.5mm"
      height="0.5mm"
      schX={1}
      schY={0}
      pcbX={1}
      pcbY={0}
      portHints={["2"]}
    />
  </footprint>
)
`.trim(),
}
