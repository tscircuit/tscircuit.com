import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["SHDN", "SHUTDOWN"],
  pin2: ["BYP", "BYPASS"],
  pin3: ["IN_P", "IN_POS"],
  pin4: ["IN_N", "IN_NEG"],
  pin5: ["OUT1", "VO1"],
  pin6: ["VDD"],
  pin7: ["GND"],
  pin8: ["OUT2", "VO2"],
} as const

const pinAttributes = {
  pin6: { requiresPower: true },
  pin7: { requiresGround: true },
} as const

export const LM4861MX_NOPB = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C7958"],
      }}
      manufacturerPartNumber="LM4861MX/NOPB"
      footprint="soic8_w7mm_pl1.8mm_pw0.59mm_p1.27mm_widthincludeslegs"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C7958.obj?uuid=ec3b9f9b31a74655be3e55848dbee9c1",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C7958.step?uuid=ec3b9f9b31a74655be3e55848dbee9c1",
        pcbRotationOffset: -90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: 0 },
      }}
      schWidth={1.7}
      schPinArrangement={{
        leftSide: { pins: [4, 3, 2], direction: "top-to-bottom" },
        rightSide: { pins: [5, 8], direction: "top-to-bottom" },
        bottomSide: { pins: [1, 7, 6], direction: "left-to-right" },
      }}
      {...props}
    />
  )
}
