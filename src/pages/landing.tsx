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
import { Link } from "wouter"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import { useSignIn } from "@/hooks/use-sign-in"
import { useGlobalStore } from "@/hooks/use-global-store"
import { navigate } from "wouter/use-browser-location"
import { FAQ } from "@/components/FAQ"
import { TrendingSnippetCarousel } from "@/components/TrendingSnippetCarousel"

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

        <link rel="preconnect" href="https://registry-api.tscircuit.com" />
        <link rel="dns-prefetch" href="https://registry-api.tscircuit.com" />
      </Helmet>
      <Header2 />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="container mx-auto max-w-7xl">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      Open-Source, MIT Licensed
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      The New Foundation for Electronic Design
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
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
                    >
                      Get Started
                    </Button>
                    <Link href="/quickstart">
                      <Button size="lg" variant="outline">
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
                <OptimizedImage
                  alt="Product preview"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
                  src="/src/assets/editor_example_1_more_square/editor_example_1_more_square-1200w.webp"
                  priority={true}
                />
              </div>
            </div>
          </div>
        </section>
        <TrendingSnippetCarousel />
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
        <div className="md:mt-8">
          <OptimizedImage
            alt="Product preview"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
            src="/src/assets/editor_example_2/editor_example_2-1200w.webp"
          />
        </div>
        <FAQ />
        <div className="md:mt-8">
          <OptimizedImage
            alt="Product preview"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
            src="/src/assets/example_schematic/example_schematic-1200w.webp"
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
