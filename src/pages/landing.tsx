import analogSimulationImg from "@/assets/analogsimulation.png"
import autoroutingExampleVideo from "@/assets/autorouting_example.mp4"
import exampleAiCodingImg from "@/assets/example_ai_coding.png"
import importKicadLibraryImg from "@/assets/import-kicad-library.png"
import shareableLinkForCircuitImg from "@/assets/shareable-link-for-circuit.png"
import { FAQ } from "@/components/FAQ"
import { OptimizedImage } from "@/components/OptimizedImage"
import {
  BookOpen,
  Building2,
  CircuitBoard,
  DollarSign,
  FileText,
  Library,
  Menu,
  Search,
  Sparkles,
} from "lucide-react"
import type { CSSProperties } from "react"
import { useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet"
import { Link } from "wouter"

const donutCharacters = ".,-~:;=!*#$@" as const

const renderDonutFrame = (rotationA: number, rotationB: number) => {
  const width = 42
  const height = 20
  const output = Array.from({ length: width * height }, () => " ")
  const zBuffer = Array.from({ length: width * height }, () => 0)
  const cosA = Math.cos(rotationA)
  const sinA = Math.sin(rotationA)
  const cosB = Math.cos(rotationB)
  const sinB = Math.sin(rotationB)

  for (let theta = 0; theta < Math.PI * 2; theta += 0.28) {
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)

    for (let phi = 0; phi < Math.PI * 2; phi += 0.12) {
      const cosPhi = Math.cos(phi)
      const sinPhi = Math.sin(phi)
      const circleX = cosTheta + 2
      const depth = 1 / (sinPhi * circleX * sinA + sinTheta * cosA + 5)
      const t = sinPhi * circleX * cosA - sinTheta * sinA
      const x = Math.floor(
        width / 2 + 24 * depth * (cosPhi * circleX * cosB - t * sinB),
      )
      const y = Math.floor(
        height / 2 + 12 * depth * (cosPhi * circleX * sinB + t * cosB),
      )
      const luminance = Math.floor(
        8 *
          ((sinTheta * sinA - sinPhi * cosTheta * cosA) * cosB -
            sinPhi * cosTheta * sinA -
            sinTheta * cosA -
            cosPhi * cosTheta * sinB),
      )
      const outputIndex = x + width * y

      if (
        y >= 0 &&
        y < height &&
        x >= 0 &&
        x < width &&
        depth > zBuffer[outputIndex]
      ) {
        zBuffer[outputIndex] = depth
        output[outputIndex] =
          donutCharacters[Math.max(0, Math.min(luminance, 11))]
      }
    }
  }

  return Array.from({ length: height }, (_, rowIndex) =>
    output.slice(rowIndex * width, (rowIndex + 1) * width).join(""),
  ).join("\n")
}

const renderDoubleDonutFrame = (frameIndex: number) => {
  const leftDonut = renderDonutFrame(
    frameIndex * 0.11,
    frameIndex * 0.07,
  ).split("\n")
  const rightDonut = renderDonutFrame(
    frameIndex * 0.11 + Math.PI,
    frameIndex * 0.07 + Math.PI / 2,
  ).split("\n")

  return leftDonut
    .map((line, index) => `${line}        ${rightDonut[index] ?? ""}`)
    .join("\n")
}

const FooterDonutTerminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    const terminal = terminalRef.current
    if (!terminal) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(Boolean(entry?.isIntersecting))
      },
      { rootMargin: "120px" },
    )

    observer.observe(terminal)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (
      !isVisible ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const intervalId = window.setInterval(() => {
      setFrameIndex((current) => current + 1)
    }, 140)

    return () => window.clearInterval(intervalId)
  }, [isVisible])

  const donutFrame = isVisible ? renderDoubleDonutFrame(frameIndex) : ""

  return (
    <div
      ref={terminalRef}
      className="landing-footer-terminal"
      aria-label="Terminal field showing spinning 3D ASCII donuts"
    >
      <pre className="landing-footer-terminal-output" aria-hidden="true">
        {donutFrame}
      </pre>
    </div>
  )
}

const landingNavItems = [
  { label: "Examples", href: "/search", icon: FileText },
  { label: "Pricing", href: "/my-orders", icon: DollarSign },
  { label: "Features", href: "#features", icon: Sparkles },
  { label: "Enterprise", href: "mailto:hello@tscircuit.com", icon: Building2 },
  { label: "Blog", href: "https://blog.tscircuit.com", icon: BookOpen },
  {
    label: "Resources",
    href: "https://docs.tscircuit.com",
    icon: Library,
  },
]

const originalFeatureCards = [
  {
    meta: "01 · SOURCE",
    title: "Circuit source agents can edit",
    body: "React components describe parts, nets, traces, constraints, and output targets in one inspectable source tree.",
    visual: "code",
  },
  {
    meta: "02 · AUTOROUTE",
    title: "Routing that stays reviewable",
    body: "Generate routed boards without losing the context humans and code agents need to inspect, diff, and repair.",
    visual: "autoroute",
  },
  {
    meta: "03 · AI",
    title: "Hardware context for AI teams",
    body: "Give Codex, Claude Code, and custom agents enough pre-fab context to make useful changes before boards go out.",
    visual: "ai",
  },
] as const

const toolingCards = [
  {
    title: "React",
    body: "Compose boards, subcircuits, footprints, and reusable packages with the UI model engineers already understand.",
  },
  {
    title: "TypeScript",
    body: "Typed props, package boundaries, editor tooling, and git diffs keep hardware changes explicit.",
  },
  {
    title: "Circuit JSON",
    body: "Compile source into a portable electronics graph for viewers, agents, fabrication output, and review tools.",
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
  {
    owner: "tscircuit",
    name: "usb-c-sparkfun-qwiic",
    description:
      "Connector-heavy reference board with source-controlled outputs.",
    stats: ["USB-C", "Source", "Fab"],
    href: "/tscircuit/usb-c-sparkfun-qwiic",
  },
  {
    owner: "seveibar",
    name: "RP2040-dev-board",
    description: "Microcontroller layout with reusable packages and previews.",
    stats: ["MCU", "KiCad", "BOM"],
    href: "/seveibar/RP2040-dev-board",
  },
  {
    owner: "tscircuit",
    name: "analog-sim-demo",
    description:
      "Simulation-first circuit with plotted behavior and review context.",
    stats: ["SPICE", "Plots", "Review"],
    href: "/tscircuit/analog-sim-demo",
  },
  {
    owner: "seveibar",
    name: "power-monitor",
    description:
      "Power measurement board with inspectable nets and BOM output.",
    stats: ["Power", "BOM", "PCB"],
    href: "/seveibar/power-monitor",
  },
  {
    owner: "tscircuit",
    name: "sensor-breakout",
    description: "Small breakout package with browser previews and Gerbers.",
    stats: ["Sensor", "3D", "Gerbers"],
    href: "/tscircuit/sensor-breakout",
  },
  {
    owner: "seveibar",
    name: "motor-driver-mini",
    description: "Compact driver layout with reviewable routing changes.",
    stats: ["Motor", "Routes", "Fab"],
    href: "/seveibar/motor-driver-mini",
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
            <Menu className="h-5 w-5" />
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
  <footer className="landing-footer border-t border-[#CBD5E1] bg-[#F8FAFC] px-4 py-12 text-[#0F172A] md:px-6">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 md:grid-cols-[1.2fr_2fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-['Anybody',sans-serif] text-2xl font-extrabold">
              tscircuit
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#64748B]">
            Code-first electronics for browser previews, AI edits, source
            control, and manufacturing output.
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
              <h3 className="font-['Space_Mono',monospace] text-xs font-bold uppercase tracking-[0.12em] text-[#A1A1AA]">
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
      <FooterDonutTerminal />
    </div>
  </footer>
)

export function LandingPage() {
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
        <span>Get started with our new tutorial series</span>
      </a>
      <LandingTopBar />
      <main className="overflow-hidden">
        <section className="landing-grid-field landing-hero-section landing-hero-minimal relative px-6 pb-20 pt-16 md:px-8 lg:pb-24 lg:pt-20">
          <div className="landing-hero-minimal-grid" aria-hidden="true" />
          <div className="landing-page-rails" aria-hidden="true" />
          <div className="relative mx-auto flex min-h-[56svh] max-w-3xl flex-col items-center justify-center text-center">
            <div className="mb-9 font-['Space_Mono',monospace] text-[10px] font-bold uppercase tracking-[0.34em] text-[#64748B] sm:text-[11px]">
              The hardware framework for AI teams
            </div>
            <h1 className="max-w-3xl font-['Anybody',sans-serif] text-[34px] font-extrabold leading-[1.04] tracking-normal text-white sm:text-[44px] lg:text-[56px]">
              The #1 framework for AI-generated electronics.
            </h1>
            <p className="mt-9 max-w-2xl text-sm leading-7 text-[#A3AAB8] md:text-base">
              Design production PCBs in TypeScript. Version them in git. Let
              agents iterate on them.
            </p>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-3 rounded-md bg-white px-4 font-['Space_Mono',monospace] text-[12px] font-bold text-[#050505]"
                onClick={() => {
                  void navigator.clipboard?.writeText(
                    "npm install -g tscircuit",
                  )
                }}
              >
                npm install -g tscircuit
              </button>
              <a
                href="https://docs.tscircuit.com"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-4 font-['Space_Mono',monospace] text-[12px] font-bold text-white"
              >
                Read the docs
              </a>
            </div>
            <div className="mt-11 font-['Space_Mono',monospace] text-[10px] uppercase tracking-[0.22em] text-[#64748B]">
              TSX / Schematics / PCB / 3D / Gerbers
            </div>
          </div>
        </section>

        <div className="landing-pixel-sand-transition" aria-hidden="true">
          <div className="landing-pixel-sand-rail">
            {Array.from({ length: 96 }, (_, index) => (
              <span
                key={`pixel-sand-${index}`}
                style={
                  {
                    "--pixel-x": `${(index * 37) % 100}%`,
                    "--pixel-y": `${12 + ((index * 53) % 76)}%`,
                    "--pixel-size": `${2 + ((index * 7) % 4)}px`,
                    "--pixel-alpha": `${0.16 + ((index * 11) % 42) / 100}`,
                    "--pixel-delay": `${(index % 17) * -0.18}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>

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
          className="landing-original-section landing-foundation-section"
          aria-labelledby="foundation-title"
        >
          <div className="landing-foundation-shell">
            <div className="landing-foundation-heading">
              <div className="landing-original-eyebrow">
                Powered by tscircuit
              </div>
              <h2 id="foundation-title">
                Built on a foundation of code-first electronics tooling.
              </h2>
            </div>
            <div className="landing-foundation-cards">
              {toolingCards.map((tool, index) => (
                <article key={tool.title} className="landing-foundation-card">
                  <div className="landing-foundation-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3>{tool.title}</h3>
                    <p>{tool.body}</p>
                  </div>
                </article>
              ))}
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
              {galleryBoards.slice(0, 3).map((board, index) => (
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
            <div className="landing-careers-letter-page">
              <div className="landing-original-eyebrow">A note from us</div>
              <h2 id="careers-title">Come build the future of electronics.</h2>
              <div className="landing-careers-letter">
                <div className="landing-careers-letter-body">
                  <p>Hi,</p>
                  <p>
                    We&apos;re building tscircuit because hardware should move
                    at the speed of software. Boards should be inspectable,
                    programmable, reviewable, and easy for both humans and
                    agents to improve.
                  </p>
                  <p>
                    If you care about electronics, compilers, CAD, autorouting,
                    developer tools, or making fabrication feel less opaque,
                    we&apos;d like to hear from you.
                  </p>
                  <p>
                    We&apos;re hiring across electrical engineering, compilers,
                    autorouting, developer tools, and applied AI for hardware.
                  </p>
                  <div className="landing-careers-signature">
                    <span>- the tscircuit team</span>
                    <a href="mailto:careers@tscircuit.com">
                      careers@tscircuit.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
