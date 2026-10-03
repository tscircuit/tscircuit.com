import { createSvgUrl } from "@tscircuit/create-snippet-url"

export const getDatasheetFootprintSvgUrl = (footprinterString: string) =>
  createSvgUrl(
    `export default () => <chip name="U1" footprint={${JSON.stringify(footprinterString)}} />`,
    "pcb",
    { showSolderMask: false },
  )
