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
  ArrowRight,
  Terminal,
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
import analogSimulationImg from "@/assets/analogsimulation.png"
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
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-black font-sans selection:bg-black selection:text-white">
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

      <main className="flex-1 w-full max-w-[1400px] mx-auto border-x border-[#EAEAEA] bg-white relative">
        {/* HERO SECTION - MINIMAL IMPACTFUL GRID */}
        <section className="border-b border-[#EAEAEA]">
          <div className="grid lg:grid-cols-[1fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            {/* LEFT TEXT COLUMN */}
            <div className="pt-24 pb-20 md:pt-36 md:pb-28 px-4 md:px-12 lg:px-16 flex flex-col justify-center">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 px-3 py-1 mb-8 border border-[#EAEAEA] bg-[#FAFAFA] text-xs font-mono tracking-tight text-gray-600 rounded">
                <span className="flex h-1.5 w-1.5 rounded-full bg-black"></span>
                OPEN-SOURCE & MIT LICENSED
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-5xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem] font-bold tracking-tighter leading-[0.95] text-black mb-8">
                AI codes electronics with tscircuit
              </h1>

              <p className="max-w-[500px] text-lg md:text-xl text-gray-500 font-medium leading-snug mb-10">
                Build electronics with code and AI tools. Render code into
                schematics, PCBs, 3D, fabrication files, and more.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href="https://docs.tscircuit.com"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 px-8 rounded-none bg-black text-white hover:bg-gray-900 text-sm font-semibold tracking-wide"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link
                  href="/seveibar/led-water-accelerometer#3d"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 px-8 rounded-none border-[#EAEAEA] text-black hover:bg-[#FAFAFA] text-sm font-semibold tracking-wide"
                  >
                    Open Online Example
                  </Button>
                </Link>

                <a
                  href="https://github.com/tscircuit/tscircuit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 sm:mt-0 sm:ml-4 hover:opacity-80 transition-opacity"
                >
                  <img
                    alt="GitHub stars"
                    src="https://img.shields.io/github/stars/tscircuit/tscircuit?style=social"
                    className="h-7"
                  />
                </a>
              </div>

              {/* Feature Micro-Badges */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 mt-12 text-xs font-mono tracking-tight text-gray-500">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" /> LIGHTNING FAST
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3" /> DESIGNED FOR AI
                </div>
              </div>
            </div>

            {/* RIGHT VIDEO COLUMN */}
            <div className="bg-[#FAFAFA] p-4 md:p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full aspect-video rounded-xl border border-[#DEDEDE] shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-black overflow-hidden relative">
                <iframe
                  className="absolute inset-0 w-full h-full object-cover"
                  src="https://www.youtube.com/embed/HAd5_ZJgg50"
                  title="TSCircuit product demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* HERO IDE SCREENSHOT - REFINED BORDER */}
        <div className="px-4 md:px-12 lg:px-20 py-16 lg:py-24 border-b border-[#EAEAEA] bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="p-2 md:p-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="w-full rounded border border-[#EAEAEA] bg-white overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEAEA] bg-white z-10 relative">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-200 bg-gray-100"></div>
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-200 bg-gray-100"></div>
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-200 bg-gray-100"></div>
                  </div>
                  <div className="text-[10px] text-gray-700 font-mono uppercase select-none tracking-wider">
                    tscircuit — editor
                  </div>
                  <div className="w-10"></div>
                </div>
                <div className="relative w-full overflow-hidden flex-1 flex">
                  <OptimizedImage
                    alt="TSCircuit Editor Preview"
                    className="w-[102%] max-w-[102%] -ml-[1%] h-auto object-cover object-top"
                    src="/assets/editor_example_2.webp"
                    height={720}
                    width={1280}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TRENDING PACKAGES */}
        <div className="border-b border-[#EAEAEA] py-12 px-4 md:px-12 lg:px-20 bg-[#FAFAFA]">
          <div className="text-xs font-mono tracking-widest text-gray-400 uppercase mb-8">
            Trending Packages
          </div>
          <TrendingPackagesCarousel />
        </div>

        {/* FEATURES GRID */}
        <section className="border-b border-[#EAEAEA]" id="features">
          <div className="px-4 md:px-12 lg:px-20 py-16 md:py-24 text-center border-b border-[#EAEAEA]">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              The Modern Toolkit for Electronic Design
            </h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
              Typescript and React equipped with expertly-designed web-first
              electronics libraries
            </p>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAEAEA]">
            <div className="p-8 md:p-12">
              <Terminal className="h-5 w-5 mb-6 text-black" />
              <h3 className="text-lg font-bold tracking-tight mb-3">
                Version Control
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Collaborate on Github or wherever you keep source code. Utilize
                industry-standard continuous integration tooling.
              </p>
            </div>

            <div className="p-8 md:p-12">
              <Cpu className="h-5 w-5 mb-6 text-black" />
              <h3 className="text-lg font-bold tracking-tight mb-3">
                Robust Autorouting
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Near-instant local and cloud autorouters to give you a
                functional circuit board fast. Route complex circuits in
                seconds.
              </p>
            </div>

            <div className="p-8 md:p-12">
              <Maximize2 className="h-5 w-5 mb-6 text-black" />
              <h3 className="text-lg font-bold tracking-tight mb-3">
                Export & Manufacture
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Export to industry-standard formats like Gerber, SPICE netlists
                and more. Zero effort Bill of Materials.
              </p>
            </div>
          </div>
        </section>

        {/* DETAILED SECTIONS */}
        <section className="divide-y divide-[#EAEAEA]">
          {/* AI Compatible */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
                01 / Built for LLMs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                AI-compatible Electronics
              </h2>
              <div className="space-y-4 text-sm text-gray-600 leading-tight lg:leading-relaxed">
                <p>
                  Teach agents tscircuit instantly with{" "}
                  <code className="font-mono bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-black">
                    npx skills add tscircuit/skill
                  </code>
                </p>
                <p>Bring your own agent (Claude Code, Codex, OpenCode).</p>
                <p>Ask to initialize, change and review schematics and PCBs.</p>
              </div>
            </div>
            <div className="bg-[#FAFAFA] p-8 md:p-12 lg:p-20 flex items-center justify-center">
              <div className="border border-[#EAEAEA] rounded w-full overflow-hidden bg-white shadow-sm p-1">
                <OptimizedImage
                  alt="AI-compatible electronics placeholder"
                  className="w-full h-auto object-cover grayscale opacity-90 rounded-sm"
                  src="/assets/fallback-image.svg"
                  height={360}
                  width={540}
                />
              </div>
            </div>
          </div>

          {/* Browser Native */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            <div className="order-2 lg:order-1 bg-[#FAFAFA] p-8 md:p-12 lg:p-20 flex items-center justify-center">
              <div className="border border-[#EAEAEA] rounded w-full overflow-hidden bg-white shadow-sm p-1">
                <OptimizedImage
                  alt="Share and display in the browser placeholder"
                  className="w-full h-auto object-cover grayscale opacity-90 rounded-sm"
                  src="/assets/fallback-image.svg"
                  height={360}
                  width={540}
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 p-8 md:p-12 lg:p-20 flex flex-col justify-center">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
                02 / Browser Native
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Share and display everywhere
              </h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Connect your GitHub or push to tscircuit.com to create
                  shareable URLs for your project.
                </p>
                <p>Every component file has a dedicated interactive webpage.</p>
                <p>
                  React component library for displaying PCBs, Schematics,
                  Assembly Diagrams, and more.
                </p>
              </div>
            </div>
          </div>

          {/* Analog Simulation */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
                03 / Simulation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Analog Simulation
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Run analog simulations in your browser or on the command line
                via WebAssembly ngspice.
              </p>

              <a
                href="https://docs.tscircuit.com/category/spice-simulation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-semibold text-black hover:text-blue-600 hover:border-blue-600 transition-all mb-8 w-fit border-b border-black pb-0.5"
              >
                Read the Analog Simulation Guide{" "}
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </a>

              <div className="border border-[#EAEAEA] rounded bg-[#0d1117]">
                {analogSimulationHtml ? (
                  <div
                    className="text-xs font-mono overflow-x-auto p-4 [&>pre]:!bg-transparent [&>pre]:m-0"
                    dangerouslySetInnerHTML={{ __html: analogSimulationHtml }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <pre className="p-4 text-xs font-mono text-gray-300">
                      <code>{analogSimulationCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-[#FAFAFA] p-8 md:p-12 lg:p-20 flex items-center justify-center">
              <div className="border border-[#EAEAEA] rounded w-full overflow-hidden bg-white shadow-sm p-1">
                <OptimizedImage
                  alt="Analog simulation"
                  className="w-full h-auto object-cover rounded-sm"
                  src={analogSimulationImg}
                  height={360}
                  width={540}
                />
              </div>
            </div>
          </div>

          {/* Extremely Fast Autorouting */}
          <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center items-center text-center bg-white border-b border-[#EAEAEA]">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
              04 / Routing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Extremely Fast Autorouting
            </h2>
            <div className="space-y-4 text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
              <p>
                Autoroute circuit boards using{" "}
                <a className="underline hover:text-black font-medium" href="#">
                  freerouting
                </a>{" "}
                or{" "}
                <a className="underline hover:text-black font-medium" href="#">
                  tscircuit&apos;s fast autorouter
                </a>
                .
              </p>
              <p>
                Autoroute as few as 1 layer with automatically placed jumpers.
              </p>
              <p>Route complex circuits in seconds.</p>
            </div>
          </div>

          {/* KiCad Support */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            <div className="order-2 lg:order-1 bg-[#FAFAFA] p-8 md:p-12 lg:p-20 flex items-center justify-center">
              <div className="border border-[#EAEAEA] rounded w-full overflow-hidden bg-white shadow-sm p-1">
                <OptimizedImage
                  alt="KiCad support via PCB Server"
                  className="w-full h-auto object-cover rounded-sm"
                  src={importKicadLibraryImg}
                  height={360}
                  width={540}
                />
              </div>
            </div>
            <div className="order-1 lg:order-2 p-8 md:p-12 lg:p-20 flex flex-col justify-center">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
                05 / Interoperability
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                First Class KiCad Support
              </h2>
              <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
                <div>
                  <div className="font-semibold text-black mb-1">
                    Export to KiCad
                  </div>
                  <p>
                    Export to KiCad PCB and Schematic files. Just run{" "}
                    <code className="font-mono bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-black text-xs">
                      tsci build --kicad-library
                    </code>
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-black mb-1">
                    Import KiCad files directly
                  </div>
                  <p>
                    <code className="font-mono bg-[#FAFAFA] border border-[#EAEAEA] px-1.5 py-0.5 rounded text-black text-xs">
                      import RP2040 from "./RP2040.kicad_mod"
                    </code>
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-black mb-1">
                    Automatic KiCad PCM Server
                  </div>
                  <p>
                    Import your library anywhere. Enable KiCad PCM to have every
                    tscircuit package automatically serve components and
                    subcircuits as importable KiCad modules.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Zero Effort Bill of Materials */}
          <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center items-center text-center bg-white border-t border-[#EAEAEA]">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">
              06 / Inventory
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Zero Effort Bill of Materials and Inventory Checks
            </h2>
            <div className="space-y-4 text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
              <p>Integrations with major component suppliers.</p>
              <p>
                Automatic passive component selection based on component
                properties.
              </p>
              <p>
                Supplier part numbers, pricing and inventory automatically
                queried.
              </p>
            </div>
          </div>
        </section>

        {/* ADDITIONAL SCHEMATIC */}
        <section className="border-t border-[#EAEAEA] bg-[#FAFAFA]">
          <div className="p-8 md:p-16 flex flex-col items-center max-w-5xl mx-auto">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-8 text-center">
              Standard Output Formats
            </div>
            <div className="w-full rounded border border-[#EAEAEA] overflow-hidden shadow-sm bg-white p-2">
              <OptimizedImage
                alt="Example schematic generated by tscircuit"
                className="w-full h-auto object-cover rounded-sm"
                src="/assets/example_schematic.webp"
                height={310}
                width={800}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-[#EAEAEA]">
          <FAQ />
        </div>

        {/* CTA SECTION */}
        <section
          className="border-t border-[#EAEAEA] py-12 md:py-32 px-4 md:px-12 text-center bg-white"
          id="cta"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
            Ready to build electronics with code?
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Join hundreds of engineers who are already using tscircuit to design
            complex electronics!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => {
                if (!isLoggedIn) {
                  signIn()
                } else {
                  navigate("/dashboard")
                }
              }}
              size="lg"
              className="h-12 px-8 rounded-none bg-black text-white hover:bg-gray-900 text-sm font-semibold tracking-wide"
            >
              Get Started
            </Button>
            <a
              href="https://docs.tscircuit.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-8 rounded-none border border-[#EAEAEA] text-black hover:bg-[#FAFAFA] text-sm font-semibold tracking-wide"
              >
                Read the Docs
              </Button>
            </a>
          </div>
        </section>
      </main>

      <div className="border-t border-[#EAEAEA] bg-white">
        <Footer />
      </div>
    </div>
  )
}
