// Parts in imports/ were generated with `tsci import <JLCPCB part number>`
export const esp32BluetoothSpeakerTemplate = {
  type: "board",
  code: `
import { AMS1117_3_3 } from "./imports/AMS1117_3_3"
import { ESP32_WROOM_32E_N8 } from "./imports/ESP32_WROOM_32E_N8"
import { MAX98357AETE_T } from "./imports/MAX98357AETE_T"

// ESP32 Bluetooth speaker: plug in USB-C, pair your phone, play music.
// Parts are placed by hand and every trace is autorouted, so try moving one.
export default () => (
  <board width="50mm" height="34mm">
    <schematicsection name="power" displayName="POWER" />
    <schematicsection name="esp32" displayName="ESP32" />
    <schematicsection name="audio" displayName="AUDIO" />

    {/* USB-C input, the 5.1k CC resistors ask the charger for 5V */}
    <connector
      name="J1"
      schSectionName="power"
      standard="usb_c"
      supplierPartNumbers={{ jlcpcb: ["C165948"] }}
      pcbX={-19}
      pcbY={9}
      pcbRotation={-90}
      connections={{
        VBUS1: "net.V5",
        VBUS2: "net.V5",
        GND1: "net.GND",
        GND2: "net.GND",
        SHELL1: "net.GND",
        SHELL2: "net.GND",
        SHELL3: "net.GND",
        SHELL4: "net.GND",
      }}
    />
    <resistor
      name="R1"
      schSectionName="power"
      resistance="5.1k"
      footprint="0603"
      pcbX={-13.5}
      pcbY={10.25}
      connections={{ pin1: "J1.CC1", pin2: "net.GND" }}
    />
    <resistor
      name="R2"
      schSectionName="power"
      resistance="5.1k"
      footprint="0603"
      pcbX={-13.5}
      pcbY={7.25}
      connections={{ pin1: "J1.CC2", pin2: "net.GND" }}
    />

    {/* 5V to 3.3V regulator for the ESP32 */}
    <AMS1117_3_3
      name="U3"
      schSectionName="power"
      pcbX={-6}
      pcbY={10}
      pcbRotation={180}
      connections={{
        VIN: "net.V5",
        VOUT1: "net.V3V3",
        VOUT2: "net.V3V3",
        GND: "net.GND",
      }}
    />
    <capacitor
      name="C1"
      schSectionName="power"
      capacitance="10uF"
      footprint="0603"
      pcbX={-9}
      pcbY={4.5}
      connections={{ pin1: "net.V5", pin2: "net.GND" }}
    />

    {/* ESP32 receives Bluetooth audio and streams it to the amp over I2S */}
    <ESP32_WROOM_32E_N8
      name="U2"
      schSectionName="esp32"
      pcbX={14}
      pcbY={-0.5}
      pcbRotation={-90}
      connections={{
        "3V3": "net.V3V3",
        GND1: "net.GND",
        GND2: "net.GND",
        GND3: "net.GND",
        GND4: "net.GND",
        EN: "net.EN",
        IO0: "net.IO0",
        TXD0: "net.TX",
        RXD0: "net.RX",
        IO26: "net.BCLK",
        IO25: "net.LRCLK",
        IO22: "net.DIN",
      }}
    />
    <capacitor
      name="C2"
      schSectionName="esp32"
      capacitance="10uF"
      footprint="0603"
      pcbX={1}
      pcbY={12}
      pcbRotation={90}
      connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
    />
    {/* RC delay on EN so the ESP32 resets cleanly at power-up */}
    <resistor
      name="R3"
      schSectionName="esp32"
      resistance="10k"
      footprint="0603"
      pcbX={1.5}
      pcbY={7.5}
      connections={{ pin1: "net.V3V3", pin2: "net.EN" }}
    />
    <capacitor
      name="C3"
      schSectionName="esp32"
      capacitance="1uF"
      footprint="0603"
      pcbX={1.5}
      pcbY={5.5}
      connections={{ pin1: "net.EN", pin2: "net.GND" }}
    />
    {/* Programming header for a USB-UART adapter (hold IO0 low to flash) */}
    <pinheader
      name="J3"
      schSectionName="esp32"
      pinCount={5}
      pinLabels={["GND", "TX", "RX", "EN", "IO0"]}
      pcbX={14}
      pcbY={-14}
      connections={{
        GND: "net.GND",
        TX: "net.TX",
        RX: "net.RX",
        EN: "net.EN",
        IO0: "net.IO0",
      }}
    />

    {/* 3W class-D amp, the 1M on SD_MODE mixes L+R into mono */}
    <MAX98357AETE_T
      name="U1"
      schSectionName="audio"
      pcbX={-10}
      pcbY={-6}
      pcbRotation={90}
      connections={{
        VDD1: "net.V5",
        VDD2: "net.V5",
        GND1: "net.GND",
        GND2: "net.GND",
        GND3: "net.GND",
        EP: "net.GND",
        BCLK: "net.BCLK",
        LRCLK: "net.LRCLK",
        DIN: "net.DIN",
        N_SD_MODE: "net.SD_MODE",
        OUTP: "J2.pin1",
        OUTN: "J2.pin2",
      }}
    />
    <resistor
      name="R4"
      schSectionName="audio"
      resistance="1M"
      footprint="0603"
      pcbX={-6}
      pcbY={-8}
      connections={{ pin1: "net.V5", pin2: "net.SD_MODE" }}
    />
    <capacitor
      name="C4"
      schSectionName="audio"
      capacitance="10uF"
      footprint="0603"
      pcbX={-10}
      pcbY={-2}
      connections={{ pin1: "net.V5", pin2: "net.GND" }}
    />
    {/* 4-8 ohm speaker */}
    <connector
      name="J2"
      schSectionName="audio"
      footprint="jst2_ph"
      pcbX={-22}
      pcbY={-6}
      pcbRotation={90}
    />
  </board>
)
`.trim(),
  files: {
    "imports/AMS1117_3_3.tsx": `
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["GND"],
  pin2: ["VOUT1"],
  pin3: ["VIN"],
  pin4: ["VOUT2"]
} as const

const pinAttributes = {
  pin1: {capabilities: [], requiresGround: true, requiresVoltage: 0, mustBeConnected: true},
  pin3: {isInput: true, capabilities: [], requiresPower: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true},
  pin2: {isOutput: true, capabilities: [], providesPower: true, providesVoltage: 3.3, shouldHaveDecouplingCapacitor: true, recommendedDecouplingCapacitorCapacitance: "22uF"},
  pin4: {isOutput: true, capabilities: [], providesPower: true, providesVoltage: 3.3}
} satisfies NonNullable<ChipProps["pinAttributes"]>

export const AMS1117_3_3 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C6186"
  ]
}}
      manufacturerPartNumber="AMS1117-3.3"
      footprint="sot223_w8.0599mm_p2.3mm_pl2.5mm_pw1.1mm_tabpl2.34mm_tabpw3.6mm_taboffset0.08mm_rounded0_pin1location(rightside,bottom)"
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C6186.obj?uuid=e80246a9471445bfb635be848806a22e",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C6186.step?uuid=e80246a9471445bfb635be848806a22e",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: -0.14002385000003414, y: -0.000012700000070253736, z: -0.049394 },
      }}
      {...props}
    />
  )
}
`.trim(),
    "imports/ESP32_WROOM_32E_N8.tsx": `
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["GND1"],
  pin2: ["3V3"],
  pin3: ["EN"],
  pin4: ["SENSOR_VP"],
  pin5: ["SENSOR_VN"],
  pin6: ["IO34"],
  pin7: ["IO35"],
  pin8: ["IO32"],
  pin9: ["IO33"],
  pin10: ["IO25"],
  pin11: ["IO26"],
  pin12: ["IO27"],
  pin13: ["IO14"],
  pin14: ["IO12"],
  pin15: ["GND2"],
  pin16: ["IO13"],
  pin17: ["NC1"],
  pin18: ["NC2"],
  pin19: ["NC3"],
  pin20: ["NC4"],
  pin21: ["NC5"],
  pin22: ["NC6"],
  pin23: ["IO15"],
  pin24: ["IO2"],
  pin25: ["IO0"],
  pin26: ["IO4"],
  pin27: ["IO16"],
  pin28: ["IO17"],
  pin29: ["IO5"],
  pin30: ["IO18"],
  pin31: ["IO19"],
  pin32: ["NC7"],
  pin33: ["IO21"],
  pin34: ["RXD0"],
  pin35: ["TXD0"],
  pin36: ["IO22"],
  pin37: ["IO23"],
  pin38: ["GND3"],
  pin39: ["GND4"]
} as const

const pinAttributes = {
  pin1: {requiresGround: true},
  pin15: {requiresGround: true},
  pin17: {doNotConnect: true},
  pin18: {doNotConnect: true},
  pin19: {doNotConnect: true},
  pin20: {doNotConnect: true},
  pin21: {doNotConnect: true},
  pin22: {doNotConnect: true},
  pin32: {doNotConnect: true},
  pin38: {requiresGround: true},
  pin39: {requiresGround: true}
} as const

export const ESP32_WROOM_32E_N8 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C701342"
  ]
}}
      manufacturerPartNumber="ESP32-WROOM-32E-N8"
      footprint={<footprint>
        <smtpad portHints={["pin1"]} pcbX="-9.29001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin2"]} pcbX="-8.02001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin3"]} pcbX="-6.75001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin4"]} pcbX="-5.48001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin5"]} pcbX="-4.21001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-2.94001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-1.67001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0.40001825mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="0.86998175mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="2.13998175mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="3.40998175mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin12"]} pcbX="4.67998175mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin13"]} pcbX="5.94998175mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin14"]} pcbX="7.21998175mm" pcbY="-9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin15"]} pcbX="8.71502575mm" pcbY="-5.714873mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin16"]} pcbX="8.71502575mm" pcbY="-4.444873mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin17"]} pcbX="8.71502575mm" pcbY="-3.174873mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin18"]} pcbX="8.71502575mm" pcbY="-1.904873mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin19"]} pcbX="8.71502575mm" pcbY="-0.634873mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin20"]} pcbX="8.71502575mm" pcbY="0.635127mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin21"]} pcbX="8.71502575mm" pcbY="1.905127mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin22"]} pcbX="8.71502575mm" pcbY="3.175127mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin23"]} pcbX="8.71502575mm" pcbY="4.445127mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin24"]} pcbX="8.71502575mm" pcbY="5.715127mm" width="2.0999958mm" height="0.9500108mm" shape="rect" />
<smtpad portHints={["pin25"]} pcbX="7.21998175mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin26"]} pcbX="5.94998175mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin27"]} pcbX="4.67998175mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin28"]} pcbX="3.40998175mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin29"]} pcbX="2.13998175mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin30"]} pcbX="0.86998175mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin31"]} pcbX="-0.40001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin32"]} pcbX="-1.67001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin33"]} pcbX="-2.94001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin34"]} pcbX="-4.21001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin35"]} pcbX="-5.48001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin36"]} pcbX="-6.75001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin37"]} pcbX="-8.02001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin38"]} pcbX="-9.29001825mm" pcbY="9.000109mm" width="0.9500108mm" height="2.0999958mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-1.60905825mm" pcbY="-1.500251mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-1.60905825mm" pcbY="-2.900045mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-1.60905825mm" pcbY="-0.099949mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-3.00910625mm" pcbY="-0.099949mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-3.00910625mm" pcbY="-1.499997mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-3.00910625mm" pcbY="-2.900045mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-0.20901025mm" pcbY="-2.900045mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-0.20901025mm" pcbY="-1.499997mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<smtpad portHints={["pin39"]} pcbX="-0.20901025mm" pcbY="-0.099949mm" width="0.8999982mm" height="0.8999982mm" shape="rect" />
<silkscreenpath route={[{"x":-16.764019050000115,"y":9.000083599999925},{"x":-10.298118850000037,"y":9.000083599999925}]} />
<silkscreenpath route={[{"x":-16.764019050000115,"y":-8.999931199999992},{"x":-10.314044649999914,"y":-8.999931199999992}]} />
<silkscreenpath route={[{"x":-16.764019050000115,"y":9.000083599999925},{"x":-16.764019050000115,"y":-8.999931199999992}]} />
<silkscreenpath route={[{"x":-10.480059050000023,"y":9.000083599999925},{"x":-10.480059050000023,"y":-8.999931199999992}]} />
<silkscreenpath route={[{"x":-9.971195449999868,"y":9.01707620000002},{"x":-10.480059050000023,"y":9.01707620000002}]} />
<silkscreenpath route={[{"x":8.73595535000004,"y":6.396227999999837},{"x":8.73595535000004,"y":9.01707620000002},{"x":7.901158950000081,"y":9.01707620000002}]} />
<silkscreenpath route={[{"x":7.901158950000081,"y":-8.999931199999992},{"x":8.73595535000004,"y":-8.999931199999992},{"x":8.73595535000004,"y":-6.396050199999991}]} />
<silkscreenpath route={[{"x":-10.480059050000023,"y":-8.999931199999992},{"x":-9.971195449999868,"y":-8.999931199999992}]} />
<silkscreentext text="{NAME}" pcbX="-3.53768025mm" pcbY="11.040747mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-17.06603825000002,"y":10.30010690000006},{"x":10.015023650000103,"y":10.30010690000006},{"x":10.015023650000103,"y":-10.300106899999946},{"x":-17.06603825000002,"y":-10.300106899999946},{"x":-17.06603825000002,"y":10.30010690000006}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C701342.obj?uuid=cad43509223249168514859e4520db8a",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C701342.step?uuid=cad43509223249168514859e4520db8a",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: -4.066063750000012, y: 0, z: 0 },
      }}
      {...props}
    />
  )
}
`.trim(),
    "imports/MAX98357AETE_T.tsx": `
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["DIN"],
  pin2: ["GAIN_SLOT"],
  pin3: ["GND1"],
  pin4: ["N_SD_MODE"],
  pin5: ["N_C_1"],
  pin6: ["N_C_2"],
  pin7: ["VDD1"],
  pin8: ["VDD2"],
  pin9: ["OUTP"],
  pin10: ["OUTN"],
  pin11: ["GND2"],
  pin12: ["N_C_3"],
  pin13: ["N_C_4"],
  pin14: ["LRCLK"],
  pin15: ["GND3"],
  pin16: ["BCLK"],
  pin17: ["EP"]
} as const

const pinAttributes = {
  pin3: {requiresGround: true, mustBeConnected: true},
  pin11: {requiresGround: true, mustBeConnected: true},
  pin15: {requiresGround: true, mustBeConnected: true},
  pin1: {isInput: true},
  pin2: {isInput: true},
  pin4: {isInput: true},
  pin5: {doNotConnect: true},
  pin6: {doNotConnect: true},
  pin7: {requiresPower: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true},
  pin8: {requiresPower: true, mustBeConnected: true, shouldHaveDecouplingCapacitor: true},
  pin9: {isOutput: true},
  pin10: {isOutput: true},
  pin12: {doNotConnect: true},
  pin13: {doNotConnect: true},
  pin14: {isInput: true},
  pin16: {isInput: true},
  pin17: {requiresGround: true, mustBeConnected: true}
} satisfies NonNullable<ChipProps["pinAttributes"]>

const footprinterPinLabels = {
  ...pinLabels,
  "pin17": [...pinLabels["pin17"], "thermalpad"],
} as const

export const MAX98357AETE_T = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={footprinterPinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C910544"
  ]
}}
      manufacturerPartNumber="MAX98357AETE+T"
      footprint="qfn16_thermalpad1.5mmx1.5mm_h3.8mm_pl0.6mm_pin1location(bottomside,left)"
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C910544.obj?uuid=edc2f28e721b49ee8c25b04b981b88c3",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C910544.step?uuid=edc2f28e721b49ee8c25b04b981b88c3",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: -0.000012699999842880061, y: 0, z: -0.01 },
      }}
      {...props}
    />
  )
}
`.trim(),
  },
}
