import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContainerTextFlip } from "@/components/ui/container-text-flip"
import { LandingHeroCodePreview } from "@/components/LandingHeroCodePreview"
import { LandingTeamSwitchSection } from "@/components/LandingTeamSwitchSection"
import { OptimizedImage } from "@/components/OptimizedImage"
import {
  Code2,
  Cpu,
  Layers,
  CloudLightningIcon as Lightning,
  Maximize2,
  Zap,
} from "lucide-react"
import { Helmet } from "react-helmet"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import { useSignIn } from "@/hooks/use-sign-in"
import { useGlobalStore } from "@/hooks/use-global-store"
import { navigate } from "wouter/use-browser-location"
import { FAQ } from "@/components/FAQ"
// import { TrendingPackagesCarousel } from "@/components/TrendingPackagesCarousel"
import { Link } from "wouter"
import importKicadLibraryImg from "@/assets/import-kicad-library.png"
import analogSimulationImg from "@/assets/analogsimulation.png"
import shareableLinkForCircuitImg from "@/assets/shareable-link-for-circuit.png"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useMemo } from "react"

const heroStats = [
  { value: "2.1k", label: "Repo stars" },
  { value: "289", label: "Public repos" },
  { value: "209", label: "GH followers" },
]

const heroHeadlinePhrases = [
  "AI-generated",
  "code-first",
  "agent-ready",
  "open-source",
]

const analogSimulationCode = `export default () => (
    <board schMaxTraceDistance={10} routingDisabled>
      <voltagesource
        name="V1"
        voltage="5V"
        frequency="40Hz"
        waveShape="sinewave"
      />
      <diode name="D1" />
      <resistor name="R1" resistance="640ohm" />

      <trace from="V1.pin1" to="D1.anode" />
      <trace from="D1.cathode" to="R1.pin1" />
      <trace from="V1.pin2" to="R1.pin2" />

      <voltageprobe name="VP_IN" connectsTo="V1.pin1" />
      <voltageprobe name="VP_OUT" connectsTo="R1.pin1" />

      <analogsimulation
        duration="50ms"
        timePerStep="0.1ms"
        spiceEngine="ngspice"
      />
    </board>
)`

export function LandingPage() {
  const signIn = useSignIn()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  const { highlighter } = useShikiHighlighter()
  const analogSimulationHtml = useMemo(
    () =>
      highlighter?.codeToHtml(analogSimulationCode, {
        lang: "tsx",
        theme: "github-dark",
      }),
    [highlighter],
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        <link rel="preconnect" href="https://img.shields.io" />
        <link rel="dns-prefetch" href="https://img.shields.io" />

        <link rel="preconnect" href="https://shields.io" />
        <link rel="dns-prefetch" href="https://shields.io" />

        <link rel="preconnect" href="https://tscircuit.com" />
        <link rel="dns-prefetch" href="https://tscircuit.com" />

        <link rel="preconnect" href="https://api.tscircuit.com" />
        <link rel="dns-prefetch" href="https://api.tscircuit.com" />
      </Helmet>
      <Header2 />
      <main className="flex-1">
        <section className="relative w-full overflow-hidden bg-white py-10 md:py-14 lg:py-20 xl:py-24 dark:bg-slate-950">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_24%)]" />
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:gap-14">
              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                    <span className="rounded-md bg-blue-500 px-2 py-1 font-semibold tracking-normal text-white">
                      tscircuit
                    </span>
                    <span>Open-source hardware design for code + AI</span>
                  </div>
                  <h1 className="max-w-4xl text-[clamp(2.9rem,7vw,5.4rem)] font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-slate-50">
                    The #1 framework for
                    <br />
                    <ContainerTextFlip
                      words={heroHeadlinePhrases}
                      interval={2400}
                      animationDuration={520}
                      className="rounded-lg bg-blue-50 px-3 py-1 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                      textClassName="font-bold"
                    />{" "}
                    electronics.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300 md:text-[1.28rem]">
                    Build electronics with TypeScript and AI tools. Render code
                    into schematics, PCBs, 3D views, fabrication files, and
                    shareable previews in the browser.
                  </p>
                </div>

                <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:items-center">
                  <Link
                    href="/seveibar/led-water-accelerometer#3d"
                    className="w-[70vw] min-[500px]:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      aria-label="Open online example of TSCircuit"
                      className="w-full min-[500px]:w-auto"
                    >
                      Open Online Example
                    </Button>
                  </Link>
                  <a
                    href="https://docs.tscircuit.com"
                    className="w-[70vw] min-[500px]:w-auto"
                  >
                    <Button
                      size="lg"
                      aria-label="Get started with TSCircuit"
                      className="w-full min-[500px]:w-auto"
                    >
                      Get Started
                    </Button>
                  </a>
                </div>

                <div className="grid max-w-xl grid-cols-3 gap-6 border-t border-slate-300/70 pt-6 dark:border-slate-700/80">
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm sm:flex sm:flex-wrap sm:items-center">
                  <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Lightning Fast Autorouting</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <span>Designed for AI</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <span>Export &amp; Manufacture</span>
                  </div>
                </div>
              </div>

              <LandingHeroCodePreview />
            </div>
          </div>
        </section>
        <LandingTeamSwitchSection />
        {/* <TrendingPackagesCarousel /> */}
        <section className="w-full py-12 md:py-20 lg:py-28 section-dot-pattern">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:items-center">
              <OptimizedImage
                alt="Share and display in the browser placeholder"
                className="mx-auto w-full max-w-xl overflow-hidden rounded-xl object-cover object-center shadow-xl ring-1 ring-black/5 dark:ring-white/10"
                src={shareableLinkForCircuitImg}
                height={360}
                width={540}
              />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-balance">
                  Share and display in the browser
                </h2>
                <ul className="feature-list space-y-3 text-muted-foreground md:text-lg">
                  <li>
                    Connect your GitHub or push to tscircuit.com to create
                    shareable URLs for your project
                  </li>
                  <li>
                    Every component, subcircuit and board has a dedicated
                    webpage
                  </li>
                  <li>
                    Easy-to-use React component libraries for displaying PCBs,
                    Schematics, Assembly Diagrams on your own website
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28 section-dot-pattern">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center overflow-hidden">
              <div className="space-y-4 min-w-0">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-balance">
                  Analog Simulation
                </h2>
                <ul className="feature-list space-y-3 text-muted-foreground md:text-lg">
                  <li>
                    Run analog simulations in your browser or on the command
                    line via WebAssembly ngspice
                  </li>
                </ul>
                <a
                  href="https://docs.tscircuit.com/category/spice-simulation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-primary underline underline-offset-4 hover:text-primary/80 md:text-lg"
                >
                  Read the Analog Simulation Guide &rarr;
                </a>
                {analogSimulationHtml ? (
                  <div
                    className="rounded-lg text-sm overflow-x-auto max-w-full [&>pre]:p-4 [&>pre]:w-max [&>pre]:min-w-full [&>pre]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: analogSimulationHtml }}
                  />
                ) : (
                  <div className="rounded-lg overflow-x-auto max-w-full">
                    <pre className="bg-gray-900 p-4 text-sm text-gray-100 w-max min-w-full rounded-lg">
                      <code>{analogSimulationCode}</code>
                    </pre>
                  </div>
                )}
              </div>
              <OptimizedImage
                alt="Analog simulation"
                className="mx-auto w-full max-w-xl overflow-hidden rounded-xl object-cover object-center shadow-xl ring-1 ring-black/10 dark:ring-white/10"
                src={analogSimulationImg}
                height={360}
                width={540}
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-balance">
                  First Class KiCad Support
                </h2>
                <ul className="feature-list space-y-3 text-muted-foreground md:text-lg">
                  <li>
                    Export to KiCad PCB and Schematic files{" "}
                    <em>
                      Just run{" "}
                      <span className="font-semibold">
                        tsci build --kicad-library
                      </span>
                    </em>
                  </li>
                  <li>
                    Import KiCad files directly{" "}
                    <em>import RP2040 from &quot;./RP2040.kicad_mod&quot;</em>
                  </li>
                  <li>
                    Automatic KiCad PCM Server{" "}
                    <span className="text-muted-foreground">
                      Import your library anywhere. Enable KiCad PCM to have
                      every tscircuit package automatically serve components and
                      subcircuits as importable KiCad modules
                    </span>
                  </li>
                </ul>
              </div>
              <OptimizedImage
                alt="KiCad support via PCB Server"
                className="mx-auto w-full max-w-xl overflow-hidden rounded-xl object-cover object-center"
                src={importKicadLibraryImg}
                height={360}
                width={540}
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-balance">
                Zero Effort Bill of Materials and Inventory Checks
              </h2>
              <ul className="feature-list space-y-3 text-muted-foreground md:text-lg">
                <li>Integrations with major component suppliers</li>
                <li>
                  Automatic passive component selection based on component
                  properties
                </li>
                <li>
                  Supplier part numbers, pricing and inventory automatically
                  queried
                </li>
              </ul>
            </div>
          </div>
        </section>
        <div className="md:mt-8">
          <OptimizedImage
            alt="Product preview"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
            src="/assets/editor_example_2.webp"
            height={310}
            width={800}
          />
        </div>
        <FAQ />
        <div className="md:mt-8">
          <OptimizedImage
            alt="Product preview"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
            src="/assets/example_schematic.webp"
            height={310}
            width={800}
          />
        </div>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary" id="cta">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-primary-foreground">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-balance">
                  Ready to build electronics with code?
                </h2>
                <p className="max-w-[600px] mx-auto text-primary-foreground/80 md:text-xl">
                  Join thousands of engineers who are already using tscircuit to
                  design complex electronics!
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  onClick={() => {
                    if (!isLoggedIn) {
                      signIn()
                    } else {
                      navigate("/dashboard")
                    }
                  }}
                  size="lg"
                  variant="secondary"
                  aria-label="Get started with TSCircuit now"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
