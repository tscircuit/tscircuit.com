import { blankPackageTemplate } from "@/lib/templates/blank-package-template"
import { blankCircuitBoardTemplate } from "@/lib/templates/blank-circuit-board-template"
import { analogSimulationTemplate } from "@/lib/templates/analog-simulation-template"
import { defaultCodeForBlankPage } from "@/lib/defaultCodeForBlankCode"
import { blinkingLedBoardTemplate } from "@/lib/templates/blinking-led-board-template"
import { usbCLedFlashlightTemplate } from "@/lib/templates/usb-c-led-flashlight-template"

export const templateCatalogue = [
  {
    name: "New Board",
    templateKey: "blank-circuit-board",
    badgeColor: "bg-blue-500",
  },
  {
    name: "New Chip Component",
    templateKey: "blank-chip-component",
    badgeColor: "bg-green-500",
  },
  {
    name: "New Simulation",
    templateKey: "analog-simulation",
    badgeColor: "bg-orange-500",
  },
] as const

const templateMap: Record<string, { code: string; type: string }> = {
  "blank-circuit-board": blankCircuitBoardTemplate,
  "blank-chip-component": blankPackageTemplate,
  "analog-simulation": analogSimulationTemplate,
  "blinking-led-board": blinkingLedBoardTemplate,
  "usb-c-led-flashlight": usbCLedFlashlightTemplate,
}

export const getSnippetTemplate = (template: string | undefined) => {
  if (template && templateMap[template]) {
    return templateMap[template]
  }
  return { code: defaultCodeForBlankPage, type: "board" }
}
