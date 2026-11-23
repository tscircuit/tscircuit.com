// USB-powered Wi-Fi sounder. Program the ESP32-C3 through J1, then output
// a 4 kHz square wave on GPIO4 to sound the passive piezo through U3.
export default () => (
  <board
    isViaInPadAllowed
    width="48mm"
    height="40mm"
    schLayout={{ layoutMode: "none" }}
  >
    <BoardLayout />
    <schematicsheet name="Wi-Fi sounder">
      <net name="VBUS" isPowerNet nominalTraceWidth="0.35mm" />
      <net name="V3V3" isPowerNet nominalTraceWidth="0.35mm" />
      <net name="GND" isGroundNet />
      <UsbPort />
      <PowerSupply />
      <WifiModule />
      <BootCircuit />
      <BuzzerAmplifier />
      <PiezoBuzzer />

      <trace name="USB_DM" from="J1.DM" to="R1.pin2" />
      <trace name="USB_DP" from="J1.DP" to="R2.pin2" />
      <trace name="USB_DM_MCU" from="R1.pin1" to="U1.IO18" />
      <trace name="USB_DP_MCU" from="R2.pin1" to="U1.IO19" />
      <trace name="STRAP8" from="U1.IO8" to="R5.pin2" />
      <trace name="STRAP2" from="U1.IO2" to="R6.pin2" />
      <trace name="TONE" from="U1.IO4" to="C6.pin1" />
      <trace name="AUDIO_IN" from="C6.pin2" to="R7.pin1" />
      <trace name="BUZZ_P" from="R9.pin2" to="Y1.pin1" />
      <trace name="BUZZ_N" from="U3.OUT2" to="Y1.pin2" />
    </schematicsheet>
  </board>
)

function UsbPort() {
  return (
    <>
      {/* USB Micro-B: ID floats in device mode. The shell is grounded. */}
      <connector
        name="J1"
        manufacturerPartNumber="10118194-0001LF"
        supplierPartNumbers={{ jlcpcb: ["C132563"] }}
        footprint={usbFootprint}
        pcbX={20.9}
        pcbY={6}
        pcbRotation={90}
        schX={-7}
        schY={3}
        cadModel={partModel(
          "C132563",
          "f4160fa25fe74ef4b93ccd5565bda7b1",
          0,
          -0.36,
          -1.225,
        )}
        pinLabels={{
          pin1: "VBUS",
          pin2: "DM",
          pin3: "DP",
          pin4: "ID",
          pin5: "GND",
          pin6: "SHIELD",
        }}
        pinAttributes={{
          VBUS: { providesPower: true, providesVoltage: "5V" },
          GND: { providesGround: true },
        }}
        schPinArrangement={{
          leftSide: { pins: [1, 4, 5, 6], direction: "top-to-bottom" },
          rightSide: { pins: [2, 3], direction: "top-to-bottom" },
        }}
        noConnect={["ID"]}
        connections={{ VBUS: "net.VBUS", GND: "net.GND", SHIELD: "net.GND" }}
      />
      <resistor
        name="R1"
        resistance="22"
        footprint="0603"
        pcbX={8.5}
        pcbY={4.6}
        schX={-4.4}
        schY={3.3}
        schRotation={180}
      />
      <resistor
        name="R2"
        resistance="22"
        footprint="0603"
        pcbX={8.5}
        pcbY={6.1}
        schX={-4.4}
        schY={2.6}
        schRotation={180}
      />
    </>
  )
}

function PowerSupply() {
  return (
    <>
      {/* AP2112K: 600 mA regulator. C1/C2 stabilize the LDO; C3/C4 bypass U1. */}
      <chip
        name="U2"
        manufacturerPartNumber="AP2112K-3.3TRG1"
        supplierPartNumbers={{ jlcpcb: ["C51118"] }}
        footprint="sot23_5"
        cadModel={partModel(
          "C51118",
          "6d166d1d6c064b99aa79465714e989c1",
          0,
          0,
          -0.15,
          -90,
        )}
        pinLabels={{
          pin1: "VIN",
          pin2: "GND",
          pin3: "EN",
          pin4: "NC",
          pin5: "VOUT",
        }}
        pinAttributes={{
          VIN: { requiresPower: true },
          GND: { requiresGround: true },
          VOUT: { providesPower: true, providesVoltage: "3.3V" },
        }}
        pcbX={-19}
        pcbY={4}
        schX={-5.5}
        schY={-0.3}
        connections={{
          VIN: "net.VBUS",
          EN: "net.VBUS",
          GND: "net.GND",
          VOUT: "net.V3V3",
        }}
      />
      <capacitor
        name="C1"
        capacitance="1uF"
        footprint="0603"
        pcbX={-21.8}
        pcbY={1.1}
        schX={-8}
        schY={-1.7}
        connections={{ pin1: "net.VBUS", pin2: "net.GND" }}
      />
      <capacitor
        name="C2"
        capacitance="1uF"
        footprint="0603"
        pcbX={-20}
        pcbY={6.6}
        schX={-3.5}
        schY={-1.7}
        connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
      />
      <capacitor
        name="C3"
        capacitance="10uF"
        footprint="0805"
        pcbX={-18.1}
        pcbY={11.8}
        schX={-1.8}
        schY={5.2}
        schRotation={270}
        connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
      />
      <capacitor
        name="C4"
        capacitance="100nF"
        footprint="0603"
        pcbX={-14.7}
        pcbY={11.8}
        schX={0}
        schY={5.2}
        schRotation={270}
        connections={{ pin1: "net.V3V3", pin2: "net.GND" }}
      />
    </>
  )
}

function WifiModule() {
  return (
    <chip
      name="U1"
      manufacturerPartNumber="ESP32-C3-WROOM-02-N4"
      supplierPartNumbers={{ jlcpcb: ["C2934560"] }}
      footprint={wifiFootprint}
      pcbX={-3}
      pcbY={6}
      schX={0}
      schY={1.5}
      cadModel={partModel(
        "C2934560",
        "3af5773cc1904a9197e0ebbdc043a5ad",
        0,
        -3.1,
        -0.01,
      )}
      pinLabels={{
        pin1: "VDD",
        pin2: "EN",
        pin3: "IO4",
        pin4: "IO5",
        pin5: "IO6",
        pin6: "IO7",
        pin7: "IO8",
        pin8: "IO9",
        pin9: "GND",
        pin10: "IO10",
        pin11: "RXD",
        pin12: "TXD",
        pin13: "IO18",
        pin14: "IO19",
        pin15: "IO3",
        pin16: "IO2",
        pin17: "IO1",
        pin18: "IO0",
        pin19: "EP",
      }}
      pinAttributes={{
        VDD: { requiresPower: true, requiresVoltage: "3.3V" },
        GND: { requiresGround: true },
        EP: { requiresGround: true },
        IO4: { isGpio: true },
      }}
      connections={{
        VDD: "net.V3V3",
        GND: "net.GND",
        EP: "net.GND",
        EN: "net.CHIP_EN",
        IO9: "net.BOOT",
      }}
    />
  )
}

function BootCircuit() {
  return (
    <>
      {/* Power-on reset and boot straps. Hold BOOT while plugging in USB for the ROM loader. */}
      <resistor
        name="R3"
        resistance="10k"
        footprint="0603"
        pcbX={-15.5}
        pcbY={8.5}
        schX={-4}
        schY={0.9}
        connections={{ pin1: "net.V3V3", pin2: "net.CHIP_EN" }}
      />
      <capacitor
        name="C5"
        capacitance="1uF"
        footprint="0603"
        pcbX={-15.5}
        pcbY={6.5}
        schX={-2}
        schY={-0.8}
        connections={{ pin1: "net.CHIP_EN", pin2: "net.GND" }}
      />
      <resistor
        name="R4"
        resistance="10k"
        footprint="0603"
        pcbX={-16}
        pcbY={1}
        schX={2.6}
        schY={4.7}
        connections={{ pin1: "net.V3V3", pin2: "net.BOOT" }}
      />
      <resistor
        name="R5"
        resistance="10k"
        footprint="0603"
        pcbX={-14.8}
        pcbY={3.1}
        schX={2.6}
        schY={3.7}
        connections={{ pin1: "net.V3V3" }}
      />
      <resistor
        name="R6"
        resistance="10k"
        footprint="0603"
        pcbX={8.4}
        pcbY={9.2}
        schX={2.6}
        schY={2.7}
        connections={{ pin1: "net.V3V3" }}
      />
      <pushbutton
        name="SW1"
        manufacturerPartNumber="HX-3x4x2-2P-1.6N"
        supplierPartNumbers={{ jlcpcb: ["C49234124"] }}
        footprint={bootFootprint}
        cadModel={partModel(
          "C49234124",
          "167cb812923f4f7cbb49e982a3bb3b9d",
          0,
          0,
          -0.01,
        )}
        pcbX={-19.6}
        pcbY={-4}
        schX={4.6}
        schY={4.7}
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
      <chip
        name="U3"
        manufacturerPartNumber="LM4861MX/NOPB"
        supplierPartNumbers={{ jlcpcb: ["C7958"] }}
        footprint="soic8_w7mm_pl1.8mm_pw0.59mm_p1.27mm_widthincludeslegs"
        cadModel={partModel(
          "C7958",
          "ec3b9f9b31a74655be3e55848dbee9c1",
          0,
          0,
          0,
          -90,
        )}
        pcbX={1}
        pcbY={-9.5}
        schX={2.2}
        schY={-3.3}
        pinLabels={{
          pin1: "SHDN",
          pin2: "BYP",
          pin3: "IN_P",
          pin4: "IN_N",
          pin5: "OUT1",
          pin6: "VDD",
          pin7: "GND",
          pin8: "OUT2",
        }}
        pinAttributes={{
          VDD: { requiresPower: true },
          GND: { requiresGround: true },
        }}
        connections={{
          VDD: "net.VBUS",
          GND: "net.GND",
          SHDN: "net.GND",
          BYP: "net.BIAS",
          IN_P: "net.BIAS",
          IN_N: "net.SUM",
          OUT1: "net.OUT1",
        }}
      />
      <capacitor
        name="C6"
        capacitance="330nF"
        footprint="0603"
        pcbX={-11.8}
        pcbY={-3.6}
        schX={-5.8}
        schY={-3.1}
      />
      <resistor
        name="R7"
        resistance="20k"
        footprint="0603"
        pcbX={-3}
        pcbY={-14.8}
        schX={-3.6}
        schY={-3.1}
        connections={{ pin2: "net.SUM" }}
      />
      <resistor
        name="R8"
        resistance="20k"
        footprint="0603"
        pcbX={6.8}
        pcbY={-10.5}
        pcbRotation={90}
        schX={0.4}
        schY={-5.8}
        connections={{ pin1: "net.SUM", pin2: "net.OUT1" }}
      />
      <capacitor
        name="C7"
        capacitance="1uF"
        footprint="0603"
        pcbX={0.6}
        pcbY={-14.7}
        schX={-0.4}
        schY={-4.6}
        connections={{ pin1: "net.BIAS", pin2: "net.GND" }}
      />
      <capacitor
        name="C8"
        capacitance="100nF"
        footprint="0603"
        pcbX={1.1}
        pcbY={-5}
        schX={4.2}
        schY={-1.4}
        connections={{ pin1: "net.VBUS", pin2: "net.GND" }}
      />
      <resistor
        name="R9"
        resistance="100"
        footprint="0603"
        pcbX={8.3}
        pcbY={-6.4}
        schX={5.3}
        schY={-3}
        connections={{ pin1: "net.OUT1" }}
      />
    </>
  )
}

function BoardLayout() {
  return (
    <>
      <keepout
        shape="rect"
        pcbX={0}
        pcbY={16.6}
        width={48}
        height={6.8}
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
        pcbX={-15}
        pcbY={-13}
        fontSize={1.5}
      />
      <silkscreentext text="BOOT" pcbX={-19.6} pcbY={-6.6} fontSize={0.9} />
      <silkscreentext text="USB" pcbX={19.6} pcbY={0} fontSize={0.9} />
      <silkscreentext text="PIEZO" pcbX={15} pcbY={-16} fontSize={0.9} />
    </>
  )
}

// Manufacturer land patterns. All dimensions are in mm.
function partModel(
  part: string,
  uuid: string,
  x: number,
  y: number,
  z: number,
  rotation = 0,
) {
  const base = "https://modelcdn.tscircuit.com/easyeda_models/assets/" + part
  return {
    objUrl: base + ".obj?uuid=" + uuid,
    stepUrl: base + ".step?uuid=" + uuid,
    pcbRotationOffset: rotation,
    modelOriginPosition: { x, y, z },
  }
}
function CastellatedPad({ pin }: { pin: number }) {
  return (
    <smtpad
      portHints={["pin" + pin]}
      shape="rect"
      width={1.5}
      height={0.9}
      pcbX={pin <= 9 ? -8.75 : 8.75}
      pcbY={pin <= 9 ? 6 - 1.5 * (pin - 1) : -6 + 1.5 * (pin - 10)}
    />
  )
}

const usbFootprint = (
  <footprint>
    {[1, 2, 3, 4, 5].map((pin) => (
      <UsbContact key={pin} pin={pin} />
    ))}
    <platedhole
      portHints={["pin6"]}
      pcbX={-2.5}
      pcbY={2.675}
      shape="pill"
      holeWidth={0.85}
      holeHeight={0.55}
      outerWidth={1.25}
      outerHeight={0.95}
    />
    <platedhole
      portHints={["pin6"]}
      pcbX={2.5}
      pcbY={2.675}
      shape="pill"
      holeWidth={0.85}
      holeHeight={0.55}
      outerWidth={1.25}
      outerHeight={0.95}
    />
    <platedhole
      portHints={["pin6"]}
      pcbX={-3.5}
      pcbY={-0.025}
      shape="pill"
      holeWidth={0.5}
      holeHeight={1.15}
      outerWidth={1}
      outerHeight={1.55}
    />
    <platedhole
      portHints={["pin6"]}
      pcbX={3.5}
      pcbY={-0.025}
      shape="pill"
      holeWidth={0.5}
      holeHeight={1.15}
      outerWidth={1}
      outerHeight={1.55}
    />
    <courtyardrect width={8.7} height={6.7} pcbY={0.28} />
    <silkscreenpath
      route={[
        { x: -4.1, y: -1 },
        { x: -4.1, y: -2.77 },
        { x: 4.1, y: -2.77 },
        { x: 4.1, y: -1 },
      ]}
    />
  </footprint>
)
function UsbContact({ pin }: { pin: number }) {
  return (
    <smtpad
      portHints={["pin" + pin]}
      pcbX={(pin - 3) * 0.65}
      pcbY={2.675}
      width={0.4}
      height={1.35}
      shape="rect"
    />
  )
}

const wifiFootprint = (
  <footprint>
    {Array.from({ length: 18 }, (_, i) => (
      <CastellatedPad key={i} pin={i + 1} />
    ))}
    <smtpad
      portHints={["pin19"]}
      pcbX={0.96}
      pcbY={-0.2}
      width={2.9}
      height={2.9}
      shape="rect"
    />
    {/* Ground vias under the module's exposed pad tie it to the return plane. */}
    <via
      connectsTo="net.GND"
      pcbX={0.21}
      pcbY={0.55}
      holeDiameter={0.3}
      outerDiameter={0.6}
      tented="bottom_tented"
    />
    <via
      connectsTo="net.GND"
      pcbX={1.71}
      pcbY={0.55}
      holeDiameter={0.3}
      outerDiameter={0.6}
      tented="bottom_tented"
    />
    <via
      connectsTo="net.GND"
      pcbX={0.21}
      pcbY={-0.95}
      holeDiameter={0.3}
      outerDiameter={0.6}
      tented="bottom_tented"
    />
    <via
      connectsTo="net.GND"
      pcbX={1.71}
      pcbY={-0.95}
      holeDiameter={0.3}
      outerDiameter={0.6}
      tented="bottom_tented"
    />
    <silkscreenrect pcbY={3.1} width={18} height={20} />
    <courtyardrect pcbY={3.1} width={19.6} height={20.5} />
  </footprint>
)
const buzzerFootprint = (
  <footprint>
    <smtpad
      portHints={["pin1"]}
      pcbX={-4}
      width={1.6}
      height={3.8}
      shape="rect"
    />
    <smtpad
      portHints={["pin2"]}
      pcbX={4}
      width={1.6}
      height={3.8}
      shape="rect"
    />
    <silkscreenrect width={9} height={9} />
    <courtyardrect width={10.1} height={9.5} />
  </footprint>
)
const bootFootprint = (
  <footprint>
    <smtpad
      portHints={["pin1"]}
      pcbX={-2.16}
      width={1.3}
      height={1.7}
      shape="rect"
    />
    <smtpad
      portHints={["pin2"]}
      pcbX={2.16}
      width={1.3}
      height={1.7}
      shape="rect"
    />
    <courtyardrect width={6.12} height={3.55} />
  </footprint>
)

// The piezo presents 12 nF at its terminals (CPT-9019S-SMT-TR datasheet).
function PiezoBuzzer() {
  return (
    <resonator
      name="Y1"
      frequency="4kHz"
      pinVariant="no_ground"
      manufacturerPartNumber="CPT-9019S-SMT-TR"
      supplierPartNumbers={{ jlcpcb: ["C95163"] }}
      loadCapacitance="12nF"
      displayName="4 kHz piezo"
      footprint={buzzerFootprint}
      cadModel={partModel(
        "C95163",
        "d00722379e0c4827877668a7a84ec15f",
        0,
        0,
        0,
        180,
      )}
      pcbX={15}
      pcbY={-10}
      schX={7}
      schY={-3.6}
      symbol={
        <symbol>
          <port
            pinNumber={1}
            name="pin1"
            direction="left"
            schX={-0.55}
            schY={0.12}
            schStemLength={0.35}
          />
          <port
            pinNumber={2}
            name="pin2"
            direction="left"
            schX={-0.55}
            schY={-0.12}
            schStemLength={0.35}
          />
          <schematicpath
            points={[
              { x: -0.2, y: -0.24 },
              { x: -0.2, y: 0.24 },
              { x: 0.1, y: 0.24 },
              { x: 0.4, y: 0.45 },
              { x: 0.4, y: -0.45 },
              { x: 0.1, y: -0.24 },
              { x: -0.2, y: -0.24 },
            ]}
          />
          <schematictext
            text="{NAME}"
            schX={0}
            schY={0.6}
            anchor="bottom_center"
            fontSize={0.18}
          />
          <schematictext
            text="4 kHz piezo"
            schX={0}
            schY={-0.65}
            anchor="top_center"
            fontSize={0.18}
          />
        </symbol>
      }
    />
  )
}
