import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/OptimizedImage"
import {
  Cpu,
  BotIcon,
  Zap,
  ArrowRight,
  Terminal,
  ShoppingCart,
  Play,
  ExternalLink,
  Maximize2,
} from "lucide-react"
import { Helmet } from "react-helmet"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import { useSignIn } from "@/hooks/use-sign-in"
import { useGlobalStore } from "@/hooks/use-global-store"
import { navigate } from "wouter/use-browser-location"
import { FAQ } from "@/components/FAQ"
import { TrendingPackagesCarousel } from "@/components/TrendingPackagesCarousel"
import importKicadLibraryImg from "@/assets/import-kicad-library.png"
import analogSimulationImg from "@/assets/analogsimulation.png"
import { ScrollRevealContainer } from "@/components/ScrollRevealContainer"
import { useShikiHighlighter } from "@/hooks/use-shiki-highlighter"
import { useMemo, useState } from "react"
import { MinimalEditor } from "@/components/MinimalEditor"
import { TEMPLATES } from "@/lib/landing-templates"

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

  const [activeTemplate, setActiveTemplate] =
    useState<string>("board.circuit.tsx")
  const [editableCode, setEditableCode] = useState<Record<string, string>>({
    "board.circuit.tsx": TEMPLATES["board.circuit.tsx"].code,
    "motordriver.circuit.tsx": TEMPLATES["motordriver.circuit.tsx"].code,
    "keyboard.circuit.tsx": TEMPLATES["keyboard.circuit.tsx"].code,
  })

  const editorCode = editableCode[activeTemplate]

  const handleTemplateChange = (name: string) => {
    setActiveTemplate(name)
  }

  const handleOrder = () => {
    if (!isLoggedIn) {
      signIn()
    } else {
      navigate("/editor")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-black font-sans selection:bg-black selection:text-white">
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
        {/* HERO SECTION - TEXT & OBJECTIONS */}
        <section className="relative border-b border-[#EAEAEA] bg-white pt-20 pb-16 md:pt-28 md:pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
          {/* Minimal dot background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex w-fit items-center gap-2 px-3 py-1 mb-8 border border-[#EAEAEA] bg-white text-[10px] sm:text-xs font-mono tracking-wider text-black uppercase shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
              Open-Source / MIT
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold tracking-tighter leading-[1.05] text-black mb-6 max-w-5xl">
              AI codes electronics <br className="hidden sm:block" />
              with <span className="text-blue-600">tscircuit</span>
            </h1>

            <p className="max-w-[600px] text-base sm:text-lg md:text-xl text-black/70 leading-relaxed mb-10 mx-auto">
              Build electronics with code and AI tools. Render code into
              schematics, PCBs, 3D, and fabrication files instantly.
            </p>

            <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 md:gap-10 text-sm md:text-base text-black/80">
              <li className="flex items-center gap-2 md:gap-3">
                <Zap className="size-4  " />

                <span className="text-black font-semibold">
                  Lightning Fast Autorouting
                </span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <BotIcon className="size-4  " />

                <span className="text-black font-semibold">
                  Designed for AI
                </span>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <Cpu className="size-4  " />

                <span className="text-black font-semibold">
                  Export & Manufacture
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* EDITOR-AS-LANDING-PAGE HERO */}
        <section className="border-b border-[#EAEAEA] bg-white">
          <div className="grid lg:grid-cols-[1fr_1fr] min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            {/* Editor Side */}
            <div className="flex flex-col bg-[#0d1117] relative group">
              <div className="flex items-center border-b border-gray-800 bg-[#0d1117] overflow-x-auto no-scrollbar">
                {Object.keys(TEMPLATES).map((name) => (
                  <button
                    key={name}
                    onClick={() => handleTemplateChange(name)}
                    className={`px-5 py-3.5 text-xs font-mono whitespace-nowrap transition-colors border-r border-gray-800 ${activeTemplate === name ? "text-white bg-[#161b22]" : "text-gray-500 hover:text-white hover:bg-[#161b22]/50"}`}
                  >
                    {name}
                  </button>
                ))}
                <div className="flex-1 border-b border-gray-800 h-full"></div>
              </div>
              <div className="flex-1 relative group/editor">
                {/* CodeMirror Editor */}
                <div className="absolute inset-0 w-full h-full bg-[#0d1117] overflow-hidden p-0 [&_.cm-editor]:!bg-[#0d1117] [&_.cm-gutters]:!bg-[#0d1117]">
                  <MinimalEditor
                    code={editorCode}
                    onChange={(newCode) => {
                      setEditableCode((prev) => ({
                        ...prev,
                        [activeTemplate]: newCode,
                      }))
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-6 right-6 flex items-center gap-3 z-20">
                  <Button
                    onClick={handleOrder}
                    className="h-10 px-5 bg-white text-black hover:bg-gray-100 rounded shadow-xl flex items-center gap-2 font-bold transition-transform hover:scale-105"
                  >
                    <Play className="w-4 h-4" /> Run
                  </Button>
                  <Button
                    onClick={handleOrder}
                    className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xl flex items-center gap-2 opacity-0 group-hover/editor:opacity-100 transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4" /> Open in Editor
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Side */}
            <div className="flex flex-col bg-white relative">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEAEA] bg-white z-10">
                <div className="text-[10px] text-black/50 font-mono uppercase tracking-wider font-bold">
                  Preview
                </div>
                <div className="w-10"></div>
              </div>
              <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-white">
                <img
                  key={activeTemplate}
                  src={TEMPLATES[activeTemplate].preview}
                  alt={`${activeTemplate} Preview`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
              </div>
              {/* Order Panel Below Preview */}
              <div className="border-t border-[#EAEAEA] bg-[#fdfdfd] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-none shadow-sm">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-black">
                      Ready to build?
                    </h3>
                    <p className="text-sm text-black/70">
                      Order this exact PCB layout fully assembled.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
                  <Button
                    onClick={handleOrder}
                    className="w-full sm:w-auto h-12 px-8 bg-black text-white hover:bg-gray-900 rounded-none font-bold tracking-wide uppercase"
                  >
                    Build & Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO VIDEO SECTION */}
        <section className="border-b border-[#EAEAEA] bg-white p-6 md:p-16 flex flex-col items-center">
          <div className="text-xs font-mono text-black/50 uppercase tracking-widest mb-8 text-center select-none">
            See it in action
          </div>
          <ScrollRevealContainer className="w-full max-w-4xl">
            <div className="w-full aspect-video border border-[#EAEAEA] bg-black relative shadow-md">
              <iframe
                className="absolute inset-0 w-full h-full object-cover"
                src="https://www.youtube-nocookie.com/embed/HAd5_ZJgg50?rel=0&disablekb=1&color=white"
                title="TSCircuit product demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </ScrollRevealContainer>
        </section>

        {/* TRENDING PACKAGES */}
        <div className="border-b border-[#EAEAEA] py-12 px-4 md:px-12 lg:px-20 bg-white">
          <div className="text-xs font-mono tracking-widest text-black/50 uppercase mb-8">
            Trending Packages
          </div>
          <TrendingPackagesCarousel />
        </div>

        {/* FEATURES GRID */}
        <section className="border-b border-[#EAEAEA]" id="features">
          <div className="px-4 md:px-12 lg:px-20 py-16 md:py-24 text-center border-b border-[#EAEAEA]">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-black">
              The Modern Toolkit for Electronic Design
            </h2>
            <p className="text-lg md:text-xl text-black/70 max-w-3xl mx-auto leading-relaxed">
              Typescript and React equipped with expertly-designed web-first
              electronics libraries
            </p>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAEAEA]">
            <div className="group p-8 md:p-12 hover:bg-black/[0.02] transition-colors duration-300 cursor-default">
              <Terminal className="h-6 w-6 mb-6 text-black transform group-hover:-translate-y-1 transition-all duration-300" />
              <h3 className="text-lg font-bold tracking-tight mb-3 text-black">
                Version Control
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Collaborate on Github or wherever you keep source code. Utilize
                industry-standard continuous integration tooling.
              </p>
            </div>

            <div className="group p-8 md:p-12 hover:bg-black/[0.02] transition-colors duration-300 cursor-default">
              <Cpu className="h-6 w-6 mb-6 text-black transform group-hover:-translate-y-1 transition-all duration-300" />
              <h3 className="text-lg font-bold tracking-tight mb-3 text-black">
                Robust Autorouting
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
                Near-instant local and cloud autorouters to give you a
                functional circuit board fast. Route complex circuits in
                seconds.
              </p>
            </div>

            <div className="group p-8 md:p-12 hover:bg-black/[0.02] transition-colors duration-300 cursor-default">
              <Maximize2 className="h-6 w-6 mb-6 text-black transform group-hover:-translate-y-1 transition-all duration-300" />
              <h3 className="text-lg font-bold tracking-tight mb-3 text-black">
                Export & Manufacture
              </h3>
              <p className="text-sm text-black/70 leading-relaxed">
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
            <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-white">
              <div className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4 select-none">
                01 / Built for LLMs
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">
                AI-compatible Electronics
              </h2>
              <div className="space-y-4 text-sm text-black/70 leading-tight lg:leading-relaxed">
                <p>
                  Teach agents tscircuit instantly with{" "}
                  <code className="font-mono bg-black/5 border border-black/10 px-1.5 py-0.5 rounded text-black font-bold">
                    bun x skills add tscircuit/skill
                  </code>
                </p>
                <p>Bring your own agent (Claude Code, Codex, OpenCode).</p>
                <p>Ask to initialize, change and review schematics and PCBs.</p>
              </div>
            </div>
            <div className="bg-white flex items-center justify-center relative overflow-hidden h-full min-h-[300px]">
              <OptimizedImage
                alt="AI-compatible electronics placeholder"
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/fallback-image.svg"
                height={360}
                width={540}
              />
            </div>
          </div>

          {/* Browser Native */}
          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#EAEAEA]">
            <div className="order-2 lg:order-1 bg-white flex items-center justify-center relative overflow-hidden h-full min-h-[300px]">
              <OptimizedImage
                alt="Share and display in the browser placeholder"
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/fallback-image.svg"
                height={360}
                width={540}
              />
            </div>
            <div className="order-1 lg:order-2 p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-white">
              <div className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4 select-none">
                02 / Browser Native
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">
                Share and display everywhere
              </h2>
              <div className="space-y-4 text-sm text-black/70 leading-4">
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
            <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center min-w-0 bg-white">
              <div className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4 select-none">
                03 / Simulation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">
                Analog Simulation
              </h2>
              <p className="text-sm text-black/70 leading-4 mb-6">
                Run analog simulations in your browser or on the command line
                via WebAssembly ngspice.
              </p>

              <a
                href="https://docs.tscircuit.com/category/spice-simulation"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-black hover:text-blue-600 transition-colors mb-8 w-fit border-b-2 border-black hover:border-blue-600 pb-0.5"
              >
                Read the Analog Simulation Guide{" "}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </a>

              <div className="border border-black/10 rounded-none bg-[#0d1117] overflow-hidden no-scrollbar shadow-sm">
                {analogSimulationHtml ? (
                  <div
                    className="text-[10px] sm:text-xs font-mono overflow-x-auto p-4 [&>pre]:!bg-transparent [&>pre]:m-0 no-scrollbar"
                    dangerouslySetInnerHTML={{ __html: analogSimulationHtml }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <pre className="p-4 text-[10px] sm:text-xs font-mono text-[#c9d1d9]">
                      <code>{analogSimulationCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white flex items-center justify-center relative overflow-hidden h-full min-h-[300px]">
              <OptimizedImage
                alt="Analog simulation"
                className="absolute inset-0 w-full h-full object-cover"
                src={analogSimulationImg}
                height={360}
                width={540}
              />
            </div>
          </div>

          {/* Extremely Fast Autorouting */}
          <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center items-center text-center bg-white border-b border-[#EAEAEA]">
            <div className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4 select-none">
              04 / Routing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">
              Extremely Fast Autorouting
            </h2>
            <div className="space-y-4 text-sm md:text-base text-black/70 max-w-2xl !leading-[1]">
              <p>
                Autoroute circuit boards using{" "}
                <a
                  className="border-b border-black font-bold hover:text-blue-600 hover:border-blue-600 transition-colors"
                  href="#"
                >
                  freerouting
                </a>{" "}
                or{" "}
                <a
                  className="border-b border-black font-bold hover:text-blue-600 hover:border-blue-600 transition-colors"
                  href="#"
                >
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
            <div className="order-2 lg:order-1 bg-white flex items-center justify-center relative overflow-hidden h-full min-h-[300px]">
              <OptimizedImage
                alt="KiCad support via PCB Server"
                className="absolute inset-0 w-full h-full object-cover"
                src={importKicadLibraryImg}
                height={360}
                width={540}
              />
            </div>
            <div className="order-1 lg:order-2 p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-white">
              <div className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4 select-none">
                05 / Interoperability
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">
                First Class KiCad Support
              </h2>
              <div className="space-y-6 text-sm text-black/70 leading-relaxed">
                <div>
                  <div className="font-bold text-black mb-1">
                    Export to KiCad
                  </div>
                  <p>
                    Export to KiCad PCB and Schematic files. Just run{" "}
                    <code className="font-mono bg-black/5 border border-black/10 px-1.5 py-0.5 rounded text-black font-bold text-xs">
                      tsci build --kicad-library
                    </code>
                  </p>
                </div>
                <div>
                  <div className="font-bold text-black mb-1">
                    Import KiCad files directly
                  </div>
                  <p>
                    <code className="font-mono bg-black/5 border border-black/10 px-1.5 py-0.5 rounded text-black font-bold text-xs">
                      import RP2040 from "./RP2040.kicad_mod"
                    </code>
                  </p>
                </div>
                <div>
                  <div className="font-bold text-black mb-1">
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
            <div className="text-xs font-mono text-black/50 uppercase tracking-widest mb-4 select-none">
              06 / Inventory
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">
              Zero Effort Bill of Materials and Inventory Checks
            </h2>
            <div className="space-y-4 text-sm md:text-base text-black/70 max-w-2xl !leading-[1]">
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
        <section className="border-t border-[#EAEAEA] bg-white">
          <div className="p-8 md:p-16 flex flex-col items-center max-w-5xl mx-auto overflow-hidden">
            <ScrollRevealContainer className="w-full">
              <div className="w-full overflow-hidden bg-white relative">
                <OptimizedImage
                  alt="Example schematic generated by tscircuit"
                  className="w-full h-auto object-cover"
                  src="/assets/example_schematic.webp"
                  height={310}
                  width={800}
                />
              </div>
            </ScrollRevealContainer>
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
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-black">
            Ready to build electronics with code?
          </h2>
          <p className="text-black/70 mb-10 max-w-xl mx-auto">
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
              className="h-12 px-8 rounded-none bg-black text-white hover:bg-gray-900 text-sm font-bold tracking-wide shadow-lg"
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
                className="w-full sm:w-auto h-12 px-8 rounded-none border-2 border-black text-black hover:bg-black/5 text-sm font-bold tracking-wide"
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
