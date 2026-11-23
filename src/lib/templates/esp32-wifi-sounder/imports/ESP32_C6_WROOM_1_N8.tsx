import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: "GND1",
  pin2: "VDD",
  pin3: "EN",
  pin4: "IO4",
  pin5: "IO5",
  pin6: "IO6",
  pin7: "IO7",
  pin8: "IO0",
  pin9: "IO1",
  pin10: "IO8",
  pin11: "IO10",
  pin12: "IO11",
  pin13: "IO12",
  pin14: "IO13",
  pin15: "IO9",
  pin16: "IO18",
  pin17: "IO19",
  pin18: "IO20",
  pin19: "IO21",
  pin20: "IO22",
  pin21: "IO23",
  pin22: "NC",
  pin23: "IO15",
  pin24: "RXD0",
  pin25: "TXD0",
  pin26: "IO3",
  pin27: "IO2",
  pin28: "GND2",
  pin29: "EP",
} as const

export const ESP32_C6_WROOM_1_N8 = (props: ChipProps<typeof pinLabels>) => (
  <chip
    pinLabels={pinLabels}
    manufacturerPartNumber="ESP32-C6-WROOM-1-N8"
    supplierPartNumbers={{ jlcpcb: ["C5366877"] }}
    footprint={wifiFootprint}
    schPinArrangement={{
      leftSide: { pins: [3, 15, 10, 13, 14], direction: "top-to-bottom" },
      rightSide: { pins: [11, 1, 28, 29], direction: "top-to-bottom" },
      topSide: { pins: [2], direction: "left-to-right" },
    }}
    internallyConnectedPins={[["GND1", "GND2", "EP"]]}
    noConnect={["NC"]}
    pinAttributes={{
      VDD: { requiresPower: true, requiresVoltage: "3.3V" },
      GND1: { requiresGround: true },
      GND2: { requiresGround: true },
      EP: { requiresGround: true },
      IO10: { isGpio: true },
    }}
    cadModel={{
      stepUrl:
        "https://raw.githubusercontent.com/espressif/kicad-libraries/d5b68fd9269c639b3a60681e00b91df33b4db4a3/3dmodels/espressif.3dshapes/ESP32-C6-WROOM-1.STEP",
      modelOriginPosition: { x: 9, y: 9.75, z: 0 },
    }}
    {...props}
  />
)

function CastellatedPad({ pin }: { pin: number }) {
  const left = pin <= 14
  return (
    <smtpad
      portHints={["pin" + pin]}
      shape="rect"
      width={1.5}
      height={0.9}
      pcbX={left ? -8.75 : 8.75}
      pcbY={left ? 8.255 - (pin - 1) * 1.27 : -8.255 + (pin - 15) * 1.27}
    />
  )
}

const wifiFootprint = (
  <footprint>
    {Array.from({ length: 28 }, (_, i) => (
      <CastellatedPad key={i} pin={i + 1} />
    ))}
    {/* Espressif splits exposed pad 29 into nine grounded lands. */}
    {Array.from({ length: 9 }, (_, i) => (
      <ExposedGroundPad
        key={i}
        x={-2.755 + 1.25 * (i % 3)}
        y={1.29 + 1.25 * Math.floor(i / 3)}
      />
    ))}
    <silkscreenrect pcbY={3} width={18} height={25.5} />
    <courtyardrect pcbY={3} width={19.5} height={26.1} />
  </footprint>
)
function ExposedGroundPad({ x, y }: { x: number; y: number }) {
  return (
    <>
      <smtpad
        portHints={["pin29"]}
        shape="rect"
        pcbX={x}
        pcbY={y}
        width={0.8}
        height={0.8}
      />
      <via
        connectsTo="net.GND"
        pcbX={x}
        pcbY={y}
        holeDiameter={0.3}
        outerDiameter={0.6}
        tented="bottom_tented"
      />
    </>
  )
}
