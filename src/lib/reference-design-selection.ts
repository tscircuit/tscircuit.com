export const getReferenceDesignsUrl = (chipName: string) =>
  `/datasheets/${encodeURIComponent(chipName)}/reference-designs`

export const getReferenceDesignUrl = ({
  chipName,
  name,
}: { chipName: string; name: string }) =>
  `${getReferenceDesignsUrl(chipName)}/${name.split("/").map(encodeURIComponent).join("/")}`
