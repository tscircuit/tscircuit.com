export const zIndexMap = {
  dialogOverlay: 1000,
  dialogContent: 1001,
} as const

export type ZIndexKey = keyof typeof zIndexMap
