import { Button } from "@/components/ui/button"
import { ContainerTextFlip } from "@/components/ui/container-text-flip"
import { LandingHeroCodePreview } from "@/components/LandingHeroCodePreview"
import { LandingTeamSwitchSection } from "@/components/LandingTeamSwitchSection"
import { OptimizedImage } from "@/components/OptimizedImage"
import { Cpu, Layers, Zap } from "lucide-react"
import { Helmet } from "react-helmet"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import { useSignIn } from "@/hooks/use-sign-in"
import { useGlobalStore } from "@/hooks/use-global-store"
import { navigate } from "wouter/use-browser-location"
import { FAQ } from "@/components/FAQ"
// import { TrendingPackagesCarousel } from "@/components/TrendingPackagesCarousel"
import { Link } from "wouter"
import playgroundScreenshotImg from "@/assets/playground screenshot.png"

const heroStats = [
  { value: "2.1k", label: "Repo stars" },
  { value: "289", label: "Public repos" },
  { value: "209", label: "GH followers" },
]

const galleryBoards = [
  {
    owner: "tscircuit",
    name: "motor-controller",
    href: "https://tscircuit.com/tscircuit/motor-controller",
    image:
      "https://api.tscircuit.com/packages/images/tscircuit/motor-controller/3d.png?fs_sha=md5-c2c0398bd4e4ba65f1ac347ab98fe6c8",
  },
  {
    owner: "seveibar",
    name: "keyboard-default60",
    href: "https://tscircuit.com/seveibar/keyboard-default60",
    image:
      "https://api.tscircuit.com/packages/images/seveibar/keyboard-default60/3d.png?fs_sha=md5-5d1ef3b6acd49f7490d1c071a09af9fe",
  },
  {
    owner: "seveibar",
    name: "led-water-accelerometer",
    href: "https://tscircuit.com/seveibar/led-water-accelerometer",
    image:
      "https://api.tscircuit.com/packages/images/seveibar/led-water-accelerometer/3d.png?fs_sha=md5-8c17230bc054ae056c4280be4bb268bb",
  },
]

const heroHeadlinePhrases = [
  "AI-generated",
  "code-first",
  "agent-ready",
  "open-source",
]

export function LandingPage() {
  const signIn = useSignIn()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))

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
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)] lg:gap-14 xl:gap-16">
              <div className="min-w-0 space-y-8 lg:max-w-[38rem]">
                <div className="space-y-5">
                  <div
                    className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    The hardware framework for AI teams
                  </div>
                  <h1
                    className="max-w-4xl text-[clamp(2.65rem,8.5vw,58px)] font-semibold leading-[1.02] tracking-[-0.035em] text-slate-900 sm:text-[clamp(2.9rem,7vw,58px)] dark:text-slate-50"
                    style={{ fontFamily: '"Geist", system-ui, sans-serif' }}
                  >
                    <span className="block">The #1 framework for</span>
                    <ContainerTextFlip
                      words={heroHeadlinePhrases}
                      interval={2400}
                      animationDuration={520}
                      className="mt-2 inline-grid max-w-full rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 !text-[clamp(2.2rem,7.2vw,4.85rem)] text-blue-600 shadow-none sm:px-4 md:mt-3 md:px-5 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                      textClassName="!text-[clamp(2.2rem,7.2vw,4.85rem)] font-semibold tracking-[-0.04em]"
                    />
                    <span className="block">electronics.</span>
                  </h1>
                  <p className="max-w-[520px] text-[17px] leading-[1.65] text-slate-600 dark:text-slate-300">
                    Build electronics with TypeScript and AI tools. Render code
                    into schematics, PCBs, 3D views, fabrication files, and
                    shareable previews in the browser.
                  </p>
                </div>

                <div
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  <Link
                    href="/seveibar/led-water-accelerometer#3d"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      aria-label="Open online example of TSCircuit"
                      className="h-10 w-full rounded-md px-3.5 text-[12px] sm:w-auto"
                    >
                      Open Online Example
                    </Button>
                  </Link>
                  <a
                    href="https://docs.tscircuit.com"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      aria-label="Get started with TSCircuit"
                      className="h-10 w-full rounded-md px-3.5 text-[12px] sm:w-auto"
                    >
                      Get Started
                    </Button>
                  </a>
                </div>

                <div
                  className="grid max-w-xl grid-cols-2 gap-5 border-t border-slate-300/70 pt-8 sm:grid-cols-3 sm:gap-6 dark:border-slate-700/80"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {heroStats.map((stat) => (
                    <div key={stat.label}>
                      <p
                        className="text-[18px] font-semibold tracking-[-0.03em] text-slate-900 dark:text-slate-50"
                        style={{ fontFamily: '"Geist", system-ui, sans-serif' }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="mt-1 text-[11px] text-slate-500 dark:text-slate-400"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm min-[520px]:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-5">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span>Lightning Fast Autorouting</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <span>Designed for AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <span>Export &amp; Manufacture</span>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <LandingHeroCodePreview />
              </div>
            </div>
          </div>
        </section>
        <LandingTeamSwitchSection />
        {/* <TrendingPackagesCarousel /> */}
        <section
          className="relative w-full border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-950 md:py-20 lg:py-24"
          aria-labelledby="playground-title"
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-16">
              <div className="max-w-[30rem]">
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400"
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
                <Link
                  href="/seveibar/led-water-accelerometer#3d"
                  className="mt-6 inline-flex"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  <Button size="lg" className="h-10 rounded-md px-3.5 text-[12px]">
                    Open playground →
                  </Button>
                </Link>
              </div>
              <div className="w-full justify-self-end overflow-hidden rounded-2xl border border-slate-200 bg-white lg:max-w-[44rem] dark:border-slate-800 dark:bg-slate-900">
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
        <section
          className="w-full bg-slate-50 py-14 dark:bg-slate-950/50 md:py-20 lg:py-24"
          aria-labelledby="gallery-title"
        >
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="max-w-3xl">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                Shipped with tscircuit
              </p>
              <h2
                id="gallery-title"
                className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl"
              >
                Boards teams actually sent to fab.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {galleryBoards.map((board) => (
                <a
                  key={board.href}
                  href={board.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                  <div
                    className="h-[240px] bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-[1.02] md:h-[260px]"
                    style={{ backgroundImage: `url("${board.image}")` }}
                  />
                  <div className="border-t border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div
                      className="text-[11px] uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {board.owner}
                    </div>
                    <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      {board.name}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-6">
              <a
                href="https://tscircuit.com/trending"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-3.5 text-[12px] font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                Browse gallery · 240 boards →
              </a>
            </div>
          </div>
        </section>
        <FAQ />
        <section className="w-full border-t border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-950/50 md:py-20 lg:py-24" id="cta">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center lg:gap-14">
              <div className="space-y-4 text-center lg:max-w-[32rem] lg:text-left">
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  Start building
                </p>
                <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                  Ready to build electronics with code?
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg lg:mx-0">
                  Join thousands of engineers who are already using tscircuit to
                  design complex electronics!
                </p>
                <div
                  className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-start"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
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
              <div className="mx-auto w-full max-w-[52rem] overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <OptimizedImage
                  alt="tscircuit schematic preview"
                  className="h-[260px] w-full rounded-2xl object-cover object-center md:h-[320px] lg:h-[360px]"
                  src="/assets/example_schematic.webp"
                  height={310}
                  width={800}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
