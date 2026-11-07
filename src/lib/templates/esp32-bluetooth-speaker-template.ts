// Parts in imports/ were generated with `tsci import <JLCPCB part number>`
export const esp32BluetoothSpeakerTemplate = {
  type: "board",
  code: `
import { systemblock } from "tscircuit"
import { AMS1117_3_3 } from "./imports/AMS1117_3_3"
import { ESP32_WROOM_32E_N8 } from "./imports/ESP32_WROOM_32E_N8"
import { KF350_3_5_2P } from "./imports/KF350_3_5_2P"
import { MAX98357AETE_T } from "./imports/MAX98357AETE_T"
import { TYPE_C_31_M_12 } from "./imports/TYPE_C_31_M_12"

// ESP32 Bluetooth speaker: plug in USB-C, pair your phone, play music.
// Parts are placed by hand and every trace is autorouted, so try moving one.
export default () => (
  <board width="50mm" height="34mm">
    <schematicsection name="power" displayName="POWER" />
    <schematicsection name="esp32" displayName="ESP32" />
    <schematicsection name="audio" displayName="AUDIO" />

    {/* USB-C input, the 5.1k CC resistors ask the charger for 5V */}
    <TYPE_C_31_M_12
      name="USB1"
      schSectionName="power"
      pcbX={-19.3}
      pcbY={9}
      pcbRotation={-90}
      connections={{
        VBUS1: "net.V5",
        VBUS2: "net.V5",
        GND1: "net.GND",
        GND2: "net.GND",
        EH1: "net.GND",
        EH2: "net.GND",
        EH3: "net.GND",
        EH4: "net.GND",
      }}
    />
    <resistor
      name="R1"
      schSectionName="power"
      resistance="5.1k"
      footprint="0603"
      pcbX={-13.5}
      pcbY={10.25}
      connections={{ pin1: "USB1.CC1", pin2: "net.GND" }}
    />
    <resistor
      name="R2"
      schSectionName="power"
      resistance="5.1k"
      footprint="0603"
      pcbX={-13.5}
      pcbY={7.25}
      connections={{ pin1: "USB1.CC2", pin2: "net.GND" }}
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
      supplierPartNumbers={{ jlcpcb: ["C492404"] }}
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
    {["GND", "TX", "RX", "EN", "IO0"].map((label, i) => (
      <silkscreentext
        key={label}
        text={label}
        fontSize="0.8mm"
        pcbX={8.92 + i * 2.54}
        pcbY={-15.6}
      />
    ))}
    <silkscreentext
      text="USB-UART PROGRAMMER"
      anchorAlignment="center_right"
      fontSize="1mm"
      pcbX={7.6}
      pcbY={-14}
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
        OUTP: "P1.pin1",
        OUTN: "P1.pin2",
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
    {/* Screw terminal for the wires of a 4-8 ohm speaker */}
    <KF350_3_5_2P
      name="P1"
      schSectionName="audio"
      pcbX={-21.2}
      pcbY={-6}
      pcbRotation={-90}
    />
    <silkscreentext text="SPEAKER" fontSize="1mm" pcbX={-21} pcbY={-1.2} />
    <silkscreentext text="+" fontSize="1.2mm" pcbX={-16.8} pcbY={-4.25} />
    <silkscreentext text="-" fontSize="1.2mm" pcbX={-16.8} pcbY={-7.75} />

    {/* Overview of the design, open the System tab to see it */}
    <systemblock.page name="overview" displayName="ESP32 Bluetooth speaker">
      <systemblock.component
        name="phone"
        displayName="Phone"
        description="Plays the music"
      />
      <systemblock.component
        name="usb"
        displayName="USB-C input"
        description="5V from any charger"
        pcbComponentNames={["USB1", "R1", "R2"]}
      />
      <systemblock.component
        name="regulator"
        displayName="3.3V regulator"
        description="Powers the ESP32"
        pcbComponentNames={["U3", "C1"]}
      />
      <systemblock.component
        name="esp32"
        displayName="ESP32"
        description="Receives Bluetooth audio"
        pcbComponentNames={["U2", "C2", "R3", "C3"]}
      />
      <systemblock.component
        name="programmer"
        displayName="Programming header"
        description="Flashes the firmware"
        pcbComponentName="J3"
      />
      <systemblock.component
        name="amp"
        displayName="Class-D amp"
        description="Turns I2S into 3W of audio"
        pcbComponentNames={["U1", "R4", "C4"]}
      />
      <systemblock.component
        name="speaker"
        displayName="Speaker"
        description="4-8 ohm, on a screw terminal"
        pcbComponentName="P1"
      />
      <systemblock.connection from="phone" to="esp32" label="Bluetooth" />
      <systemblock.connection
        from="programmer"
        to="esp32"
        label="UART"
        direction="both"
      />
      <systemblock.connection from="esp32" to="amp" label="I2S" />
      <systemblock.connection from="amp" to="speaker" label="Audio" />
      <systemblock.connection
        from="usb"
        to="regulator"
        label="5V"
        kind="power"
      />
      <systemblock.connection from="usb" to="amp" label="5V" kind="power" />
      <systemblock.connection
        from="regulator"
        to="esp32"
        label="3.3V"
        kind="power"
      />
    </systemblock.page>
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
    "imports/KF350_3_5_2P.tsx": `
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"]
} as const

export const KF350_3_5_2P = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
  "jlcpcb": [
    "C474892"
  ]
}}
      manufacturerPartNumber="KF350-3.5-2P"
      footprint={<footprint>
        <platedhole  portHints={["pin1"]} pcbX="-1.749933mm" pcbY="0mm" outerDiameter="1.999996mm" holeDiameter="0.999998mm" shape="circle" />
<platedhole  portHints={["pin2"]} pcbX="1.749933mm" pcbY="0mm" outerDiameter="1.999996mm" holeDiameter="0.999998mm" shape="circle" />
<silkscreenpath route={[{"x":3.500196200000005,"y":3.499967599999991},{"x":3.500196200000005,"y":-3.4000694000000067}]} />
<silkscreenpath route={[{"x":-3.5000184000000445,"y":-3.4001202000000603},{"x":3.5000184000000445,"y":-3.4001202000000603}]} />
<silkscreenpath route={[{"x":-2.6805128000000877,"y":-3.4001710000000003},{"x":-2.6805128000000877,"y":-1.9106895999999551},{"x":-2.249906600000031,"y":-1.480108800000039},{"x":-1.2598908000001074,"y":-1.480108800000039},{"x":-0.8136128000001008,"y":-1.926386799999932},{"x":-0.8136128000001008,"y":-3.4001710000000003}]} />
<silkscreenpath route={[{"x":0.8193023999999696,"y":-3.4001202000000603},{"x":0.8193023999999696,"y":-1.910664200000042},{"x":1.2499339999999393,"y":-1.4800579999999854},{"x":2.2399497999999767,"y":-1.4800579999999854},{"x":2.686227800000097,"y":-1.9263613999999052},{"x":2.686227800000097,"y":-3.4001202000000603}]} />
<silkscreenpath route={[{"x":-3.5000437999999576,"y":1.868728800000099},{"x":3.5000437999999576,"y":1.868728800000099}]} />
<silkscreenpath route={[{"x":-3.5000437999999576,"y":3.4999930000000177},{"x":3.499992999999904,"y":3.4999930000000177}]} />
<silkscreenpath route={[{"x":-3.5000437999999576,"y":3.4999930000000177},{"x":-3.5000437999999576,"y":-3.4000186000000667}]} />
<silkscreenpath route={[{"x":-3.5000437999999576,"y":-3.4000186000000667},{"x":-3.9500809999999547,"y":-3.4000186000000667},{"x":-3.9500809999999547,"y":-2.5999947999998767},{"x":-3.5000437999999576,"y":-2.5999947999998767}]} />
<silkscreenpath route={[{"x":3.499992999999904,"y":3.4999930000000177},{"x":3.9500048000001016,"y":3.4999930000000177},{"x":3.9500048000001016,"y":2.699994600000082},{"x":3.499992999999904,"y":2.699994600000082}]} />
<silkscreentext text="{NAME}" pcbX="0.010033mm" pcbY="4.6322mm" anchorAlignment="center" fontSize="1mm" />
<fabricationnotepath route={[{"x":-2.8076143999999204,"y":-3.40004399999998},{"x":-2.8076143999999204,"y":-1.9106133999999884},{"x":-2.7979548349023844,"y":-1.8620075982191793},{"x":-2.770428799999877,"y":-1.8207989999999654},{"x":-2.3398226000000477,"y":-1.3901928000000225},{"x":-2.2986140017809475,"y":-1.3626667650974014},{"x":-2.2500082000000248,"y":-1.3530071999998654},{"x":-1.259992400000101,"y":-1.3530071999998654},{"x":-1.2113865982190646,"y":-1.3626667650974014},{"x":-1.170178000000078,"y":-1.3901928000000225},{"x":-0.7239000000000715,"y":-1.8364707999999155},{"x":-0.6963739650974503,"y":-1.8776793982190156},{"x":-0.6867143999999143,"y":-1.9262851999999384},{"x":-0.6867143999999143,"y":-3.40004399999998},{"x":-0.813714399999867,"y":-3.5270439999999326},{"x":-0.9407143999999334,"y":-3.40004399999998},{"x":-0.9407143999999334,"y":-1.9788886000000048},{"x":-1.31259579999994,"y":-1.6070071999998845},{"x":-2.1974047999999584,"y":-1.6070071999998845},{"x":-2.5536143999999013,"y":-1.9632168000000547},{"x":-2.5536143999999013,"y":-3.40004399999998},{"x":-2.680614399999854,"y":-3.5270439999999326},{"x":-2.8076143999999204,"y":-3.40004399999998}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":0.6923023999999032,"y":-3.4000694000000067},{"x":0.6923023999999032,"y":-1.9106387999999015},{"x":0.7019619650976665,"y":-1.8620329982190924},{"x":0.729488000000174,"y":-1.820824400000106},{"x":1.1600942000000032,"y":-1.3902181999999357},{"x":1.2012998712984881,"y":-1.3626784983014204},{"x":1.2499086000000261,"y":-1.3530072000000928},{"x":2.23992439999995,"y":-1.3530071999998654},{"x":2.2885194616609397,"y":-1.3626833583809912},{"x":2.3297134000000597,"y":-1.3902181999999357},{"x":2.7759914000000663,"y":-1.8364961999999423},{"x":2.8035311016985816,"y":-1.8777018712984272},{"x":2.813202399999909,"y":-1.9263105999999652},{"x":2.813202399999909,"y":-3.4000694000000067},{"x":2.6862023999999565,"y":-3.5270693999999594},{"x":2.55920239999989,"y":-3.4000694000000067},{"x":2.55920239999989,"y":-1.9789140000000316},{"x":2.1872955999999704,"y":-1.6070071999998845},{"x":1.3025120000000925,"y":-1.6070071999998845},{"x":0.9463023999999223,"y":-1.9632421999999679},{"x":0.9463023999999223,"y":-3.4000694000000067},{"x":0.8193023999999696,"y":-3.5270693999999594},{"x":0.6923023999999032,"y":-3.4000694000000067}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-3.500043799999844,"y":-3.273044000000027},{"x":3.4999930000000177,"y":-3.273044000000027},{"x":3.626993000000084,"y":-3.40004399999998},{"x":3.4999930000000177,"y":-3.5270439999999326},{"x":-3.500043799999844,"y":-3.5270439999999326},{"x":-3.6270437999999103,"y":-3.40004399999998},{"x":-3.500043799999844,"y":-3.273044000000027}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":3.4999930000000177,"y":3.373043800000005},{"x":-3.500043799999844,"y":3.373043800000005},{"x":-3.6270437999999103,"y":3.5000437999999576},{"x":-3.500043799999844,"y":3.627043800000024},{"x":3.4999930000000177,"y":3.627043800000024},{"x":3.626993000000084,"y":3.5000437999999576},{"x":3.4999930000000177,"y":3.373043800000005}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":3.627043800000024,"y":3.5000184000000445},{"x":3.627043800000024,"y":-3.4000186000000667},{"x":3.5000438000000713,"y":-3.5270186000000194},{"x":3.373043800000005,"y":-3.4000186000000667},{"x":3.373043800000005,"y":3.5000184000000445},{"x":3.5000438000000713,"y":3.627018399999997},{"x":3.627043800000024,"y":3.5000184000000445}]} strokeWidth="0mm" isFilled hasStroke={false} />
<fabricationnotepath route={[{"x":-3.627069199999937,"y":-3.40004399999998},{"x":-3.627069199999937,"y":3.5000184000000445},{"x":-3.5000691999999844,"y":3.627018399999997},{"x":-3.373069199999918,"y":3.5000184000000445},{"x":-3.373069199999918,"y":-3.40004399999998},{"x":-3.5000691999999844,"y":-3.5270439999999326},{"x":-3.627069199999937,"y":-3.40004399999998}]} strokeWidth="0mm" isFilled hasStroke={false} />
<courtyardoutline outline={[{"x":-4.2499919999999065,"y":3.7499930000000177},{"x":4.24999200000002,"y":3.7499930000000177},{"x":4.24999200000002,"y":-3.649993199999926},{"x":-4.2499919999999065,"y":-3.649993199999926},{"x":-4.2499919999999065,"y":3.7499930000000177}]} />
      </footprint>}
      
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C474892.obj?uuid=81e8844df5354ae4bd7bd34179dfd3ff",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C474892.step?uuid=81e8844df5354ae4bd7bd34179dfd3ff",
        pcbRotationOffset: 0,
        modelOriginPosition: {"x":0,"y":0,"z":-0.199998000000005},
      
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
    "imports/TYPE_C_31_M_12.tsx": `
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["EH2"],
  pin2: ["EH1"],
  pin3: ["EH4"],
  pin4: ["EH3"],
  pin5: ["SBU2","B8"],
  pin6: ["CC1","A5"],
  pin7: ["DN2","B7"],
  pin8: ["DP1","A6"],
  pin9: ["DN1","A7"],
  pin10: ["DP2","B6"],
  pin11: ["SBU1","A8"],
  pin12: ["CC2","B5"],
  pin13: ["GND1","A1B12"],
  pin14: ["GND2","B1A12"],
  pin15: ["VBUS1","B4A9"],
  pin16: ["VBUS2","A4B9"]
} as const

const pinAttributes = {
  pin5: {isPassive: true},
  pin6: {isPassive: true},
  pin7: {isPassive: true},
  pin8: {isPassive: true},
  pin9: {isPassive: true},
  pin10: {isPassive: true},
  pin11: {isPassive: true},
  pin12: {isPassive: true}
} satisfies NonNullable<ChipProps["pinAttributes"]>

export const TYPE_C_31_M_12 = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      pinAttributes={pinAttributes}
      supplierPartNumbers={{
  "jlcpcb": [
    "C165948"
  ]
}}
      manufacturerPartNumber="TYPE-C-31-M-12"
      footprint={<footprint>
        <hole pcbX="-2.899918mm" pcbY="0.9055672mm" diameter="0.5999988mm" />
<hole pcbX="2.899918mm" pcbY="0.9055672mm" diameter="0.5999988mm" />
<platedhole  portHints={["pin2"]} pcbX="4.325112mm" pcbY="-2.7741308mm" holeWidth="0.7999984mm" holeHeight="1.1999976mm" outerWidth="1.1999976mm" outerHeight="1.7999964mm" shape="pill" />
<platedhole  portHints={["pin1"]} pcbX="4.325112mm" pcbY="1.4056932mm" holeWidth="0.7999984mm" holeHeight="1.499997mm" outerWidth="1.1999976mm" outerHeight="1.999996mm" shape="pill" />
<platedhole  portHints={["pin4"]} pcbX="-4.325112mm" pcbY="1.4056932mm" holeWidth="0.7999984mm" holeHeight="1.499997mm" outerWidth="1.1999976mm" outerHeight="1.999996mm" shape="pill" />
<platedhole  portHints={["pin3"]} pcbX="-4.325112mm" pcbY="-2.7741308mm" holeWidth="0.7999984mm" holeHeight="1.1999976mm" outerWidth="1.1999976mm" outerHeight="1.7999964mm" shape="pill" />
<smtpad portHints={["pin5"]} pcbX="-1.75006mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin6"]} pcbX="-1.249934mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin7"]} pcbX="-0.750062mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin8"]} pcbX="-0.249936mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin9"]} pcbX="0.249936mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin10"]} pcbX="0.750062mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin11"]} pcbX="1.24968mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin12"]} pcbX="1.75006mm" pcbY="2.1740432mm" width="0.2999994mm" height="1.2999974mm" shape="rect" />
<smtpad portHints={["pin13"]} points={[{x: "-2.8999688mm", y: "1.524108mm"}, {x: "-2.8999688mm", y: "2.8241308mm"}, {x: "-2.8999688mm", y: "2.8241308mm"}, {x: "-3.1999682mm", y: "2.8241308mm"}, {x: "-3.1999682mm", y: "2.8241308mm"}, {x: "-3.1999682mm", y: "2.8239784mm"}, {x: "-3.1999682mm", y: "2.8239784mm"}, {x: "-3.4999422mm", y: "2.8239784mm"}, {x: "-3.4999422mm", y: "2.8239784mm"}, {x: "-3.4999422mm", y: "1.5239556mm"}, {x: "-3.4999422mm", y: "1.5239556mm"}, {x: "-3.1999428mm", y: "1.5239556mm"}, {x: "-3.1999428mm", y: "1.5239556mm"}, {x: "-3.1999428mm", y: "1.524108mm"}, {x: "-3.1999428mm", y: "1.524108mm"}, {x: "-2.8999688mm", y: "1.524108mm"}]} shape="polygon" />
<smtpad portHints={["pin14"]} points={[{x: "2.8999942mm", y: "2.8241308mm"}, {x: "2.8999942mm", y: "1.5241588mm"}, {x: "2.8999942mm", y: "1.5241588mm"}, {x: "3.1999936mm", y: "1.5241588mm"}, {x: "3.1999936mm", y: "1.5241588mm"}, {x: "3.200019mm", y: "1.5241588mm"}, {x: "3.200019mm", y: "1.5241588mm"}, {x: "3.5000184mm", y: "1.5241588mm"}, {x: "3.5000184mm", y: "1.5241588mm"}, {x: "3.5000184mm", y: "2.8241308mm"}, {x: "3.5000184mm", y: "2.8241308mm"}, {x: "3.200019mm", y: "2.8241308mm"}, {x: "3.200019mm", y: "2.8241308mm"}, {x: "3.1999936mm", y: "2.8241308mm"}, {x: "3.1999936mm", y: "2.8241308mm"}, {x: "2.8999942mm", y: "2.8241308mm"}]} shape="polygon" />
<smtpad portHints={["pin15"]} points={[{x: "2.7001724mm", y: "1.5241588mm"}, {x: "2.7001724mm", y: "2.8241308mm"}, {x: "2.7001724mm", y: "2.8241308mm"}, {x: "2.400173mm", y: "2.8241308mm"}, {x: "2.400173mm", y: "2.8241308mm"}, {x: "2.4001476mm", y: "2.8241308mm"}, {x: "2.4001476mm", y: "2.8241308mm"}, {x: "2.1001482mm", y: "2.8241308mm"}, {x: "2.1001482mm", y: "2.8241308mm"}, {x: "2.1001482mm", y: "1.5241588mm"}, {x: "2.1001482mm", y: "1.5241588mm"}, {x: "2.4001476mm", y: "1.5241588mm"}, {x: "2.4001476mm", y: "1.5241588mm"}, {x: "2.400173mm", y: "1.5241588mm"}, {x: "2.400173mm", y: "1.5241588mm"}, {x: "2.7001724mm", y: "1.5241588mm"}]} shape="polygon" />
<smtpad portHints={["pin16"]} points={[{x: "-2.0999704mm", y: "1.5240064mm"}, {x: "-2.0999704mm", y: "2.8239784mm"}, {x: "-2.0999704mm", y: "2.8239784mm"}, {x: "-2.3999952mm", y: "2.8239784mm"}, {x: "-2.3999952mm", y: "2.8239784mm"}, {x: "-2.3999952mm", y: "2.823953mm"}, {x: "-2.3999952mm", y: "2.823953mm"}, {x: "-2.6999438mm", y: "2.823953mm"}, {x: "-2.6999438mm", y: "2.823953mm"}, {x: "-2.6999438mm", y: "1.523981mm"}, {x: "-2.6999438mm", y: "1.523981mm"}, {x: "-2.399919mm", y: "1.523981mm"}, {x: "-2.399919mm", y: "1.523981mm"}, {x: "-2.399919mm", y: "1.5240064mm"}, {x: "-2.399919mm", y: "1.5240064mm"}, {x: "-2.0999704mm", y: "1.5240064mm"}]} shape="polygon" />
<silkscreenpath route={[{"x":-4.4689776000000165,"y":-1.6757585999999947},{"x":-4.4689776000000165,"y":0.18715359999987413}]} />
<silkscreenpath route={[{"x":4.471009600000116,"y":-5.394140800000059},{"x":-4.4689776000000165,"y":-5.394140800000059},{"x":-4.4689776000000165,"y":-3.91283820000001}]} />
<silkscreenpath route={[{"x":4.471009600000116,"y":-1.676114200000029},{"x":4.471009600000116,"y":0.18750920000002225}]} />
<silkscreenpath route={[{"x":4.471009600000116,"y":-5.394140800000059},{"x":4.471009600000116,"y":-3.912482600000203}]} />
<silkscreentext text="{NAME}" pcbX="0.002794mm" pcbY="3.8286012mm" anchorAlignment="center" fontSize="1mm" />
<courtyardoutline outline={[{"x":-5.17511079999997,"y":3.074130799999921},{"x":5.17511079999997,"y":3.074130799999921},{"x":5.17511079999997,"y":-5.60002099999997},{"x":-5.17511079999997,"y":-5.60002099999997},{"x":-5.17511079999997,"y":3.074130799999921}]} />
      </footprint>}
      cadModel={{
        objUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.obj?uuid=617b05f9bba7410b96c001093d8189e4",
        stepUrl: "https://modelcdn.tscircuit.com/easyeda_models/assets/C165948.step?uuid=617b05f9bba7410b96c001093d8189e4",
        pcbRotationOffset: 180,
        modelOriginPosition: { x: 0, y: -2.7500289000000517, z: 0.000010999999999872223 },
      }}
      {...props}
    />
  )
}
`.trim(),
  },
}
