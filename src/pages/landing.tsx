import analogSimulationImg from "@/assets/analogsimulation.png"
import autoroutingExampleVideo from "@/assets/autorouting_example.mp4"
import exampleAiCodingImg from "@/assets/example_ai_coding.png"
import importKicadLibraryImg from "@/assets/import-kicad-library.png"
import shareableLinkForCircuitImg from "@/assets/shareable-link-for-circuit.png"
import { FAQ } from "@/components/FAQ"
import { OptimizedImage } from "@/components/OptimizedImage"
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronDown,
  CircuitBoard,
  Copy,
  DollarSign,
  FileText,
  Library,
  Menu,
  Search,
  Sparkles,
  Terminal,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Link } from "wouter"

const surfaceTiles = [
  "bg-[#F8FAFC]",
  "bg-[#EFF6FF]",
  "bg-[#DBEAFE]",
  "bg-[#FFFFFF]",
]

const integrations = [
  "GitHub packages",
  "Browser previews",
  "KiCad import/export",
  "Gerber builds",
  "BOM checks",
  "AI code agents",
]

const heroViews = [
  {
    id: "code",
    label: "Code",
    shortLabel: "Code",
    title: "circuit.review.tsx",
    status: "source locked",
    accent: "#2563EB",
  },
  {
    id: "schematic",
    label: "Schematic",
    shortLabel: "Sch",
    title: "schematic.svg",
    status: "nets traced",
    accent: "#0284C7",
  },
  {
    id: "3d",
    label: "3D",
    shortLabel: "3D",
    title: "board.preview.glb",
    status: "parts placed",
    accent: "#0EA5E9",
  },
  {
    id: "gerber",
    label: "Gerber",
    shortLabel: "Gbr",
    title: "fabrication.zip",
    status: "export ready",
    accent: "#1D4ED8",
  },
] as const

const landingNavItems = [
  { label: "Examples", href: "/search", icon: FileText },
  { label: "Pricing", href: "/my-orders", icon: DollarSign },
  { label: "Features", href: "#features", icon: Sparkles, hasMenu: true },
  { label: "Enterprise", href: "mailto:hello@tscircuit.com", icon: Building2 },
  { label: "Blog", href: "https://blog.tscircuit.com", icon: BookOpen },
  {
    label: "Resources",
    href: "https://docs.tscircuit.com",
    icon: Library,
    hasMenu: true,
  },
]

const originalFeatureCards = [
  {
    meta: "01 · REACT",
    title: "JSX components for circuits",
    body: "Compose boards the way you compose UI. Props, children, hooks - but for resistors.",
    visual: "code",
  },
  {
    meta: "02 · AUTOROUTE",
    title: "Real-time autorouting",
    body: "Sub-second routing on 4-layer boards. Runs locally with LLM-compatible tweaking.",
    visual: "autoroute",
  },
  {
    meta: "03 · AI",
    title: "AI coding skills for hardware",
    body: "Give Claude Code, Codex, or custom agents the tscircuit skill with the CLI, syntax, workflow, and pre-fab context they need to make useful changes.",
    visual: "ai",
  },
  {
    meta: "04 · FAB",
    title: "Export every format you need",
    body: "Download PCB, schematic, and assembly images plus fabrication files, KiCad, DSN, JSON, and netlists from the same board source.",
    visual: "formats",
  },
  {
    meta: "05 · REVIEW",
    title: "Visual Diffs Inside GitHub",
    body: "All the capabilities of version control tool works natively with tscircuit. Approvals, comments, rollback.",
    visual: "review",
  },
  {
    meta: "06 · OSS",
    title: "Open & forkable",
    body: "Open source under MIT. Explore the tscircuit GitHub org, fork what you need, and build on top of it.",
    visual: "oss",
  },
  {
    meta: "07 · SIMULATION",
    title: "Analog Simulation",
    body: "Run analog simulations with tsci simulate on the command line or in the browser, backed by WebAssembly ngspice.",
    visual: "simulation",
  },
  {
    meta: "08 · KICAD",
    title: "First Class KiCad Support",
    body: "Import and export your library anywhere. Import KiCad files natively. Import your tscircuit packages directly into KiCad with native KiCad PCM support.",
    visual: "kicad",
  },
  {
    meta: "09 · BOM",
    title: "Automatic Part Selection",
    body: "Specify parts without part numbers. Bill of materials automatically generated based on realtime availability from supplier integrations.",
    visual: "bom",
  },
] as const

const CircuitCodeSnippet = () => (
  <pre className="landing-code-snippet">
    <code>
      <span className="syntax-keyword">export default</span>{" "}
      <span className="syntax-punctuation">() =&gt; (</span>
      {"\n  "}
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">board</span>{" "}
      <span className="syntax-attr">width</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;36mm&quot;</span>{" "}
      <span className="syntax-attr">height</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;28mm&quot;</span>
      <span className="syntax-punctuation">&gt;</span>
      {"\n    "}
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">chip</span>{" "}
      <span className="syntax-attr">name</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;U1&quot;</span>{" "}
      <span className="syntax-attr">footprint</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;soic8&quot;</span>{" "}
      <span className="syntax-punctuation">/&gt;</span>
      {"\n    "}
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">resistor</span>{" "}
      <span className="syntax-attr">name</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;R1&quot;</span>{" "}
      <span className="syntax-attr">resistance</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;10k&quot;</span>{" "}
      <span className="syntax-punctuation">/&gt;</span>
      {"\n    "}
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">capacitor</span>{" "}
      <span className="syntax-attr">name</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;C1&quot;</span>{" "}
      <span className="syntax-attr">capacitance</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;100nF&quot;</span>{" "}
      <span className="syntax-punctuation">/&gt;</span>
      {"\n    "}
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">trace</span>{" "}
      <span className="syntax-attr">from</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;U1.pin1&quot;</span>{" "}
      <span className="syntax-attr">to</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;R1.pin1&quot;</span>{" "}
      <span className="syntax-punctuation">/&gt;</span>
      {"\n    "}
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">trace</span>{" "}
      <span className="syntax-attr">from</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;U1.pin4&quot;</span>{" "}
      <span className="syntax-attr">to</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;C1.pin1&quot;</span>{" "}
      <span className="syntax-punctuation">/&gt;</span>
      {"\n    "}
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">autorouting</span>{" "}
      <span className="syntax-attr">strategy</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;cloud&quot;</span>{" "}
      <span className="syntax-attr">layers</span>
      <span className="syntax-punctuation">=</span>
      <span className="syntax-string">&quot;4&quot;</span>{" "}
      <span className="syntax-punctuation">/&gt;</span>
      {"\n  "}
      <span className="syntax-punctuation">&lt;/</span>
      <span className="syntax-tag">board</span>
      <span className="syntax-punctuation">&gt;</span>
      {"\n"}
      <span className="syntax-punctuation">)</span>
    </code>
  </pre>
)

const galleryBoards = [
  {
    owner: "tscircuit",
    name: "motor-controller",
    description: "4-layer drive board with inspectable routing artifacts.",
    stats: ["PCB", "3D", "Gerbers"],
    href: "/tscircuit/motor-controller",
  },
  {
    owner: "seveibar",
    name: "keyboard-default60",
    description: "Matrix layout, packages, and browser previews in source.",
    stats: ["60%", "Matrix", "Fab"],
    href: "/seveibar/keyboard-default60",
  },
  {
    owner: "seveibar",
    name: "led-water-accelerometer",
    description: "Sensor package with reviewable nets and fabrication output.",
    stats: ["Sensor", "BOM", "Review"],
    href: "/seveibar/led-water-accelerometer",
  },
] as const

const OriginalFeatureVisual = ({
  visual,
}: {
  visual: (typeof originalFeatureCards)[number]["visual"]
}) => {
  if (visual === "code") {
    return (
      <div className="landing-original-code">
        <CircuitCodeSnippet />
      </div>
    )
  }

  if (visual === "autoroute") {
    return (
      <div className="landing-original-autoroute" aria-label="Autorouting demo">
        <video
          className="h-full w-full object-cover"
          src={autoroutingExampleVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    )
  }

  if (visual === "ai") {
    return (
      <div className="landing-original-media">
        <OptimizedImage
          alt="AI coding example for tscircuit"
          className="h-full w-full object-cover"
          src={exampleAiCodingImg}
          height={220}
          width={420}
          priority
        />
      </div>
    )
  }

  if (visual === "formats") {
    return (
      <div className="landing-original-media landing-original-media-contain">
        <OptimizedImage
          alt="Multiple export formats available in tscircuit"
          className="h-full w-full object-contain"
          src={shareableLinkForCircuitImg}
          height={220}
          width={420}
          priority
        />
      </div>
    )
  }

  if (visual === "review") {
    return (
      <div className="landing-original-review" aria-label="Visual diff preview">
        {["Deleted", "Added"].map((label) => (
          <div key={label} className="landing-original-review-board">
            <span>{label}</span>
            <div className="landing-original-chip" />
            {[12, 28, 44, 65, 82].map((left) => (
              <i key={left} style={{ left: `${left}%` }} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (visual === "oss") {
    return (
      <div className="landing-original-chart" aria-label="Star history chart">
        <svg viewBox="0 0 360 150" role="img" aria-hidden="true">
          <path d="M22 130 C72 108 90 86 132 88 C190 92 212 70 248 56 C286 42 294 24 330 18" />
          <g>
            <line x1="24" y1="22" x2="24" y2="132" />
            <line x1="24" y1="132" x2="336" y2="132" />
          </g>
        </svg>
      </div>
    )
  }

  if (visual === "simulation") {
    return (
      <div className="landing-original-media landing-original-media-contain">
        <OptimizedImage
          alt="Analog simulation view in tscircuit"
          className="h-full w-full object-contain"
          src={analogSimulationImg}
          height={220}
          width={420}
          priority
        />
      </div>
    )
  }

  if (visual === "kicad") {
    return (
      <div className="landing-original-media landing-original-media-contain landing-original-media-dark">
        <OptimizedImage
          alt="KiCad library import workflow in tscircuit"
          className="h-full w-full object-contain"
          src={importKicadLibraryImg}
          height={220}
          width={420}
          priority
        />
      </div>
    )
  }

  return (
    <div className="landing-original-bom" aria-label="Bill of materials table">
      <div className="landing-original-bom-toolbar">
        <span>Run</span>
        <span>PCB</span>
        <span>Schematic</span>
        <span>BOM</span>
      </div>
      {["USBC", "LED", "SW1", "R1"].map((part, index) => (
        <div key={part} className="landing-original-bom-row">
          <span>{part}</span>
          <span>{index === 3 ? "1k" : "-"}</span>
          <span>C{index + 165748}</span>
        </div>
      ))}
    </div>
  )
}

const LandingTopBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const renderNavItem = (item: (typeof landingNavItems)[number]) => {
    const Icon = item.icon
    const content = (
      <>
        <Icon className="landing-topbar-icon" aria-hidden="true" />
        <span>{item.label}</span>
        {item.hasMenu && (
          <ChevronDown className="landing-topbar-chev" aria-hidden="true" />
        )}
      </>
    )

    if (item.href.startsWith("http") || item.href.startsWith("mailto:")) {
      return (
        <a key={item.label} href={item.href}>
          {content}
        </a>
      )
    }

    return (
      <Link key={item.label} href={item.href}>
        {content}
      </Link>
    )
  }

  return (
    <header className="landing-topbar">
      <div className="landing-topbar-inner">
        <nav className="landing-topbar-nav" aria-label="Homepage navigation">
          {landingNavItems.map(renderNavItem)}
        </nav>
        <div className="landing-topbar-actions">
          <button
            type="button"
            className="landing-topbar-search"
            aria-label="Search"
            onClick={() => {
              window.location.href = "/search"
            }}
          >
            <Search className="h-5 w-5" />
          </button>
          <a href="https://docs.tscircuit.com" className="landing-topbar-cta">
            Get Started
          </a>
          <button
            type="button"
            className="landing-topbar-menu"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <nav
          className="landing-topbar-mobile-nav"
          aria-label="Mobile homepage navigation"
        >
          {landingNavItems.map(renderNavItem)}
        </nav>
      )}
    </header>
  )
}

const LandingFooter = () => (
  <footer className="border-t border-[#CBD5E1] bg-[#F8FAFC] px-4 py-12 text-[#0F172A] md:px-6">
    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_2fr]">
      <div>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563EB] text-[#F8FAFC]">
            <CircuitBoard className="h-5 w-5" />
          </div>
          <span className="font-['Anybody',sans-serif] text-2xl font-extrabold">
            tscircuit
          </span>
        </div>
        <p className="mt-4 max-w-sm text-sm leading-6 text-[#64748B]">
          Code-first electronics for browser previews, AI edits, source control,
          and manufacturing output.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 text-sm md:grid-cols-4">
        {[
          {
            title: "Product",
            links: [
              ["Editor", "/quickstart"],
              ["Latest", "/latest"],
              ["Trending", "/trending"],
            ],
          },
          {
            title: "Resources",
            links: [
              ["Docs", "https://docs.tscircuit.com"],
              ["Search", "/search"],
              ["GitHub", "https://github.com/tscircuit/tscircuit"],
            ],
          },
          {
            title: "Community",
            links: [
              ["Discord", "https://tscircuit.com/join"],
              ["Blog", "https://blog.tscircuit.com"],
              ["YouTube", "https://youtube.com/@seveibar"],
            ],
          },
          {
            title: "Company",
            links: [
              ["Contact", "mailto:hello@tscircuit.com"],
              ["Terms", "https://tscircuit.com/legal/terms-of-service"],
              ["Privacy", "https://tscircuit.com/legal/privacy-policy"],
            ],
          },
        ].map((group) => (
          <nav key={group.title} className="space-y-3">
            <h3 className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
              {group.title}
            </h3>
            <div className="flex flex-col gap-2">
              {group.links.map(([name, href]) =>
                href.startsWith("http") || href.startsWith("mailto:") ? (
                  <a key={name} href={href} className="text-[#64748B]">
                    {name}
                  </a>
                ) : (
                  <Link key={name} href={href} className="text-[#64748B]">
                    {name}
                  </Link>
                ),
              )}
            </div>
          </nav>
        ))}
      </div>
    </div>
  </footer>
)

export function LandingPage() {
  const [activeHeroViewIndex, setActiveHeroViewIndex] = useState(0)
  const activeHeroView = heroViews[activeHeroViewIndex]

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveHeroViewIndex((current) => (current + 1) % heroViews.length)
    }, 3200)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="tscircuit-landing min-h-screen bg-[#F8FAFC] font-['DM_Sans',sans-serif] text-[#0F172A]">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@88,700;88,800;100,800&family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://docs.tscircuit.com" />
        <link rel="dns-prefetch" href="https://docs.tscircuit.com" />
      </Helmet>
      <a
        href="https://docs.tscircuit.com"
        className="landing-announcement-strip"
      >
        <Sparkles className="h-4 w-4" />
        <span>Get started with our new tutorial series</span>
        <ArrowRight className="h-4 w-4" />
      </a>
      <LandingTopBar />
      <main className="overflow-hidden">
        <section className="landing-grid-field landing-hero-section relative bg-[#F8FAFC] px-4 pb-16 pt-8 md:px-6 md:pb-24 lg:pt-10">
          <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(37,99,235,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.12)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(135deg,rgba(37,99,235,.18)_0_1px,transparent_1px_34px),linear-gradient(45deg,rgba(14,165,233,.14)_0_1px,transparent_1px_28px)]" />
          <div className="absolute right-0 top-20 hidden w-[42vw] grid-cols-5 gap-2 opacity-75 lg:grid">
            {surfaceTiles
              .concat(surfaceTiles, surfaceTiles)
              .map((tile, index) => (
                <div
                  key={`hero-tile-${index}`}
                  className={`h-16 rounded-[18px] border border-[#CBD5E1] ${tile} ${
                    index % 4 === 0 ? "border-[#2563EB]/60" : ""
                  } ${index % 5 === 2 ? "translate-y-8" : ""}`}
                />
              ))}
          </div>
          <div className="relative mx-auto flex h-full max-w-[1680px] flex-col">
            <div className="mb-6 grid gap-3 border-y border-[#CBD5E1] bg-[#DBEAFE]/80 px-4 py-3 font-['Space_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB] md:grid-cols-[auto_1fr_auto] md:items-center">
              <Sparkles className="h-4 w-4" />
              <span>AI electronics workbench</span>
              <span className="text-[#64748B] md:text-right">
                TSX · Schematics · PCB · 3D · Gerbers
              </span>
            </div>
            <div className="grid flex-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(560px,720px)] lg:items-center">
              <div>
                <div className="mb-5 font-['Space_Mono',monospace] text-sm font-bold uppercase tracking-[0.32em] text-[#64748B]">
                  The hardware framework for AI teams
                </div>
                <h1 className="max-w-[980px] font-['Anybody',sans-serif] text-[50px] font-extrabold leading-[.9] tracking-normal text-[#0F172A] sm:text-[72px] lg:text-[98px] xl:text-[108px]">
                  The #1 framework for{" "}
                  <span className="bg-[#DBEAFE] px-2 text-[#0F172A]">
                    AI-generated
                  </span>{" "}
                  electronics.
                </h1>
                <p className="mt-7 max-w-[860px] text-xl leading-9 text-[#334155] md:text-2xl">
                  Design production PCBs in TypeScript. Version them in git. Let
                  agents iterate on them.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#2563EB] px-6 font-['Space_Mono',monospace] text-[14px] font-bold text-white"
                  >
                    npm install -g tscircuit
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <a
                    href="https://docs.tscircuit.com"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#0F172A] bg-white px-6 font-['Space_Mono',monospace] text-[14px] font-bold text-[#0F172A]"
                  >
                    Read the docs
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="mt-9 grid max-w-xl grid-cols-3 gap-6">
                  {[
                    ["2.3k", "Repo stars"],
                    ["304", "Public repos"],
                    ["397", "Contributors"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <div className="font-['Anybody',sans-serif] text-3xl font-extrabold leading-none text-[#0F172A]">
                        {value}
                      </div>
                      <div className="mt-1 font-['Space_Mono',monospace] text-xs text-[#64748B]">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative min-w-0">
                <div className="absolute -right-4 -top-5 hidden h-28 w-28 rounded-[28px] border border-[#2563EB]/60 bg-[#2563EB]/10 lg:block" />
                <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 grid-cols-3 gap-2 lg:grid">
                  {surfaceTiles.slice(0, 9).map((tile, index) => (
                    <span
                      key={`panel-tile-${index}`}
                      className={`rounded-lg border border-[#CBD5E1] ${tile}`}
                    />
                  ))}
                </div>
                <div className="landing-corner-grid relative min-w-0 overflow-hidden rounded-3xl border border-[#CBD5E1] bg-[#EFF6FF] p-3 shadow-[0_24px_80px_rgba(37,99,235,.18)] sm:p-4">
                  <div className="rounded-2xl border border-[#CBD5E1] bg-[#FFFFFF]">
                    <div className="flex items-center justify-between gap-3 border-b border-[#CBD5E1] px-4 py-3">
                      <div className="min-w-0 flex items-center gap-2 font-['Space_Mono',monospace] text-xs text-[#64748B]">
                        <Terminal
                          className="h-4 w-4 shrink-0"
                          style={{ color: activeHeroView.accent }}
                        />
                        <span className="truncate">{activeHeroView.title}</span>
                      </div>
                      <div
                        className="shrink-0 rounded px-2 py-1 font-['Space_Mono',monospace] text-[10px] font-bold uppercase text-[#F8FAFC]"
                        style={{ backgroundColor: activeHeroView.accent }}
                      >
                        {activeHeroView.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 border-b border-[#CBD5E1] bg-[#F8FAFC] p-2">
                      {heroViews.map((view, index) => {
                        const isActive = activeHeroView.id === view.id
                        return (
                          <button
                            type="button"
                            key={view.id}
                            onClick={() => setActiveHeroViewIndex(index)}
                            className={`h-10 min-w-0 rounded-md border px-1 font-['Space_Mono',monospace] text-[9px] font-bold uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] sm:px-2 sm:text-[10px] ${
                              isActive
                                ? "border-[#2563EB] bg-[#2563EB] text-[#F8FAFC]"
                                : "border-[#CBD5E1] bg-[#FFFFFF] text-[#64748B]"
                            }`}
                            aria-pressed={isActive}
                          >
                            <span className="sm:hidden">{view.shortLabel}</span>
                            <span className="hidden sm:inline">
                              {view.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="p-3 sm:p-4">
                      <div
                        key={activeHeroView.id}
                        className="landing-demo-panel landing-scanlines relative h-[340px] overflow-hidden rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 sm:h-[380px] lg:h-[380px]"
                      >
                        {activeHeroView.id === "code" && (
                          <div className="landing-hero-code-panel">
                            <CircuitCodeSnippet />
                          </div>
                        )}

                        {activeHeroView.id === "schematic" && (
                          <div className="absolute inset-4 grid grid-cols-6 grid-rows-5">
                            <div className="col-span-6 row-start-3 h-px bg-[#0284C7]/70" />
                            <div className="col-start-2 row-span-5 row-start-1 w-px bg-[#0284C7]/50" />
                            <div className="col-start-5 row-span-5 row-start-1 w-px bg-[#0284C7]/50" />
                            {["VCC", "U1", "R1", "C1", "GND", "OUT"].map(
                              (node, index) => (
                                <div
                                  key={node}
                                  className="z-10 grid h-14 w-16 place-items-center rounded-lg border border-[#0284C7] bg-[#FFFFFF] font-['Space_Mono',monospace] text-[11px] font-bold text-[#1E3A8A]"
                                  style={{
                                    gridColumn: `${(index % 3) * 2 + 1} / span 1`,
                                    gridRow: `${Math.floor(index / 3) * 3 + 1} / span 1`,
                                  }}
                                >
                                  {node}
                                </div>
                              ),
                            )}
                          </div>
                        )}

                        {activeHeroView.id === "3d" && (
                          <div className="flex h-full items-center justify-center [perspective:900px]">
                            <div className="relative h-36 w-[82%] max-w-72 rotate-x-[58deg] rotate-z-[-18deg] rounded-2xl border-2 border-[#0EA5E9] bg-[#DBEAFE] shadow-[0_28px_70px_rgba(14,165,233,.20)] sm:h-44">
                              <div className="absolute left-[12%] top-[18%] h-[32%] w-[34%] rounded-md border border-[#DBEAFE] bg-[#F8FAFC]" />
                              <div className="absolute bottom-[18%] right-[12%] h-[28%] w-[28%] rounded-md border border-[#0284C7] bg-[#EFF6FF]" />
                              {[8, 22, 36, 68, 84].map((left) => (
                                <span
                                  key={left}
                                  className="absolute top-4 h-3 w-3 rounded-full bg-[#0EA5E9]"
                                  style={{ left: `${left}%` }}
                                />
                              ))}
                              {[12, 30, 48, 66, 82].map((left) => (
                                <span
                                  key={left}
                                  className="absolute bottom-5 h-2 w-[14%] rounded-full bg-[#2563EB]/80"
                                  style={{ left: `${left}%` }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {activeHeroView.id === "gerber" && (
                          <div className="relative h-full">
                            {[
                              "border-[#2563EB] translate-x-0 translate-y-0",
                              "border-[#1D4ED8] translate-x-5 translate-y-5",
                              "border-[#0284C7] translate-x-10 translate-y-10",
                              "border-[#0EA5E9] translate-x-14 translate-y-14",
                            ].map((layer, index) => (
                              <div
                                key={layer}
                                className={`absolute inset-8 rounded-2xl border-2 ${layer} bg-[#FFFFFF]/35`}
                              >
                                <div className="absolute left-8 top-8 h-12 w-20 rounded border border-current" />
                                <div className="absolute bottom-8 right-8 h-16 w-24 rounded-full border border-current" />
                                <div className="absolute left-10 right-10 top-1/2 h-px bg-current" />
                                <span className="absolute right-4 top-3 font-['Space_Mono',monospace] text-[10px] font-bold text-current">
                                  L{index + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#2563EB] py-4 text-[#F8FAFC]">
          <div className="mx-auto flex max-w-7xl gap-8 overflow-hidden px-4 font-['Space_Mono',monospace] text-sm font-bold uppercase tracking-[0.12em] md:px-6">
            {[...integrations, ...integrations].map((item, index) => (
              <span key={`${item}-${index}`} className="shrink-0">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section
          id="features"
          className="landing-original-section landing-tile-field"
          aria-labelledby="features-title"
        >
          <div className="landing-original-shell">
            <div className="landing-original-eyebrow">Why teams switch</div>
            <h2 id="features-title">Everything your EE team needs, as code.</h2>
            <p className="landing-original-sub">
              Built for hardware startups who move at software speed. Every
              feature composable, inspectable, diffable in a PR.
            </p>

            <div className="landing-original-feature-grid">
              {originalFeatureCards.map((feature) => (
                <article key={feature.title} className="landing-original-card">
                  <div>
                    <div className="landing-original-meta">{feature.meta}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </div>
                  <OriginalFeatureVisual visual={feature.visual} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-original-section landing-original-playground"
          aria-labelledby="playground-title"
        >
          <div className="landing-original-playground-grid">
            <div>
              <div className="landing-original-eyebrow">
                Develop like it&apos;s a website
              </div>
              <h2 id="playground-title">Instant previews in the browser.</h2>
              <p className="landing-original-sub">
                Every save re-renders the schematic, PCB, and 3D view - the same
                loop you have with Next.js or Vite, but for hardware. No IDE to
                install, no toolchain to babysit. 50+ reference boards ready to
                fork.
              </p>
              <a className="landing-original-button" href="/playground">
                Open playground
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="landing-original-browser">
              <div className="landing-original-browser-top">
                <span />
                <span />
                <span />
                <strong>index.circuit.tsx</strong>
              </div>
              <div className="landing-original-browser-body">
                <div className="landing-original-browser-code">
                  <CircuitCodeSnippet />
                </div>
                <div className="landing-original-browser-board">
                  <div className="landing-original-board-shape" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="landing-original-section"
          aria-labelledby="gallery-title"
        >
          <div className="landing-original-shell">
            <div className="landing-original-eyebrow">
              Shipped with tscircuit
            </div>
            <h2 id="gallery-title">Boards teams actually sent to fab.</h2>
            <div className="landing-original-gallery">
              {galleryBoards.map((board, index) => (
                <a
                  key={board.name}
                  className="landing-original-gallery-board"
                  href={board.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div
                    className={`landing-original-pcb landing-original-pcb-${index + 1}`}
                  >
                    <span className="landing-pcb-chip landing-pcb-chip-main" />
                    <span className="landing-pcb-chip landing-pcb-chip-sub" />
                    <span className="landing-pcb-trace landing-pcb-trace-a" />
                    <span className="landing-pcb-trace landing-pcb-trace-b" />
                    <span className="landing-pcb-trace landing-pcb-trace-c" />
                    <span className="landing-pcb-pad landing-pcb-pad-a" />
                    <span className="landing-pcb-pad landing-pcb-pad-b" />
                    <span className="landing-pcb-pad landing-pcb-pad-c" />
                    <div className="landing-pcb-toolbar">
                      <span>Source</span>
                      <span>PCB</span>
                      <span>Fab</span>
                    </div>
                  </div>
                  <div>
                    <div className="landing-original-board-owner">
                      {board.owner}
                    </div>
                    <div className="landing-original-board-name">
                      {board.name}
                    </div>
                    <p>{board.description}</p>
                    <div className="landing-original-board-stats">
                      {board.stats.map((stat) => (
                        <span key={`${board.name}-${stat}`}>{stat}</span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="landing-original-gallery-more">
              <a className="landing-original-button-secondary" href="/trending">
                Browse gallery · 240 boards
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <div className="landing-faq bg-[#F8FAFC]">
          <FAQ />
        </div>

        <section
          className="landing-original-section landing-original-careers"
          aria-labelledby="careers-title"
        >
          <div className="landing-original-careers-row">
            <div>
              <div className="landing-original-eyebrow">Careers</div>
              <h2 id="careers-title">
                We&apos;re hiring EEs, compiler nerds, and autorouting wizards.
              </h2>
              <p className="landing-original-sub">
                Remote-friendly. Work on the stuff you wish existed when you
                were at your last hardware job.
              </p>
              <div className="landing-careers-roles">
                {[
                  "Electrical engineering",
                  "Compiler/runtime",
                  "Autorouting",
                  "Developer tools",
                ].map((role) => (
                  <span key={role}>{role}</span>
                ))}
              </div>
            </div>
            <div className="landing-careers-panel">
              <div className="landing-careers-terminal">
                <span>hiring.pipeline.tsx</span>
                <strong>4 open tracks</strong>
              </div>
              <div className="landing-careers-circuit">
                {["EE", "CAD", "AI", "FAB"].map((node) => (
                  <span key={node}>{node}</span>
                ))}
              </div>
              <a
                className="landing-original-button"
                href="mailto:careers@tscircuit.com"
              >
                Get In Touch
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
