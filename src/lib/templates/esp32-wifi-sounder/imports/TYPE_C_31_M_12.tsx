import type { ConnectorProps } from "@tscircuit/props"

const pinLabels = {
  pin1: "SHIELD",
  pin2: "SBU2",
  pin3: "CC1",
  pin4: "B7_DM",
  pin5: "A6_DP",
  pin6: "A7_DM",
  pin7: "B6_DP",
  pin8: "SBU1",
  pin9: "CC2",
  pin10: "GND_A",
  pin11: "GND_B",
  pin12: "VBUS_B",
  pin13: "VBUS_A",
} as const

export const TYPE_C_31_M_12 = (props: ConnectorProps) => (
  <connector
    pinLabels={pinLabels}
    manufacturerPartNumber="TYPE-C-31-M-12"
    supplierPartNumbers={{ jlcpcb: ["C165948"] }}
    footprint={usbFootprint}
    schWidth={1.8}
    schPinArrangement={{
      leftSide: {
        pins: [13, 12, 10, 11, 1, 2, 8],
        direction: "top-to-bottom",
      },
      rightSide: { pins: [5, 7, 6, 4, 3, 9], direction: "top-to-bottom" },
    }}
    noConnect={["SBU1", "SBU2"]}
    pinAttributes={{
      VBUS_A: { providesPower: true, providesVoltage: "5V" },
      GND_A: { providesGround: true },
    }}
    cadModel={{
      objUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.obj?uuid=617b05f9bba7410b96c001093d8189e4",
      stepUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.step?uuid=617b05f9bba7410b96c001093d8189e4",
      pcbRotationOffset: 180,
      modelOriginPosition: {
        x: 0,
        y: -2.7500289000000517,
        z: 0.000010999999999872223,
      },
    }}
    {...props}
  />
)

const usbFootprint = (
  <footprint insertionDirection="from_bottom">
    <hole pcbX={-2.9} pcbY={0.906} diameter={0.6} />
    <hole pcbX={2.9} pcbY={0.906} diameter={0.6} />
    {[-4.325, 4.325].map((x) => (
      <UsbShellTabs key={x} x={x} />
    ))}
    {[
      -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75, -3.2, 3.2, 2.4, -2.4,
    ].map((x, i) => (
      <UsbContact key={i} pin={i + 2} x={x} />
    ))}
    <courtyardrect width={10.35} height={8.674} pcbY={-1.263} />
  </footprint>
)
function UsbShellTabs({ x }: { x: number }) {
  return (
    <>
      <platedhole
        portHints={["pin1"]}
        pcbX={x}
        pcbY={1.406}
        shape="pill"
        holeWidth={0.8}
        holeHeight={1.5}
        outerWidth={1.2}
        outerHeight={2}
      />
      <platedhole
        portHints={["pin1"]}
        pcbX={x}
        pcbY={-2.774}
        shape="pill"
        holeWidth={0.8}
        holeHeight={1.2}
        outerWidth={1.2}
        outerHeight={1.8}
      />
    </>
  )
}
function UsbContact({ pin, x }: { pin: number; x: number }) {
  return (
    <smtpad
      portHints={["pin" + pin]}
      shape="rect"
      pcbX={x}
      pcbY={2.174}
      width={pin < 10 ? 0.3 : 0.6}
      height={1.3}
    />
  )
}
