export const zIndexMap = {
  dialogOverlay: 150,
  dialogContent: 151,
} as const

export type ZIndexKey = keyof typeof zIndexMap
