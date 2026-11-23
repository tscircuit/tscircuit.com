import { TYPE_C_31_M_12 as UsbC } from "./imports/TYPE_C_31_M_12"
import { AP2112K_3_3TRG1 as AP2112K } from "./imports/AP2112K_3_3TRG1"
import { ESP32_C6_WROOM_1_N8 as ESP32C6 } from "./imports/ESP32_C6_WROOM_1_N8"
import { HX_3x4x2_2P_1_6N_TACTILE_SWITCH as BootSwitch } from "./imports/HX_3x4x2_2P_1_6N_TACTILE_SWITCH"
import { LM4861MX_NOPB as LM4861 } from "./imports/LM4861MX_NOPB"
import { CPT_9019S_SMT_TR as Piezo } from "./imports/CPT_9019S_SMT_TR"

// Program the ESP32-C6 using the USB-C port (J1) on the left edge of the board.
// Drive GPIO10 with a 4 kHz square wave to sound the passive piezo through U3.
export default () => (
  <board
    schMaxTraceDistance={6.5}
    isViaInPadAllowed
    width="42mm"
    height="30mm"
    schLayout={{ layoutMode: "none" }}
  >
    <BoardLayout />
    <schematicsheet name="Wi-Fi sounder">
      <net name="VBUS" isPowerNet nominalTraceWidth="0.35mm" />
      <net name="V3V3" isPowerNet nominalTraceWidth="0.35mm" />
      <net name="GND" isGroundNet />
      <schematicsection
        sectionTitleFontSize={0.23}
        name="usb"
        displayName="USB-C interface"
      />
      <schematicsection
        sectionTitleFontSize={0.23}
        name="power"
        displayName="3.3 V supply"
      />
      <schematicsection
        sectionTitleFontSize={0.23}
        name="radio"
        displayName="ESP32-C6 and boot control"
      />
      <schematicsection
        sectionTitleFontSize={0.23}
        name="audio"
        displayName="Piezo driver"
      />
      <UsbPort />
      <PowerSupply />
      <WifiModule />
      {/* Connect the far-side module ground pad to the via array under the shield. */}
      <trace
        name="GND"
        from="U1.GND2"
        to="U1.EP"
        thickness="0.35mm"
        pcbPathRelativeTo="U1"
        pcbPath={["U1.GND2", { x: 4.21, y: 8.255 }, "U1.EP"]}
      />
      <BootCircuit />
      <BuzzerAmplifier />
      <Piezo
        name="Y1"
        schSectionName="audio"
        schX={10}
        schY={-4.1}
        pcbX={15.3}
        pcbY={7.6}
      />
      <trace name="AUDIO_IN" from="C6.pin2" to="R7.pin1" />
      <trace name="PIEZO_P" from="R9.pin2" to="Y1.pin1" />
      <trace name="PIEZO_N" from="U3.OUT2" to="Y1.pin2" />
    </schematicsheet>
  </board>
)

function UsbPort() {
  return (
    <>
      {/* USB 2.0 device. Connect both orientations and give each CC its own Rd. */}
      <UsbC
        name="J1"
        schSectionName="usb"
        schX={-8}
        schY={4}
        pcbX={-15.35}
        pcbY={-7.1}
        pcbRotation={270}
        connections={{
          VBUS_B: "net.VBUS",
          VBUS_A: "net.VBUS",
          GND_A: "net.GND",
          GND_B: "net.GND",
          SHIELD: "net.GND",
          B7_DM: "net.DM",
          A7_DM: "net.DM",
          B6_DP: "net.DP",
          A6_DP: "net.DP",
        }}
      />
      <resistor
        symbolName="resistor"
        name="R1"
        schSectionName="usb"
        schX={-4.6}
        schY={4.1}
        schRotation={180}
        resistance="22"
        footprint="0603"
        pcbRotation={180}
        pcbX={-10.4}
        pcbY={-6.0}
        connections={{ pin1: "net.USB_DM", pin2: "net.DM" }}
      />
      <resistor
        symbolName="resistor"
        name="R2"
        schSectionName="usb"
        schX={-4.6}
        schY={5.2}
        schRotation={180}
        resistance="22"
        footprint="0603"
        pcbRotation={180}
        pcbX={-10.4}
        pcbY={-8.0}
        connections={{ pin1: "net.USB_DP", pin2: "net.DP" }}
      />
      <resistor
        symbolName="resistor"
        name="R10"
        schSectionName="usb"
        schX={-4}
        schY={2.5}
        schRotation={270}
        resistance="5.1k"
        footprint="0603"
        pcbX={-9.2}
        pcbY={-11.3}
        connections={{ pin2: "net.GND" }}
      />
      <resistor
        symbolName="resistor"
        name="R11"
        schSectionName="usb"
        schX={-5.8}
        schY={2.5}
        schRotation={270}
        resistance="5.1k"
        footprint="0603"
        pcbX={-16.0}
        pcbY={-0.1}
        connections={{ pin2: "net.GND" }}
      />
      <trace name="CC1" from="J1.CC1" to="R10.pin1" />
      <trace name="CC2" from="J1.CC2" to="R11.pin1" />
    </>
  )
}

function PowerSupply() {
  return (
    <>
      {/* AP2112K: 600 mA regulator. C1/C2 stabilize the LDO; C3/C4 bypass U1. */}
      <AP2112K
        name="U2"
        schSectionName="power"
        schX={5.5}
        schY={4.7}
        pcbX={-16}
        pcbY={4.5}
        pcbRotation={90}
        connections={{
          VIN: "net.VBUS",
          EN: "net.VBUS",
          GND: "net.GND",
          VOUT: "net.V3V3",
        }}
      />
      <capacitor
        name="C1"
        schSectionName="power"
        schX={2.7}
        schY={4}
        schRotation={270}
        capacitance="1uF"
        footprint="0603"
        pcbX={-17.7}
        pcbY={1.4}
        connections={{ pin1: "net.VBUS", pin2: "net.GND" }}
      />
      <capacitor
        name="C2"
        schSectionName="power"
        schX={8.3}
        schY={4}
        schRotation={270}
        capacitance="1uF"
        footprint="0603"
        pcbRotation={180}
        pcbX={-18.2}
        pcbY={7.9}
        connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
      />
      <capacitor
        name="C3"
        schSectionName="radio"
        schX={-2.3}
        schY={-1.8}
        schRotation={270}
        capacitance="10uF"
        footprint="0805"
        pcbX={-16}
        pcbY={12.1}
        connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
      />
      <capacitor
        name="C4"
        schSectionName="radio"
        schX={-1.1}
        schY={-1.8}
        schRotation={270}
        capacitance="100nF"
        footprint="0603"
        pcbX={-12.5}
        pcbY={12.1}
        connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
      />
    </>
  )
}

// Only the antenna overhangs the top edge. All 29 pins land on the PCB.
function WifiModule() {
  return (
    <ESP32C6
      name="U1"
      schSectionName="radio"
      schX={-4.6}
      schY={-4}
      pcbX={-0.5}
      pcbY={5.25}
      connections={{
        VDD: "net.V3V3",
        GND1: "net.GND",
        EP: "net.GND",
        EN: "net.CHIP_EN",
        IO9: "net.BOOT",
        IO8: "net.STRAP8",
        IO12: "net.USB_DM",
        IO13: "net.USB_DP",
        IO10: "net.TONE",
      }}
      allowOffBoard
    />
  )
}

function BootCircuit() {
  return (
    <>
      {/* Power-on reset and boot straps. Hold BOOT while plugging in USB for the ROM loader. */}
      <resistor
        symbolName="resistor"
        name="R3"
        schSectionName="radio"
        schX={-10}
        schY={-2.5}
        schRotation={270}
        resistance="10k"
        footprint="0603"
        pcbX={-13}
        pcbY={9.0}
        connections={{ pin1: "net.V3V3", pin2: "net.CHIP_EN" }}
      />
      <capacitor
        name="C5"
        schSectionName="radio"
        schX={-10}
        schY={-5.5}
        schRotation={270}
        capacitance="1uF"
        footprint="0603"
        pcbX={-13}
        pcbY={7.0}
        connections={{ pin1: "net.CHIP_EN", pin2: "net.GND" }}
      />
      <resistor
        symbolName="resistor"
        name="R4"
        schSectionName="radio"
        schX={-8.2}
        schY={-2.5}
        schRotation={270}
        resistance="10k"
        footprint="0603"
        pcbX={15.5}
        pcbY={-5.2}
        connections={{ pin1: "net.V3V3", pin2: "net.BOOT" }}
      />
      <resistor
        symbolName="resistor"
        name="R5"
        schSectionName="radio"
        schX={-7.2}
        schY={-2.5}
        schRotation={270}
        resistance="10k"
        footprint="0603"
        pcbX={-12.8}
        pcbY={1.45}
        connections={{ pin1: "net.V3V3", pin2: "net.STRAP8" }}
      />
      <BootSwitch
        name="SW1"
        schSectionName="radio"
        schX={-8.2}
        schY={-5.5}
        schRotation={270}
        pcbX={14.5}
        pcbY={-0.6}
        connections={{ pin1: "net.BOOT", pin2: "net.GND" }}
      />
    </>
  )
}

function BuzzerAmplifier() {
  return (
    <>
      {/* LM4861 bridge amplifier. Differential gain = 2 × R8/R7 = 2.
          C6 blocks GPIO DC. R9 isolates the capacitive load from the output. */}
      <LM4861
        name="U3"
        schSectionName="audio"
        schX={5.3}
        schY={-4.3}
        pcbX={4}
        pcbY={-7.85}
        connections={{
          VDD: "net.VBUS",
          GND: "net.GND",
          SHDN: "net.GND",
          IN_N: "net.SUM",
          OUT1: "net.OUT1",
          BYP: "net.BIAS",
          IN_P: "net.BIAS",
        }}
      />
      <capacitor
        name="C6"
        schSectionName="audio"
        schX={1}
        schY={-4.1}
        connections={{ pin1: "net.TONE" }}
        capacitance="330nF"
        footprint="0603"
        pcbX={-7.25}
        pcbY={-7.2}
      />
      <resistor
        symbolName="resistor"
        name="R7"
        connections={{ pin2: "net.SUM" }}
        schSectionName="audio"
        schX={2.6}
        schY={-4.1}
        resistance="20k"
        footprint="0603"
        pcbX={-1}
        pcbY={-11.85}
      />
      <resistor
        symbolName="resistor"
        name="R8"
        connections={{ pin1: "net.SUM", pin2: "net.OUT1" }}
        schSectionName="audio"
        schX={5.3}
        schY={-2.2}
        resistance="20k"
        footprint="0603"
        pcbX={8.5}
        pcbY={-9.35}
        pcbRotation={90}
      />
      <capacitor
        name="C7"
        schSectionName="audio"
        schX={3.3}
        schY={-5.8}
        schRotation={270}
        capacitance="1uF"
        footprint="0603"
        pcbX={3.0}
        pcbY={-12.75}
        connections={{ pin1: "net.BIAS", pin2: "net.GND" }}
      />
      <capacitor
        name="C8"
        schSectionName="audio"
        schX={7.8}
        schY={-6.65}
        schRotation={270}
        capacitance="100nF"
        footprint="0603"
        pcbX={10.9}
        pcbY={-7.3}
        connections={{ pin1: "net.VBUS", pin2: "net.GND" }}
      />
      <resistor
        symbolName="resistor"
        name="R9"
        connections={{ pin1: "net.OUT1" }}
        schSectionName="audio"
        schX={8.1}
        schY={-3.8}
        resistance="100"
        footprint="0603"
        pcbX={12.3}
        pcbY={-5.0}
      />
    </>
  )
}

function BoardLayout() {
  return (
    <>
      {/* Keep copper back from the edge beneath the start of the antenna. */}
      <keepout
        shape="rect"
        pcbX={-0.5}
        pcbY={14.8}
        width={19.5}
        height={0.4}
        excludeRefs={[".U1"]}
        layers={["top", "bottom"]}
      />
      <copperpour
        layer="bottom"
        connectsTo="net.GND"
        clearance="0.25mm"
        coveredWithSolderMask
      />
      <silkscreentext
        text="Wi-Fi Sounder"
        pcbX={13.4}
        pcbY={-12.8}
        fontSize={1.5}
      />
      <silkscreentext text="BOOT" pcbX={14.5} pcbY={-3.2} fontSize={0.9} />
      <silkscreentext
        text="J1 USB-C"
        pcbX={-15.5}
        pcbY={-13.6}
        fontSize={1.1}
      />
      <silkscreentext text="PIEZO" pcbX={15.3} pcbY={13.4} fontSize={0.9} />
    </>
  )
}
