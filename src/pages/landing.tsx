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
import playgroundScreenshotImg from "@/assets/playground screenshot.png"
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
                  <div
                    className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    The hardware framework for AI teams
                  </div>
                  <h1
                    className="max-w-4xl text-[clamp(3rem,6vw,58px)] font-semibold leading-[1.02] tracking-[-0.03em] text-slate-900 dark:text-slate-50"
                    style={{ fontFamily: '"Geist", sans-serif' }}
                  >
                    The #1 framework for
                    <br />
                    <ContainerTextFlip
                      words={heroHeadlinePhrases}
                      interval={2400}
                      animationDuration={520}
                      className="rounded-lg bg-blue-50 px-3 py-1 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
                      textClassName="font-semibold"
                    />{" "}
                    electronics.
                  </h1>
                  <p className="max-w-[520px] text-[17px] leading-[1.65] text-slate-600 dark:text-slate-300">
                    Build electronics with TypeScript and AI tools. Render code
                    into schematics, PCBs, 3D views, fabrication files, and
                    shareable previews in the browser.
                  </p>
                </div>

                <div
                  className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:items-center"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  <Link
                    href="/seveibar/led-water-accelerometer#3d"
                    className="w-[70vw] min-[500px]:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      aria-label="Open online example of TSCircuit"
                      className="h-10 w-full rounded-md px-3.5 text-[12px] min-[500px]:w-auto"
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
                      className="h-10 w-full rounded-md px-3.5 text-[12px] min-[500px]:w-auto"
                    >
                      Get Started
                    </Button>
                  </a>
                </div>

                <div
                  className="grid max-w-xl grid-cols-3 gap-6 border-t border-slate-300/70 pt-8 dark:border-slate-700/80"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <p
                        className="text-[18px] font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-50"
                        style={{ fontFamily: '"Geist", sans-serif' }}
                      >
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
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
        <section
          className="relative w-full border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950 md:py-20 lg:py-24"
          aria-labelledby="playground-title"
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-16">
              <div className="max-w-[30rem]">
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.34em] text-slate-500 dark:text-slate-400"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  Develop like it&apos;s a website
                </p>
                <h2
                  id="playground-title"
                  className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl"
                >
                  Instant previews in the browser.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
                  Every save re-renders the schematic, PCB, and 3D view, the
                  same loop you have with Next.js or Vite, but for hardware. No
                  IDE to install, no toolchain to babysit. 50+ reference boards
                  ready to fork.
                </p>
                <Link href="/seveibar/led-water-accelerometer#3d" className="mt-6 inline-flex">
                  <Button
                    size="lg"
                    className="h-10 rounded-md px-3.5 text-[12px] shadow-sm"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    Open playground →
                  </Button>
                </Link>
              </div>
              <div className="justify-self-end overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:ring-slate-800/80">
                <OptimizedImage
                  alt="tscircuit playground showing editor, 3D board viewer, and console"
                  className="h-[220px] w-full max-w-[860px] object-cover object-center md:h-[280px] lg:h-[320px]"
                  src={playgroundScreenshotImg}
                  height={420}
                  width={760}
                />
              </div>
            </div>
          </div>
        </section>
        <div className="w-full border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
          <FAQ />
        </div>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary" id="cta">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
              <div className="space-y-4 text-center text-primary-foreground lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">
                  Ready to build electronics with code?
                </h2>
                <p className="max-w-2xl text-base leading-7 text-primary-foreground/80 md:text-lg lg:mx-0">
                  Join thousands of engineers who are already using tscircuit to
                  design complex electronics!
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-start">
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
                    className="h-10 rounded-md px-3.5 text-[12px]"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
              <OptimizedImage
                alt="tscircuit schematic preview"
                className="w-full overflow-hidden rounded-2xl object-cover object-center shadow-[0_28px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/20"
                src="/assets/example_schematic.webp"
                height={310}
                width={800}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
