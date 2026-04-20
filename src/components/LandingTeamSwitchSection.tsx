import { OptimizedImage } from "@/components/OptimizedImage"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import bomImg from "@/assets/BOM.png"
import autoroutingExampleVideo from "@/assets/autorouting_example.mp4"
import analogSimulationImg from "@/assets/analogsimulation.png"
import exampleAiCodingImg from "@/assets/example_ai_coding.png"
import importKicadLibraryImg from "@/assets/import-kicad-library.png"
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
  {
    step: "07",
    label: "Simulation",
    title: "Analog Simulation",
    description:
      "Run analog simulations in your browser or on the command line via WebAssembly ngspice.",
    preview: "simulation" as const,
  },
  {
    step: "08",
    label: "KiCad",
    title: "First Class KiCad Support",
    description:
      "Import your library anywhere. Enable KiCad PCM to have every tscircuit package automatically serve components and subcircuits as importable KiCad modules.",
    preview: "kicad" as const,
  },
  {
    step: "09",
    label: "BOM",
    title: "Automatic Part Selection",
    description:
      "Specify parts without part numbers. Bill of materials automatically generated based on realtime availability from supplier integrations.",
    preview: "bom" as const,
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
      <div className="flex h-[280px] flex-col overflow-hidden rounded-lg border border-slate-800 bg-[#171717]">
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
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-black dark:border-slate-800">
        <video
          className="h-[280px] w-full object-cover"
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
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 dark:border-slate-800">
        <OptimizedImage
          alt="AI coding workflow for hardware"
          className="h-[280px] w-full object-cover object-center"
          src={exampleAiCodingImg}
          width={640}
          height={352}
        />
      </div>
    )
  }

  if (preview === "export") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <OptimizedImage
          alt="Export formats interface"
          className="h-[280px] w-full object-cover object-top"
          src={multipleFormatsImg}
          width={640}
          height={352}
        />
      </div>
    )
  }

  if (preview === "review") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-[#21262d] dark:border-slate-800">
        <OptimizedImage
          alt="Visual review interface"
          className="h-[280px] w-full object-cover object-top"
          src="/assets/editor_example_1_more_square.webp"
          width={640}
          height={352}
        />
      </div>
    )
  }

  if (preview === "simulation") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <OptimizedImage
          alt="Analog simulation view in tscircuit"
          className="h-[280px] w-full object-fill object-center"
          src={analogSimulationImg}
          width={640}
          height={352}
        />
      </div>
    )
  }

  if (preview === "kicad") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <OptimizedImage
          alt="KiCad library import workflow in tscircuit"
          className="h-[280px] w-full object-cover object-center"
          src={importKicadLibraryImg}
          width={640}
          height={352}
        />
      </div>
    )
  }

  if (preview === "bom") {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <OptimizedImage
          alt="Automatic part selection and bill of materials in tscircuit"
          className="h-[280px] w-full object-center"
          src={bomImg}
          width={640}
          height={352}
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <a
        href="https://www.star-history.com/?repos=tscircuit%2Ftscircuit&type=date&legend=top-left"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          alt="Star History Chart"
          className="h-[280px] w-full object-fill"
          src="https://api.star-history.com/chart?repos=tscircuit/tscircuit&type=date&legend=top-left"
        />
      </a>
    </div>
  )
}

export function LandingTeamSwitchSection() {
  return (
    <section className="relative w-full overflow-hidden border-y border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-950/50 md:py-20 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_20%)]" />
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl min-w-0">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
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

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sectionCards.map((card) => (
            <article
              key={card.title}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition-colors dark:border-slate-800 dark:bg-slate-900/80 md:p-5"
            >
              <p
                className="text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {card.step} · {card.label}
              </p>
              <h3
                className="mt-2 text-[18px] font-semibold leading-[1.2] text-slate-900 dark:text-slate-50 sm:max-w-[18ch]"
                style={{ fontFamily: '"Geist", system-ui, sans-serif' }}
              >
                {card.title}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.45] text-slate-600 dark:text-slate-300 sm:min-h-[3.8rem]">
                {card.description}
              </p>
              <div className="mt-4">
                <FeaturePreview preview={card.preview} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
