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
  model = "openai/gpt-4.1-mini",
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
- Some components like <netlabel> does not have a name prop, so do not include it for those components.


Your task is to replace <FILL_ME> with valid TSX code in a larger file. 
Sometimes the user has already partially typed a component or tag (e.g. "<resi<FILL_ME>" or "<ca<FILL_ME>"). 
You must detect that the user started a JSX element and complete ONLY the remaining part.

⚠️ STRICT rules:
- Always close each JSX component with exactly one "/>". Never add more than one. For example: <netlabel ... /> is valid, but <netlabel ... /> /> is invalid.

- When continuing a partially typed tag (like "<net<FILL_ME>"), you MUST only complete it by appending exactly the remaining characters needed to form a valid component name from the README. 
- For example, if "net" is a valid component in the README and the input is "<net", you produce nothing else after "net" except its props. You never create "netnet".
- If the partial does not match the start of any valid component, output nothing.
- When continuing a partial tag (like "<tes<FILL_ME>"), you must first check if there is any valid component in the README that starts with the partial text. Only complete it if it matches the start of an actual component documented in the README. 
- If there is no valid component that starts with that partial text, output nothing.
- You must always output a full valid JSX element. If the prefix does not already contain an opening tag ("<"), your output must start with "<".
- Even if there is already text on the line before <FILL_ME>, you must treat <FILL_ME> as requiring a complete, standalone JSX component. Never try to merge it with what’s before it. 
- You must never omit the "<" at the start of your component unless explicitly continuing a partially typed tag (like "<cap<FILL_ME>").
- Only complete exactly one JSX component, and nothing more.
- If the input line does NOT already contain a "<", then you MUST start your output with "<" followed by the component name. Example: "<resistor ... />"
- If the input line DOES contain a "<" followed by a partial component (like "<tes"), continue immediately after the existing "<" without adding another "<".
- If the input line already contains a "<", NEVER add another "<". Continue immediately after it to finish the tag.
- If there is NO "<" in the input line, you MUST start your output with the full component including "<", like "<resistor ... />".
- If the partial component name after "<" does NOT exactly match the start of a valid component documented in the README, output absolutely nothing. Never guess or try to match it to something else. Just return an empty output.
- If the partially typed component (like "<test<FILL_ME>") does NOT match any valid component documented in the README, then STOP. Do not try to continue it, do not guess. Output nothing.
- If the input ends with a space after a partial component (like "<net "), you must recognize that "net" is the component and add only its valid props exactly as documented in the README.
- NEVER repeat the component name as a prop (e.g. never do <chip chip=... />).
- NEVER start your completion with any spaces, tabs, or newlines. Your output MUST start immediately at the first character.
- NEVER repeat what is already typed.
- NEVER add the component name itself as a prop. For example, for <chip>, NEVER write chip="...". Only include valid props documented in the README.
- You must complete exactly ONE JSX component, starting it with "<" if the input does not already contain "<", or continuing the tag if it does. 
- After finishing that single component (ending with "/>"), your output must STOP. Never add a second JSX element or anything else after it.


Requirements:
- Only use JSX components that are explicitly documented in the README.md.
- Each JSX component MUST include: name, footprint, pcbX, pcbY, schX, schY.
- You MUST carefully read the README.md context and type/interface definitions to determine which props are valid for each component.
- Include ALL props that are required or non-optional for that component. For example, a <resistor> must also have a resistance prop.
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
- Input: "<FILL_ME>"
  Output: <resistor name="R1" footprint="0603" pcbX={5} pcbY={7} schX={1} schY={2} resistance={1000} />

- Input: "<ca<FILL_ME>"
  Output: pacitor name="C1" footprint="0805" pcbX={10} pcbY={15} schX={3} schY={4} />

- Input: "<chip<FILL_ME>"
  Output: name="U1" footprint="SOIC-8" pinLabels={{}} pcbX={0} pcbY={0} schX={0} schY={0} />

- Input: "<test<FILL_ME>"
  Output: point name="TP1" footprint="0402" pcbX={0} pcbY={0} schX={0} schY={0} />

- Input: "<zzz<FILL_ME>"
  Output: 

- Input with existing unrelated text on the line:
  "const foo = 123; <FILL_ME>"
  Output: <capacitor name="C1" footprint="0402" capacitance="1000pF" pcbX={0} pcbY={0} schX={0} schY={0} />

- Input with no partial tag on the line:
  "<FILL_ME>"
  Output: <chip name="U1" footprint="SOIC-8" pinLabels={{}} pcbX={0} pcbY={0} schX={0} schY={0} />

- Input: "<test<FILL_ME>"
  Output: point name="TP1" footprintVariant="pad" padShape="circle" padDiameter={1} pcbX={0} pcbY={0} schX={0} schY={0} />

- Input: "<xyz<FILL_ME>"
  Output:

  Examples:
- Input: "<net<FILL_ME>"
  Output: name="NET1" connectsTo={[".R1 > .pin1", ".C1 > .pin1"]} />

- Input: "<netn<FILL_ME>"
  Output: 

- Input: "<netl<FILL_ME>"
  Output: abel name="N1" />  // ✅ exactly one closing "/>"

- NEVER do:
  Output: <netlabel name="N1" /> />





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

  return ctx.json({ prediction: predictionResult })
})
