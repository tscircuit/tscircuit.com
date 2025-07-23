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
  <chip name="U<number>" footprint="<valid footprint>" pinLabels={{}} pcbX={0} pcbY={0} schX={0} schY={0} />
- Determine the next sequential name automatically: e.g. U1, U2, U3.
- Only use valid footprints and pinLabels from the README.
- Some components like <netlabel> do not have a 'name' prop — do not add it for those.

STRICT rules:
- If partial like "<capa", only append remaining "citor". Never repeat letters. 
- If input is "<capacitor", add only props, never repeat tag. 
- Always produce exactly one JSX component, starting with "<" if needed. 
- If partial doesn’t match any valid component, output nothing. 
- Never output two JSX elements. Always end with exactly one "/>". 
- Never add duplicate closing "/>". 
- Never output the component name as a prop. 
- Never add whitespace before your completion.
- If the input is exactly "<", then start with the component name directly (like "resistor ... />") without adding another "<".
- So that the final result is "<resistor ... />", not "<<resistor ... />".
- Never produce a double "<".

Examples:
- Input: "<FILL_ME>"
  Output: <resistor name="R1" footprint="0603" pcbX={5} pcbY={7} schX={1} schY={2} resistance={1000} />
- Input: "<ca<FILL_ME>"
  Output: pacitor name="C1" footprint="0805" pcbX={10} pcbY={15} schX={3} schY={4} />
- Input: "<chip<FILL_ME>"
  Output: name="U1" footprint="SOIC-8" pinLabels={{}} pcbX={0} pcbY={0} schX={0} schY={0} />
- Input: "<netl<FILL_ME>"
  Output: abel name="N1" />
- NEVER output: <capacitor capacitor ... /> or <netnet ... />
- Input: "<"
  Output: resistor name="R1" footprint="0603" pcbX={5} pcbY={7} schX={1} schY={2} resistance={1000} />
- Input: "<ca"
  Output: pacitor name="C1" footprint="0805" pcbX={10} pcbY={15} schX={3} schY={4} />
- Input: "<capacitor"
  Output:  capacitance="1000pF" footprint="0805" name="C1" pcbX={10} pcbY={15} schX={3} schY={4} />`

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: `${prefix}<FILL_ME>${suffix}` },
    ],
    model,
  })

  return chatCompletion.choices[0].message?.content ?? ""
}
export default withRouteSpec({
  methods: ["POST"],
  auth: "session", // ✅ Require user to be signed in
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
  return ctx.json({ prediction: predictionResult })
})
