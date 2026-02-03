export const usbCLedFlashlightTemplate = {
  type: "board",
  code: `
import { RedLed } from "@tsci/seveibar.red-led"
import { PushButton } from "@tsci/seveibar.push-button"
import { SmdUsbC } from "@tsci/seveibar.smd-usb-c"

export default () => {
  return (
    <board width="12mm" height="30mm" schAutoLayoutEnabled autorouter="auto-cloud">
      <SmdUsbC GND1="net.GND" GND2="net.GND" pcbY={-10} VBUS1="net.VBUS" VBUS2="net.VBUS" />
      <RedLed neg="net.GND" pcbY={12} />
      <PushButton name="SW1" pcbY={0} pin2=".R1 > .pos" pin3="net.VBUS" />
      <resistor name="R1" footprint="0603" resistance="1k" pcbY={7} />
      <trace from=".R1 > .neg" to={Led.pos} />
    </board>
  )
}`.trim(),
}
