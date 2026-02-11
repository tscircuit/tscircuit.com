import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { TrendingPackagesCarousel } from "@/components/TrendingPackagesCarousel"
import { Link } from "wouter"
import importKicadLibraryImg from "@/assets/import-kicad-library.png"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useMemo } from "react"

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
        <section className="w-full py-8 md:py-12 lg:py-20 xl:py-36">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="container mx-auto max-w-7xl">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      Open-Source, MIT Licensed
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                      AI codes electronics with tscircuit
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      Build electronics with code and AI tools.
                      <br />
                      Render code into schematics, PCBs, 3D, fabrication files,
                      and more.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 min-[500px]:flex-row">
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
                      href="https://github.com/tscircuit/tscircuit"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        alt="GitHub stars"
                        src="https://img.shields.io/github/stars/tscircuit/tscircuit?style=social"
                      />
                    </a>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:flex items-center w-full text-sm">
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4" />
                      <span>Lightning Fast Autorouting</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Cpu className="h-4 w-4" />
                      <span>Designed for AI</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Layers className="h-4 w-4" />
                      <span>Export &amp; Manufacture</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:hidden">
                      <Code2 className="h-4 w-4" />
                      <span>Open Web Standards</span>
                    </div>
                  </div>
                </div>
                <div className="w-full aspect-video relative">
                  <iframe
                    className="mx-auto overflow-hidden rounded-xl object-cover object-center absolute inset-0 w-full h-full mt-8 lg:mt-0"
                    src="https://www.youtube.com/embed/HAd5_ZJgg50"
                    title="TSCircuit product demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <TrendingPackagesCarousel />
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
          id="features"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  The Modern Toolkit for Electronic Design
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Typescript and React equipped with expertly-designed web-first
                  electronics libraries
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                <CardContent className="p-6">
                  <Lightning className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold">Version Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Collaborate on Github or wherever you keep source code.
                    Utilize industry-standard continuous integration tooling
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                <CardContent className="p-6">
                  <Cpu className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold">Robust Autorouting</h3>
                  <p className="text-sm text-muted-foreground">
                    Near-instant local and cloud autorouters to give you a
                    functional circuit board fast
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                <CardContent className="p-6">
                  <Maximize2 className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold">
                    Export &amp; Manufacture
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Export to industry-standard formats like Gerber, SPICE
                    netlists and more
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  AI-compatible Electronics
                </h2>
                <ul className="space-y-3 text-muted-foreground md:text-lg">
                  <li>
                    Teach agents tscircuit instantly with{" "}
                    <span className="font-semibold">
                      npx skills add tscircuit/skill
                    </span>
                  </li>
                  <li>Bring your own agent (Claude Code, Codex, OpenCode)</li>
                  <li>
                    Ask to initialize, change and review schematics and PCBs
                  </li>
                </ul>
              </div>
              <OptimizedImage
                alt="AI-compatible electronics placeholder"
                className="mx-auto w-full max-w-xl overflow-hidden rounded-xl object-cover object-center"
                src="/assets/fallback-image.svg"
                height={360}
                width={540}
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <OptimizedImage
                alt="Share and display in the browser placeholder"
                className="mx-auto w-full max-w-xl overflow-hidden rounded-xl object-cover object-center"
                src="/assets/fallback-image.svg"
                height={360}
                width={540}
              />
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Share and display in the browser
                </h2>
                <ul className="space-y-3 text-muted-foreground md:text-lg">
                  <li>
                    Connect your GitHub or push to tscircuit.com to create
                    shareable URLs for your project
                  </li>
                  <li>Every component file has a dedicated webpage</li>
                  <li>
                    React component library for displaying PCBs, Schematics,
                    Assembly Diagrams, Bill of Materials and More
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Analog Simulation
                </h2>
                <ul className="space-y-3 text-muted-foreground md:text-lg">
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
                    className="rounded-lg text-sm overflow-x-auto [&>pre]:p-4 [&>pre]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: analogSimulationHtml }}
                  />
                ) : (
                  <pre className="rounded-lg bg-gray-900 p-4 text-sm text-gray-100 overflow-x-auto">
                    <code>{analogSimulationCode}</code>
                  </pre>
                )}
              </div>
              <OptimizedImage
                alt="Analog simulation"
                className="mx-auto w-full max-w-xl overflow-hidden rounded-xl object-cover object-center"
                src="/assets/analogsimulation.png"
                height={360}
                width={540}
              />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Extremely Fast Autorouting
              </h2>
              <ul className="space-y-3 text-muted-foreground md:text-lg">
                <li>
                  Autoroute circuit boards using{" "}
                  <a className="underline" href="#">
                    freerouting
                  </a>{" "}
                  or{" "}
                  <a className="underline" href="#">
                    tscircuit&apos;s fast autorouter
                  </a>
                </li>
                <li>
                  Autoroute as few as 1 layer with automatically placed jumpers
                </li>
                <li>Route complex circuits in seconds</li>
              </ul>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-20 lg:py-28">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  First Class KiCad Support
                </h2>
                <ul className="space-y-3 text-muted-foreground md:text-lg">
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
        <section className="w-full py-12 md:py-20 lg:py-28 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Zero Effort Bill of Materials and Inventory Checks
              </h2>
              <ul className="space-y-3 text-muted-foreground md:text-lg">
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
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to build electronics with code?
                </h2>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Join hundreds of engineers who are already using tscircuit to
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
