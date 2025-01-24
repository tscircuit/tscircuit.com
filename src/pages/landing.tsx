import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/OptimizedImage"
import {
  CircuitBoard,
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
import { TrendingSnippetCarousel } from "@/components/TrendingSnippetCarousel"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"

export function LandingPage() {
  const signIn = useSignIn()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))
  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900">
      <Helmet>
        <link rel="preconnect" href="https://img.shields.io" />
        <link rel="dns-prefetch" href="https://img.shields.io" />

        <link rel="preconnect" href="https://shields.io" />
        <link rel="dns-prefetch" href="https://shields.io" />

        <link rel="preconnect" href="https://tscircuit.com" />
        <link rel="dns-prefetch" href="https://tscircuit.com" />

        <link rel="preconnect" href="https://registry-api.tscircuit.com" />
        <link rel="dns-prefetch" href="https://registry-api.tscircuit.com" />
      </Helmet>
      <Header2 />
      <main className="flex-1">
        <section className="w-full py-8 md:py-12 lg:py-20 xl:py-36">
          <div className="container px-4 mx-auto md:px-6">
            <div className="container mx-auto max-w-7xl">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="w-fit dark:bg-gray-800"
                    >
                      Open-Source, MIT Licensed
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none dark:text-gray-100">
                      The New Foundation for Electronic Design
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl dark:text-gray-400">
                      Build electronics with code, AI, and drag'n'drop tools.
                      <br />
                      Render code into schematics, PCBs, 3D, fabrication files,
                      and more.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 min-[400px]:flex-row">
                    <Button
                      onClick={() => {
                        if (!isLoggedIn) {
                          signIn()
                        } else {
                          navigate("/dashboard")
                        }
                      }}
                      size="lg"
                      aria-label="Get started with TSCircuit"
                    >
                      Get Started
                    </Button>
                    <PrefetchPageLink href="/quickstart">
                      <Button
                        size="lg"
                        variant="outline"
                        aria-label="Open online example of TSCircuit"
                      >
                        Open Online Example
                      </Button>
                    </PrefetchPageLink>
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
                  <div className="grid items-center w-full grid-cols-2 gap-4 text-sm sm:flex">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 dark:text-gray-300" />
                      <span className="dark:text-gray-300">
                        Lightning Fast Autorouting
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Cpu className="w-4 h-4 dark:text-gray-300" />
                      <span className="dark:text-gray-300">
                        Designed for AI
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Layers className="w-4 h-4 dark:text-gray-300" />
                      <span className="dark:text-gray-300">
                        Export & Manufacture
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:hidden">
                      <Code2 className="w-4 h-4 dark:text-gray-300" />
                      <span className="dark:text-gray-300">
                        Open Web Standards
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative w-full aspect-video">
                  <OptimizedImage
                    alt="Product preview"
                    className="absolute inset-0 object-cover object-center w-full h-full mx-auto mt-8 overflow-hidden rounded-xl lg:mt-0"
                    src="/assets/editor_example_1_more_square.webp"
                    priority={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <TrendingSnippetCarousel />
        <section
          className="w-full py-12 bg-gray-100 md:py-24 lg:py-32 dark:bg-gray-800"
          id="features"
        >
          <div className="container px-4 mx-auto md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl dark:text-gray-100">
                  The Modern Toolkit for Electronic Design
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl dark:text-gray-400">
                  Typescript and React equipped with expertly-designed web-first
                  electronics libraries
                </p>
              </div>
            </div>
            <div className="grid items-center max-w-5xl gap-6 py-12 mx-auto lg:grid-cols-3">
              <Card className="h-full transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800">
                <CardContent className="p-6">
                  <Lightning className="w-12 h-12 mb-4 dark:text-gray-300" />
                  <h3 className="text-xl font-bold dark:text-gray-100">
                    Version Control
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Collaborate on Github or wherever you keep source code.
                    Utilize industry-standard continuous integration tooling
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800">
                <CardContent className="p-6">
                  <Cpu className="w-12 h-12 mb-4 dark:text-gray-300" />
                  <h3 className="text-xl font-bold dark:text-gray-100">
                    Robust Autorouting
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Near-instant local and cloud autorouters to give you a
                    functional circuit board fast
                  </p>
                </CardContent>
              </Card>
              <Card className="h-full transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800">
                <CardContent className="p-6">
                  <Maximize2 className="w-12 h-12 mb-4 dark:text-gray-300" />
                  <h3 className="text-xl font-bold dark:text-gray-100">
                    Export & Manufacture
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Export to industry-standard formats like Gerber, SPICE
                    netlists and more
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <div className="md:mt-8">
          <OptimizedImage
            alt="Product preview"
            className="object-cover object-center mx-auto overflow-hidden aspect-video rounded-xl"
            src="/assets/editor_example_2.webp"
            height={310}
            width={800}
          />
        </div>
        <FAQ />
        <div className="md:mt-8">
          <OptimizedImage
            alt="Product preview"
            className="object-cover object-center mx-auto overflow-hidden aspect-video rounded-xl"
            src="/assets/example_schematic.webp"
            height={310}
            width={800}
          />
        </div>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-primary dark:bg-primary-dark"
          id="cta"
        >
          <div className="container px-4 mx-auto md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-primary-foreground dark:text-primary-foreground-dark">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl dark:text-white">
                  Ready to build electronics with code?
                </h2>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl dark:text-slate-300">
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
      {/* <Footer2 /> */}
    </div>
  )
}
