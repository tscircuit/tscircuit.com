import { defaultCodeForBlankPage } from "@/lib/defaultCodeForBlankCode"
import { blank3dModelTemplate } from "@/lib/templates/blank-3d-model-template"
import { blankCircuitBoardTemplate } from "@/lib/templates/blank-circuit-board-template"
import { blankFootprintTemplate } from "@/lib/templates/blank-footprint-template"
import { blankPackageTemplate } from "@/lib/templates/blank-package-template"
import { blinkingLedBoardTemplate } from "@/lib/templates/blinking-led-board-template"
import { usbCLedFlashlightTemplate } from "@/lib/templates/usb-c-led-flashlight-template"

export const getSnippetTemplate = (template: string | undefined) => {
  switch (template) {
    case "blank-circuit-module":
      return blankPackageTemplate
    case "blank-footprint":
      return blankFootprintTemplate
    case "blank-circuit-board":
      return blankCircuitBoardTemplate
    case "blank-3d-model":
      return blank3dModelTemplate
    case "blinking-led-board":
      return blinkingLedBoardTemplate
    case "usb-c-led-flashlight":
      return usbCLedFlashlightTemplate
    default:
      return { code: defaultCodeForBlankPage, type: "board" }
  }
}
