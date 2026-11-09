// Curated links to ordinary published packages. Circuit source, build outputs,
// releases and viewing stay in the package workflow. Add package names here
// after publishing and checking their normal package pages.
export const datasheetReferenceDesignPackages: Readonly<
  Record<string, readonly string[]>
> = {
  NE555DR: ["ShiboSoftwareDev/ne555-timer-presets"],
}

const normalizeChipName = (name: string) =>
  name.replace(/[^a-z0-9]/gi, "").toUpperCase()

export const getDatasheetReferenceDesignPackages = (chipName: string) =>
  Object.entries(datasheetReferenceDesignPackages).find(
    ([name]) => normalizeChipName(name) === normalizeChipName(chipName),
  )?.[1] ?? []
