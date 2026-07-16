export const zIndexMap = {
  dialogOverlay: 150,
  dialogContent: 151,
  popoverContent: 160,
  searchDropdown: 200,
} as const

export type ZIndexKey = keyof typeof zIndexMap
