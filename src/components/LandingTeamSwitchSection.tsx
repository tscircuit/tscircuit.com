import { OptimizedImage } from "@/components/OptimizedImage"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import autoroutingExampleVideo from "@/assets/autorouting_example.mp4"
import exampleAiCodingImg from "@/assets/example_ai_coding.png"
import multipleFormatsImg from "@/assets/multiple_formats.png"
import { useMemo } from "react"

const sectionCards = [
  {
    step: "01",
    label: "React",
    title: "JSX components for circuits",
    description:
      "Compose boards the way you compose UI. Props, children, hooks, and reusable subcircuits.",
    preview: "code" as const,
  },
  {
    step: "02",
    label: "Autoroute",
    title: "Autorouter in the cloud",
    description:
      "Sub-second routing on 4-layer boards. Results pinned to your commit SHA and ready to review.",
    preview: "autoroute" as const,
  },
  {
    step: "03",
    label: "AI",
    title: "AI coding skills for hardware",
    description:
      "Give Claude Code and custom agents a tscircuit skill with the CLI, syntax, workflow, and pre-fab context they need.",
    preview: "ai" as const,
  },
  {
    step: "04",
    label: "Fab",
    title: "Export every format you need",
    description:
      "Download PCB, schematic, and assembly images plus fabrication files, KiCad, DSN, JSON, and netlists from the same board source.",
    preview: "export" as const,
  },
  {
    step: "05",
    label: "Review",
    title: "PR-native schematic review",
    description:
      "Visual diffs of schematic and PCB changes fit right into GitHub so approvals stay tied to code review.",
    preview: "review" as const,
  },
  {
    step: "06",
    label: "OSS",
    title: "Open and forkable",
    description:
      "MIT licensed with a growing public package ecosystem. Fork the stack, contribute upstream, and own your workflow.",
    preview: "chart" as const,
  },
]

const miniTsxPreviewCode = `import { RedLed } from "@tsci/seveibar.red-led"
import { PushButton } from "@tsci/seveibar.push-button"
import { SmdUsbC } from "@tsci/seveibar.smd-usb-c"

export default () => {
  return (
    <board width="12mm" height="30mm" schAutoLayoutEnabled>
      <SmdUsbC name="USBC" pcbY={-10} />
      <RedLed name="LED" pcbY={12} />
      <PushButton name="SW1" pcbY={0} />
      <resistor name="R1" footprint="0603" resistance="1k" pcbY={7} />

      {/* USBC Power Connections */}
      <trace from="USBC.GND1" to="net.GND" />
      <trace from="USBC.GND2" to="net.GND" />
      <trace from="USBC.VBUS1" to="net.VBUS" />
      <trace from="USBC.VBUS2" to="net.VBUS" />

      <trace from="LED.neg" to="net.GND" />
      <trace from=".R1 > .neg" to="LED.pos" />

      <trace from="SW1.pin2" to="R1.pos" />
      <trace from="SW1.pin3" to="net.VBUS" />
    </board>
  )
}
`

function FeaturePreview({
  preview,
}: { preview: (typeof sectionCards)[number]["preview"] }) {
  const { highlighter } = useShikiHighlighter()
  const highlightedMiniTsx = useMemo(() => {
    if (!highlighter) return null
    return highlighter.codeToHtml(miniTsxPreviewCode, {
      lang: "tsx",
      theme: "github-dark",
    })
  }, [highlighter])

  if (preview === "code") {
    return (
      <div className="flex aspect-[16/10] flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#171717] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
          <span>jsx circuit</span>
          <span>index.circuit.tsx</span>
        </div>
        <div className="flex-1 overflow-auto px-3 py-3 text-[12px] leading-5 text-slate-200">
          {highlightedMiniTsx ? (
            <div
              className="[&_.shiki]:!bg-transparent [&_.shiki]:m-0 [&_.shiki]:p-0 [&_.shiki]:text-[12px] [&_.shiki]:leading-5"
              dangerouslySetInnerHTML={{ __html: highlightedMiniTsx }}
            />
          ) : (
            <pre className="whitespace-pre">
              <code>{miniTsxPreviewCode}</code>
            </pre>
          )}
        </div>
      </div>
    )
  }

  if (preview === "autoroute") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-black shadow-sm dark:border-slate-800">
        <div className="border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
          autorouting demo
        </div>
        <video
          className="aspect-[16/8.8] w-full object-cover"
          src={autoroutingExampleVideo}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    )
  }

  if (preview === "ai") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm dark:border-slate-800">
        <div className="border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
          ai coding workflow
        </div>
        <OptimizedImage
          alt="AI coding workflow for hardware"
          className="aspect-[16/8.8] w-full object-cover object-center"
          src={exampleAiCodingImg}
          width={640}
          height={352}
        />
      </div>
    )
  }

  if (preview === "export") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
          export formats
        </div>
        <OptimizedImage
          alt="Export formats interface"
          className="aspect-[16/8.8] w-full object-cover object-top"
          src={multipleFormatsImg}
          width={640}
          height={352}
        />
      </div>
    )
  }

  if (preview === "review") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#21262d] shadow-sm dark:border-slate-800">
        <div className="border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
          review screenshot
        </div>
        <OptimizedImage
          alt="Visual review interface"
          className="aspect-[16/8.8] w-full object-cover object-top"
          src="/assets/editor_example_1_more_square.webp"
          width={640}
          height={352}
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
        star history
      </div>
      <a
        href="https://www.star-history.com/?repos=tscircuit%2Ftscircuit&type=date&legend=top-left"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          alt="Star History Chart"
          className="aspect-[16/8.8] w-full object-cover"
          src="https://api.star-history.com/chart?repos=tscircuit/tscircuit&type=date&legend=top-left"
        />
      </a>
    </div>
  )
}

export function LandingTeamSwitchSection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950/50 md:py-16 lg:py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_20%)]" />
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
            Why teams switch
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
            Everything your EE team needs, as code.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
            Built for hardware startups who move at software speed. Every
            feature composable, inspectable, and reviewable in a PR.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sectionCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_30px_rgba(15,23,42,0.05)] transition-colors dark:border-slate-800 dark:bg-slate-900/80"
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                {card.step} · {card.label}
              </p>
              <h3 className="mt-3 text-[1.65rem] font-semibold leading-tight text-slate-900 dark:text-slate-50">
                {card.title}
              </h3>
              <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-slate-600 dark:text-slate-300">
                {card.description}
              </p>
              <div className="mt-4">
                <FeaturePreview preview={card.preview} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
