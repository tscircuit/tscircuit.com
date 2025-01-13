export const blankPackageTemplate = {
  type: "package",
  code: `
  import { createUseComponent } from "@tscircuit/core"

export const MyChip = (props: { name: string }) => (
  <chip
    {...props}
    name="U1"
        pinLabels={pinLabels}
        schX={0}
        schY={0}
        pcbX={0}
        pcbY={0}
    footprint="soic8"
  />
)
  const pinLabels = {
  "pin1": [
    "pin1",
    "RESET"
  ],
  "pin2": [
    "pin2",
    "XTAL1"
  ],
  "pin3": [
    "pin3",
    "AVCC"
  ],
  "pin4": [
    "pin4",
    "VCC"
  ],
  "pin5": [
    "pin5",
    "GND"
  ],

  "pin6": [
    "pin6",
    "PAD"
  ],
  "pin7": [
    "pin7",
    "AGND"
  ],
  "pin8": [
    "pin8",
    "GND3"
  ]
} as const

export const useMyChip = createUseComponent(MyChip, pinLabels)
`.trim(),
}
