export const usbCLedFlashlightTemplate = {
  type: "board",
  code: `
import { useRedLed } from "@tsci/seveibar.red-led"
import { usePushButton } from "@tsci/seveibar.push-button"
import { useUsbC } from "@tsci/seveibar.smd-usb-c"

export default () => {
  const USBC = useUsbC("USBC")
  const Button = usePushButton("SW1")
  const Led = useRedLed("LED")
  return (
    <board width="12mm" height="30mm" schAutoLayoutEnabled autorouter="auto-cloud">
      <USBC GND1="net.GND" GND2="net.GND" pcbY={-10} VBUS1="net.VBUS" VBUS2="net.VBUS" />
      <Led neg="net.GND" pcbY={12} />
      <Button pcbY={0} pin2=".R1 > .pos" pin3="net.VBUS" />
      <resistor name="R1" footprint="0603" resistance="1k" pcbY={7} />
      <trace from=".R1 > .neg" to={Led.pos} />
    </board>
  )
}`.trim(),
}
