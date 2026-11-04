import { blankPackageTemplate } from "@/lib/templates/blank-package-template"
import { blankCircuitBoardTemplate } from "@/lib/templates/blank-circuit-board-template"
import { analogSimulationTemplate } from "@/lib/templates/analog-simulation-template"
import { defaultCodeForBlankPage } from "@/lib/defaultCodeForBlankCode"
import { blinkingLedBoardTemplate } from "@/lib/templates/blinking-led-board-template"
import { usbCLedFlashlightTemplate } from "@/lib/templates/usb-c-led-flashlight-template"
import { esp32BluetoothSpeakerTemplate } from "@/lib/templates/esp32-bluetooth-speaker-template"

// Used in quick start and header dropdown
export const templateCatalogue = [
  {
    name: "New Board",
    templateKey: "blank-circuit-board",
    badgeColor: "bg-blue-500",
    type: "board",
  },
  {
    name: "New Chip Component",
    templateKey: "blank-chip-component",
    badgeColor: "bg-green-500",
    type: "package",
  },
  {
    name: "New Simulation",
    templateKey: "analog-simulation",
    badgeColor: "bg-orange-500",
    type: "board",
  },
] as const

export interface SnippetTemplate {
  type: string
  /** Contents of index.tsx */
  code: string
  /** Extra files opened next to index.tsx, e.g. parts from `tsci import` */
  files?: Record<string, string>
}

const templateMap: Record<string, SnippetTemplate> = {
  "blank-circuit-board": blankCircuitBoardTemplate,
  "blank-chip-component": blankPackageTemplate,
  "analog-simulation": analogSimulationTemplate,
  "blinking-led-board": blinkingLedBoardTemplate,
  "usb-c-led-flashlight": usbCLedFlashlightTemplate,
  "esp32-bluetooth-speaker": esp32BluetoothSpeakerTemplate,
}

export const getSnippetTemplate = (
  template: string | undefined,
): SnippetTemplate => {
  if (template && templateMap[template]) {
    return templateMap[template]
  }
  return { code: defaultCodeForBlankPage, type: "board" }
}
