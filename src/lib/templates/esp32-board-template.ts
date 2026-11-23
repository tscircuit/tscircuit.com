export const esp32BoardTemplate = {
  type: "board",
  code: `
export default () => (
  <board width="25mm" height="28mm">
    <schematicsheet name="ESP32 LED">
      {/* Power and program the XIAO over USB-C. Drive GPIO10 high to light D1. */}
      <chip
        name="U1"
        manufacturerPartNumber="XIAO ESP32C3"
        footprint="headermodule14_rows2_p2.54mm_py15.24mm_female_silkscreenborder_silkscreenlabel(XIAO ESP32C3)"
        pcbY={-3}
        pinLabels={{
          pin1: "VBUS",
          pin2: "GPIO2",
          pin3: "GPIO3",
          pin4: "GPIO4",
          pin5: "GPIO5",
          pin6: "GPIO6",
          pin7: "GPIO7",
          pin8: "GPIO21",
          pin9: "GPIO20",
          pin10: "GPIO8",
          pin11: "GPIO9",
          pin12: "GPIO10",
          pin13: "V3V3",
          pin14: "GND",
        }}
        pinAttributes={{
          VBUS: {
            requiresPower: true,
            requiresVoltage: "5V",
            providesPower: true,
          },
          V3V3: { providesPower: true, providesVoltage: "3.3V" },
          GND: { requiresGround: true, providesGround: true },
          GPIO10: { isGpio: true },
        }}
      />
      <resistor
        name="R1"
        resistance="330"
        footprint="0805"
        supplierPartNumbers={{ jlcpcb: ["C17630"] }}
        pcbY={9}
        pcbRotation={180}
        schX={3}
        schY={-0.6}
      />
      <led
        name="D1"
        color="red"
        footprint="0603"
        supplierPartNumbers={{ jlcpcb: ["C2904374"] }}
        pinLabels={{ pin1: "cathode", pin2: "anode" }}
        pcbX={-5}
        pcbY={9}
        schX={3}
        schY={1}
        schRotation={180}
      />

      <testpoint
        name="TP1"
        footprintVariant="pad"
        padDiameter="1.5mm"
        doNotPlace
        pcbX={-9}
        pcbY={9}
        schX={-2.5}
        schY={0.6}
      >
        <courtyardrect width="2mm" height="2mm" />
      </testpoint>

      <trace name="VBUS" from="U1.VBUS" to="TP1.pin1" />
      <trace name="LED_DRIVE" from="U1.GPIO10" to="R1.pin1" />
      <trace name="LED_ANODE" from="R1.pin2" to="D1.anode" />
      <trace name="GND" from="D1.cathode" to="U1.GND" />
    </schematicsheet>
  </board>
)
`.trim(),
}
