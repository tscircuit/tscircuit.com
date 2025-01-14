export const blankPackageTemplate = {
  type: "package",
  code: `
import { createUseComponent } from "@tscircuit/core"

export const MyChip = (props: { name: string }) => (
  <chip
    {...props}
    pinLabels={pinLabels}
    footprint="soic8"
  />
)
const pinLabels = {
  "pin1": [
    "pin1"
  ],
  "pin2": [
    "pin2"
  ],
  "pin3": [
    "pin3"
  ],
  "pin4": [
    "pin4"
  ],
  "pin5": [
    "pin5"
  ],
  "pin6": [
    "pin6"
  ],
  "pin7": [
    "pin7"
  ],
  "pin8": [
    "pin8"
  ]
} as const

export const useMyChip = createUseComponent(MyChip, pinLabels)
`.trim(),
}
