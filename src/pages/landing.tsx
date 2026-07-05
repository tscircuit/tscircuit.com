import analogSimulationImg from "@/assets/analogsimulation.png"
import autoroutingExampleVideo from "@/assets/autorouting_example.mp4"
import exampleAiCodingImg from "@/assets/example_ai_coding.png"
import importKicadLibraryImg from "@/assets/import-kicad-library.png"
import shareableLinkForCircuitImg from "@/assets/shareable-link-for-circuit.png"
import { FAQ } from "@/components/FAQ"
import { OptimizedImage } from "@/components/OptimizedImage"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useSignIn } from "@/hooks/use-sign-in"
import {
  ArrowRight,
  BookOpen,
  Bot,
  Boxes,
  Braces,
  Building2,
  ChevronDown,
  CircuitBoard,
  Code2,
  Copy,
  DollarSign,
  FileText,
  GitBranch,
  Library,
  Menu,
  Search,
  Sparkles,
  Terminal,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Link } from "wouter"
import { navigate } from "wouter/use-browser-location"

const featureCards = [
  {
    label: "SCHEMATIC",
    title: "React components become real circuits.",
    body: "Write boards, subcircuits, footprints, traces, probes, and exports in TypeScript instead of dragging opaque files around.",
    icon: CircuitBoard,
    accent: "text-[#2563EB]",
  },
  {
    label: "AI-READY",
    title: "Agents can edit electronics like code.",
    body: "tscircuit projects are inspectable source, so Codex, Claude Code, and other agents can initialize, modify, review, and repair designs.",
    icon: Bot,
    accent: "text-[#0284C7]",
  },
  {
    label: "FAB OUTPUT",
    title: "Render once, ship many formats.",
    body: "Generate schematics, PCBs, 3D previews, Gerbers, KiCad assets, SPICE netlists, BOMs, and assembly context from the same source.",
    icon: Boxes,
    accent: "text-[#0EA5E9]",
  },
]

const processSteps = [
  {
    step: "STEP 01",
    title: "Describe the board",
    body: "Start from TSX, an AI prompt, or a reusable package. Component intent stays readable in source control.",
  },
  {
    step: "STEP 02",
    title: "Render every view",
    body: "The same circuit becomes browser schematics, PCB layouts, 3D previews, simulations, and reviewable artifacts.",
  },
  {
    step: "STEP 03",
    title: "Route, test, export",
    body: "Run autorouting, ngspice simulation, KiCad interop, and manufacturing exports without leaving the code workflow.",
  },
]

const bugCards = [
  {
    tag: "AUTOROUTE",
    path: "boards/led-water-accelerometer.tsx",
    title: "Near-instant board iteration",
    body: "Jumpers, layers, and route passes can be expressed as configuration rather than manual board surgery.",
    color: "border-[#2563EB]/60",
  },
  {
    tag: "SIMULATION",
    path: "examples/full-wave-rectifier.tsx",
    title: "SPICE where the source lives",
    body: "Voltage probes and ngspice settings are part of the circuit definition, so review includes behavior.",
    color: "border-[#3B82F6]/70",
  },
  {
    tag: "KICAD",
    path: "packages/RP2040.kicad_mod",
    title: "Existing libraries still matter",
    body: "Import footprints and export KiCad files when collaboration or manufacturing needs traditional formats.",
    color: "border-[#1D4ED8]/70",
  },
]

const integrations = [
  "GitHub packages",
  "Browser previews",
  "KiCad import/export",
  "Gerber builds",
  "BOM checks",
  "AI code agents",
]

const surfaceTiles = [
  "bg-[#F8FAFC]",
  "bg-[#EFF6FF]",
  "bg-[#DBEAFE]",
  "bg-[#FFFFFF]",
]

const pipelineNodes = ["TSX", "SVG", "PCB", "BOM", "3D", "GTR"]

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

const codeLines = [
  '<board width="36mm" height="28mm">',
  '  <chip name="U1" footprint="soic8" />',
  '  <resistor name="R1" resistance="10k" />',
  '  <trace from="U1.pin1" to="R1.pin1" />',
  '  <autorouting strategy="cloud" />',
  "</board>",
]

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
  const signIn = useSignIn()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
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
                          <div className="flex h-full flex-col justify-between font-['Space_Mono',monospace] text-xs leading-6 text-[#334155]">
                            <div className="space-y-3">
                              {codeLines.map((line) => (
                                <div key={line} className="flex min-w-0 gap-3">
                                  <span className="text-[#2563EB]">+</span>
                                  <span className="truncate">{line}</span>
                                </div>
                              ))}
                            </div>
                            <div className="rounded-lg border border-[#2563EB]/50 bg-[#2563EB]/10 p-3 text-[#1D4ED8]">
                              parse source → graph nets → validate outputs
                            </div>
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
          className="landing-tile-field relative bg-[#FFFFFF] px-4 py-16 md:px-6 md:py-24"
        >
          <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(37,99,235,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.10)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-3">
              {featureCards.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <article
                    key={feature.title}
                    className={`relative overflow-hidden rounded-3xl border border-[#CBD5E1] ${
                      index === 1 ? "bg-[#EFF6FF]" : "bg-[#DBEAFE]"
                    } p-6 shadow-[0_12px_40px_rgba(37,99,235,.12)]`}
                  >
                    <div className="absolute right-0 top-0 grid w-28 grid-cols-3 gap-1 p-3 opacity-45">
                      {surfaceTiles.map((tile, tileIndex) => (
                        <span
                          key={`${feature.label}-tile-${tileIndex}`}
                          className={`aspect-square rounded-md border border-[#93C5FD] ${tile}`}
                        />
                      ))}
                    </div>
                    <div
                      className={`mb-8 inline-grid h-12 w-12 place-items-center rounded-xl bg-[#F8FAFC] ${feature.accent}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="font-['Space_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                      {feature.label}
                    </div>
                    <h2 className="mt-3 font-['Anybody',sans-serif] text-3xl font-extrabold leading-[1.02] tracking-normal">
                      {feature.title}
                    </h2>
                    <p className="mt-4 leading-7 text-[#334155]">
                      {feature.body}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative border-y border-[#CBD5E1] bg-[#EFF6FF] px-4 py-16 md:px-6 md:py-24">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(135deg,rgba(37,99,235,.14)_0_1px,transparent_1px_30px)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
              <div className="max-w-3xl">
                <div className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                  [ CODE TO CIRCUIT PIPELINE ]
                </div>
                <h2 className="mt-4 font-['Anybody',sans-serif] text-4xl font-extrabold leading-none tracking-normal md:text-6xl">
                  A developer workflow for physical boards.
                </h2>
              </div>
              <div className="grid grid-cols-6 gap-2 rounded-2xl border border-[#CBD5E1] bg-[#FFFFFF] p-3">
                {pipelineNodes.map((label, index) => (
                  <div
                    key={`rail-${label}`}
                    className={`grid aspect-square place-items-center rounded-lg border font-['Space_Mono',monospace] text-[10px] font-bold ${
                      index % 3 === 0
                        ? "border-[#2563EB]/70 bg-[#2563EB]/10 text-[#2563EB]"
                        : "border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B]"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <article
                  key={step.step}
                  className={`relative overflow-hidden rounded-[28px] border border-[#CBD5E1] ${
                    index === 0
                      ? "bg-[#F8FAFC]"
                      : index === 1
                        ? "bg-[#FFFFFF]"
                        : "bg-[#DBEAFE]"
                  } p-7`}
                >
                  <div className="absolute bottom-0 right-0 h-24 w-24 border-l border-t border-[#CBD5E1] bg-[linear-gradient(135deg,transparent_0_48%,rgba(37,99,235,.14)_48%_52%,transparent_52%)]" />
                  <div className="mb-8 flex items-center justify-between">
                    <span className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#0EA5E9]">
                      {step.step}
                    </span>
                    <GitBranch className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h3 className="font-['Anybody',sans-serif] text-3xl font-bold leading-tight tracking-normal">
                    {step.title}
                  </h3>
                  <p className="mt-4 leading-7 text-[#64748B]">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-[#F8FAFC] px-4 py-16 md:px-6 md:py-24">
          <div className="absolute inset-x-0 top-0 h-px bg-[#CBD5E1]" />
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div className="rounded-[28px] border border-[#CBD5E1] bg-[#DBEAFE] p-7">
              <div className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                [ SHAREABLE PROOF ]
              </div>
              <h2 className="mt-4 font-['Anybody',sans-serif] text-4xl font-extrabold leading-none tracking-normal md:text-6xl">
                Every circuit becomes a browser artifact.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#334155]">
                Push a package and get durable URLs for boards, subcircuits,
                schematics, PCB views, assembly diagrams, and 3D previews.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {["pkg", "pcb", "3d", "bom", "spice", "fab"].map(
                  (item, index) => (
                    <span
                      key={item}
                      className={`rounded-lg border border-[#CBD5E1] px-3 py-2 font-['Space_Mono',monospace] text-[11px] font-bold uppercase ${
                        index % 2 === 0
                          ? "bg-[#FFFFFF] text-[#2563EB]"
                          : "bg-[#EFF6FF] text-[#64748B]"
                      }`}
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-3 -top-3 h-full w-full rounded-3xl border border-[#2563EB]/40" />
              <OptimizedImage
                alt="Share and display tscircuit projects in the browser"
                className="relative w-full rounded-3xl border border-[#CBD5E1] bg-[#FFFFFF] object-cover shadow-[0_24px_80px_rgba(37,99,235,.18)]"
                src={shareableLinkForCircuitImg}
                height={360}
                width={540}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#F8FAFC] px-4 pb-16 md:px-6 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
            {bugCards.map((card, index) => (
              <article
                key={card.title}
                className={`relative overflow-hidden rounded-2xl border ${
                  index === 1 ? "bg-[#EFF6FF]" : "bg-[#FFFFFF]"
                } p-5 ${card.color}`}
              >
                <div className="absolute right-0 top-0 h-20 w-20 border-b border-l border-[#CBD5E1] bg-[#DBEAFE]/70" />
                <div className="mb-4 flex items-center justify-between gap-4 font-['Space_Mono',monospace] text-[11px] font-bold uppercase tracking-[0.1em]">
                  <span className="rounded bg-[#DBEAFE] px-2 py-1 text-[#2563EB]">
                    {card.tag}
                  </span>
                  <Search className="h-4 w-4 text-[#64748B]" />
                </div>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap border-y border-[#CBD5E1] py-3 font-['Space_Mono',monospace] text-xs text-[#0284C7]">
                  {card.path}
                </div>
                <h3 className="mt-5 font-['Anybody',sans-serif] text-2xl font-bold leading-tight tracking-normal">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#64748B]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="relative border-y border-[#CBD5E1] bg-[#DBEAFE] px-4 py-16 md:px-6 md:py-24">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(37,99,235,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.10)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-6">
              <div className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                [ ROUTE · TEST · EXECUTE ]
              </div>
              <h2 className="font-['Anybody',sans-serif] text-4xl font-extrabold leading-none tracking-normal md:text-6xl">
                Autoroute and simulate without leaving source control.
              </h2>
              <p className="text-lg leading-8 text-[#334155]">
                Fast routing and analog simulation turn circuit code into a
                feedback loop. Review behavior and layout before committing to
                fabrication.
              </p>
              <div className="flex flex-wrap gap-3 font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.08em]">
                <span className="rounded-md bg-[#2563EB] px-3 py-2 text-[#F8FAFC]">
                  Cloud autorouter
                </span>
                <span className="rounded-md border border-[#93C5FD] px-3 py-2 text-[#0F172A]">
                  WebAssembly ngspice
                </span>
              </div>
            </div>
            <div className="grid gap-5">
              <div className="aspect-video overflow-hidden rounded-3xl border border-[#CBD5E1] bg-[#FFFFFF] p-2 shadow-[0_24px_80px_rgba(37,99,235,.18)]">
                <video
                  className="h-full w-full rounded-2xl object-cover"
                  src={autoroutingExampleVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Autorouting demonstration video"
                />
              </div>
              <OptimizedImage
                alt="Analog simulation output"
                className="w-full rounded-3xl border border-[#CBD5E1] bg-[#FFFFFF] object-cover"
                src={analogSimulationImg}
                height={360}
                width={540}
              />
            </div>
          </div>
        </section>

        <section className="bg-[#FFFFFF] px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-full w-full rounded-3xl border border-[#3B82F6]/50 bg-[#EFF6FF]" />
              <OptimizedImage
                alt="AI-compatible electronics workflow"
                className="relative w-full rounded-3xl border border-[#CBD5E1] bg-[#FFFFFF] object-cover shadow-[0_24px_80px_rgba(37,99,235,.18)]"
                src={exampleAiCodingImg}
                height={405}
                width={720}
              />
            </div>
            <div className="rounded-[28px] border border-[#CBD5E1] bg-[#F8FAFC] p-7">
              <div className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                [ AI COMPATIBLE ELECTRONICS ]
              </div>
              <h2 className="mt-4 font-['Anybody',sans-serif] text-4xl font-extrabold leading-none tracking-normal md:text-6xl">
                Teach agents to change schematics and PCBs.
              </h2>
              <div className="mt-6 space-y-3 text-[#334155]">
                {[
                  "Install the tscircuit skill for agent-native circuit edits.",
                  "Ask for schematic changes, package reuse, layout passes, and review.",
                  "Keep every electrical decision visible as source code.",
                ].map((item) => (
                  <p key={item} className="flex gap-3 leading-7">
                    <Braces className="mt-1 h-5 w-5 shrink-0 text-[#2563EB]" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-y border-[#CBD5E1] bg-[#EFF6FF] px-4 py-16 md:px-6 md:py-24">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(135deg,rgba(14,165,233,.16)_0_1px,transparent_1px_26px)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <div className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                [ KICAD BRIDGE ]
              </div>
              <h2 className="mt-4 font-['Anybody',sans-serif] text-4xl font-extrabold leading-none tracking-normal md:text-6xl">
                Code-first does not mean format-isolated.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#334155]">
                Import KiCad footprints directly, export KiCad PCB and schematic
                files, and keep traditional EDA collaboration paths open.
              </p>
            </div>
            <div className="grid gap-3 rounded-[28px] border border-[#CBD5E1] bg-[#FFFFFF] p-3">
              <div className="grid grid-cols-4 gap-2">
                {["fp", "lib", "sch", "pcb"].map((item, index) => (
                  <span
                    key={item}
                    className={`rounded-lg px-3 py-2 text-center font-['Space_Mono',monospace] text-[11px] font-bold uppercase ${
                      index === 0
                        ? "bg-[#2563EB] text-[#F8FAFC]"
                        : "bg-[#DBEAFE] text-[#64748B]"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <OptimizedImage
                alt="KiCad support via tscircuit packages"
                className="w-full rounded-2xl border border-[#CBD5E1] bg-[#FFFFFF] object-cover"
                src={importKicadLibraryImg}
                height={360}
                width={540}
              />
            </div>
          </div>
        </section>

        <section className="relative bg-[#F8FAFC] px-4 py-16 text-center md:px-6 md:py-24">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(37,99,235,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.14)_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="relative mx-auto max-w-4xl rounded-[28px] border border-[#CBD5E1] bg-[#FFFFFF] p-8 md:p-12">
            <div className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#2563EB]">
              [ START BUILDING ]
            </div>
            <h2 className="mt-4 font-['Anybody',sans-serif] text-4xl font-extrabold leading-none tracking-normal md:text-6xl">
              Ready to build electronics with code?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#334155]">
              Open an example, start from the docs, or jump into your dashboard
              and build a circuit that can be reviewed like software.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    signIn()
                  } else {
                    navigate("/dashboard")
                  }
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 font-['Space_Mono',monospace] text-[13px] font-bold uppercase tracking-[0.08em] text-[#F8FAFC]"
                aria-label="Get started with TSCircuit now"
              >
                Start now
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="https://docs.tscircuit.com"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#93C5FD] bg-[#DBEAFE] px-6 font-['Space_Mono',monospace] text-[13px] font-bold uppercase tracking-[0.08em] text-[#0F172A]"
              >
                Read docs
                <Code2 className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <div className="landing-faq bg-[#F8FAFC]">
          <FAQ />
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
