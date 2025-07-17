export const blankPackageTemplate = {
  type: "package",
  code: `
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: [],
  pin2: [],
  pin3: [],
  pin4: [],
  pin5: [],
  pin6: [],
  pin7: [],
  pin8: [],
} as const

export const MyChip = (props: ChipProps<typeof pinLabels>) => (
  <chip footprint="soic8" pinLabels={pinLabels} {...props} />
)
`.trim(),
}
