import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["VIN"],
  pin2: ["GND"],
  pin3: ["EN"],
  pin4: ["NC"],
  pin5: ["VOUT"],
} as const

const pinAttributes = {
  pin1: {
    isInput: true,
    requiresPower: true,
    mustBeConnected: true,
    shouldHaveDecouplingCapacitor: true,
    recommendedDecouplingCapacitorCapacitance: "1uF",
  },
  pin2: { requiresGround: true, mustBeConnected: true },
  pin4: { doNotConnect: true },
  pin5: {
    isOutput: true,
    providesPower: true,
    providesVoltage: "3.3V",
    shouldHaveDecouplingCapacitor: true,
    recommendedDecouplingCapacitorCapacitance: "1uF",
  },
  pin3: { isInput: true },
} satisfies NonNullable<ChipProps["pinAttributes"]>

export const AP2112K_3_3TRG1 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
        jlcpcb: ["C51118"],
      }}
      manufacturerPartNumber="AP2112K-3.3TRG1"
      footprint="sot23_5"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C51118.obj?uuid=6d166d1d6c064b99aa79465714e989c1",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C51118.step?uuid=6d166d1d6c064b99aa79465714e989c1",
        pcbRotationOffset: -90,
        modelOriginPosition: { x: -0.000012700000070253736, y: 0, z: -0.15 },
      }}
      schPinArrangement={{
        leftSide: { pins: [1, 3], direction: "top-to-bottom" },
        rightSide: { pins: [5, 4], direction: "top-to-bottom" },
        bottomSide: { pins: [2], direction: "left-to-right" },
      }}
      noConnect={["NC"]}
      {...props}
    />
  )
}
