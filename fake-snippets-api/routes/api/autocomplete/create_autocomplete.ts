import "dotenv/config"
import { withRouteSpec } from "fake-snippets-api/lib/middleware/with-winter-spec"
import { z } from "zod"
import OpenAI from "openai"

// Lazy-loaded client instance
let openai: OpenAI | null = null
let cachedReadme: string | null = null

function getOpenAIClient() {
  const apiKey = process.env.VITE_OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("Missing Api Key in env")
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://tscircuit.com",
        "X-Title": "TSCircuit Editor",
      },
    })
  }

  return openai
}

// Cache README
async function getCachedReadme(): Promise<string> {
  if (cachedReadme !== null) return cachedReadme
  const res = await fetch(
    "https://raw.githubusercontent.com/tscircuit/props/main/README.md",
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch README: ${res.status}`)
  }
  cachedReadme = await res.text()
  return cachedReadme
}

async function completion(
  openai: OpenAI,
  readmeContent: string,
  prefix: string,
  suffix: string,
  model = "openai/gpt-4o-mini",
  language?: string,
) {
  const systemMessage = `You are an expert ${language ? language + " " : ""}programmer working in a TSX (TypeScript + React JSX) environment.

Below is the README.md for the available components. You MUST use this to determine which components and props are valid. 
Only use components explicitly documented under Available Components in the README. Never invent or guess new components. If the user partially types a component that does not exist in the README, do NOT try to complete it.

===== README.md START =====
${readmeContent}
===== README.md END =====

Special instruction for the <chip> component:
- Do NOT add chip as a prop (e.g., <chip chip="..."> is invalid).
- Always use this format: 
  <chip name="U<number>" footprint="<valid footprint>"  pcbX={0} pcbY={0} schX={0} schY={0} />
- Automatically determine the next sequential name:
  - If there are already chips with names like "U1", "U2", "U3", you must name the next one "U4".
  - If this is the first chip, use "U1" as the name.
- Only use valid footprints and pinLabels as documented in the README.
- Only include the required props: name, footprint, pinLabels, pcbX, pcbY, schX, schY.


Your task is to replace <FILL_ME> with valid TSX code in a larger file. 
Sometimes the user has already partially typed a component or tag (e.g. "<resi<FILL_ME>" or "<ca<FILL_ME>"). 
You must detect that the user started a JSX element and complete ONLY the remaining part.

⚠️ STRICT rules:
- If the input already contains a "<", NEVER add another "<". Continue immediately after it.
- If the input ends with a space after a partial component (like "<net "), you must recognize that "net" is the component and add only its valid props, exactly as documented in the README.
- NEVER repeat the component name as a prop (for example, never do <net net=... /> or <chip chip=... />).
- NEVER start your completion with any spaces, tabs, or newlines. 
- Your completion MUST start at the very first character, with absolutely NO leading whitespace of any kind. 
- The first character of your output MUST be the continuation of the partially typed tag. 
  For example, if the input was "<ca<FILL_ME>", your output must start exactly as "pacitor ..." — no leading whitespace, not even a single space.
- NEVER repeat what is already typed.
- NEVER add the component name itself as a prop. For example, for <chip>, NEVER write chip="...". This is invalid. Only include valid props documented in the README.

Requirements:
- Only use JSX components that are explicitly documented in the README.md.
- Each JSX component MUST include: name, footprint, pcbX, pcbY, schX, schY.
- You MUST carefully read the README.md context and type/interface definitions to determine which props are valid for each component.
- Include ALL props that are required or non-optional for that component. For example, a <Resistor> must also have a resistance prop.
- Always return valid JSX or TSX (unless continuing an already open tag).
- No explanations, no comments, no markdown.

Available type example:

export interface ResistorProps<PinLabel extends string = string>
  extends CommonComponentProps<PinLabel> {
  resistance: number | string;
  pullupFor?: string;
  pullupTo?: string;
  pulldownFor?: string;
  pulldownTo?: string;
  schOrientation?: SchematicOrientation;
  connections?: Connections<ResistorPinLabels>;
}

This means for a <Resistor>, the 'resistance' prop is REQUIRED.

Examples:
Examples:
- Input: "<FILL_ME>"
  Output: <resistor name="R1" footprint="0603" pcbX={5} pcbY={7} schX={1} schY={2} resistance={1000} />
- Input: "<ca<FILL_ME>"
  Output: pacitor name="C1" footprint="0805" pcbX={10} pcbY={15} schX={3} schY={4} />
- Input: "<chip<FILL_ME>"
  Output: name="U<number>" footprint="<Use a valid footprint>"  pcbX={0} pcbY={0} schX={0} schY={0} />


Your output will be inserted exactly in place of <FILL_ME>.`

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: `${prefix}<FILL_ME>${suffix}` },
    ],
    model,
  })

  return chatCompletion.choices[0].message?.content ?? ""
}

// Function to trim duplicated partial tag
function trimDuplicatePrefix(prefix: string, prediction: string): string {
  const match = prefix.match(/<([a-z]*)$/i)
  if (match && match[1]) {
    const partialTag = match[1]
    const regex = new RegExp(`^${partialTag}`, "i")
    prediction = prediction.replace(regex, "")
  }
  return prediction
}

export default withRouteSpec({
  methods: ["POST"],
  auth: "none",
  jsonBody: z.object({
    prefix: z.string(),
    suffix: z.string(),
    model: z.string().optional(),
    language: z.string().optional(),
  }),
  jsonResponse: z.object({
    prediction: z.string(),
  }),
})(async (req, ctx) => {
  const openai = getOpenAIClient()
  const { prefix, suffix, model, language } = req.jsonBody

  const readmeContent = await getCachedReadme()
  const predictionResult = await completion(
    openai,
    readmeContent,
    prefix,
    suffix,
    model,
    language,
  )

  function fixLeadingCharacters(prefix: string, prediction: string): string {
    prediction = prediction.replace(/^\s+/, "")

    const lines = prefix.split(/\r?\n/)
    const lastLine = lines[lines.length - 1]

    // If the last line already has an open tag like < or <net or <res
    if (lastLine.trim().startsWith("<")) {
      // forcibly strip any leading < in prediction
      while (prediction.startsWith("<")) {
        prediction = prediction.slice(1)
      }

      // also remove repeated tag name if applicable
      const match = lastLine.match(/<([a-z]*)$/i)
      if (match && match[1]) {
        const partialTag = match[1]
        const regex = new RegExp(`^${partialTag}`, "i")
        prediction = prediction.replace(regex, "")
      }
    }

    return prediction.replace(/^\s+/, "")
  }

  const cleanPrediction = fixLeadingCharacters(prefix, predictionResult)

  return ctx.json({ prediction: cleanPrediction })
})
