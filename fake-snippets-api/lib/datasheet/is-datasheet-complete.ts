import { z } from "zod"

const nonemptyText = z.string().trim().min(1)
const completeDatasheet = z.object({
  ai_description: nonemptyText,
  datasheet_pdf_urls: z
    .array(
      z
        .string()
        .trim()
        .url()
        .regex(/^https?:\/\//),
    )
    .min(1),
  pin_information: z
    .array(
      z.object({
        pin_number: nonemptyText,
        name: nonemptyText,
        description: nonemptyText,
        capabilities: z.array(nonemptyText),
      }),
    )
    .min(1),
})

export const isDatasheetComplete = (datasheet: unknown): boolean =>
  completeDatasheet.safeParse(datasheet).success
