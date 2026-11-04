export const esp32BluetoothSpeakerTemplate = {
  type: "board",
  code: `
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
    <chip
      name="U3"
      schSectionName="power"
      manufacturerPartNumber="AMS1117-3.3"
      footprint="jlcpcb:C6186"
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
    <chip
      name="U2"
      schSectionName="esp32"
      manufacturerPartNumber="ESP32-WROOM-32E-N8"
      footprint="jlcpcb:C701342"
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
    <chip
      name="U1"
      schSectionName="audio"
      manufacturerPartNumber="MAX98357AETE+T"
      footprint="jlcpcb:C910544"
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
}
