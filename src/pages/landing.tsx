import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/OptimizedImage"
import {
  Zap,
  CheckCircle,
  ArrowRight,
  Users,
  GitBranch,
  Shield,
} from "lucide-react"
import { Helmet } from "react-helmet"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import { useSignIn } from "@/hooks/use-sign-in"
import { useGlobalStore } from "@/hooks/use-global-store"
import { navigate } from "wouter/use-browser-location"
import { FAQ } from "@/components/FAQ"
import { TrendingPackagesCarousel } from "@/components/TrendingPackagesCarousel"
import { PrefetchPageLink } from "@/components/PrefetchPageLink"

export function LandingPage() {
  const signIn = useSignIn()
  const isLoggedIn = useGlobalStore((s) => Boolean(s.session))

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>
          TSCircuit - Electronics Design with Code | Build PCBs, Schematics &
          More
        </title>
        <meta
          name="title"
          content="TSCircuit - Electronics Design with Code | Build PCBs, Schematics & More"
        />
        <meta
          name="description"
          content="Join thousands of engineers using TSCircuit to design complex electronics with TypeScript and drag'n'drop tools. Create schematics, PCBs, 3D models, and fabrication files. Open-source, MIT licensed!"
        />
        <meta
          name="keywords"
          content="electronics design, PCB design, schematic design, TypeScript electronics, AI electronics, circuit design, open source PCB, electronic engineering, circuit board design, autorouting, gerber files"
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="TSCircuit" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://tscircuit.com" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tscircuit.com" />
        <meta
          property="og:title"
          content="TSCircuit - Electronics Design with Code"
        />
        <meta
          property="og:description"
          content="Build electronics with TypeScript and drag'n'drop tools. Create schematics, PCBs, 3D models, and fabrication files. Open-source!"
        />
        <meta
          property="og:image"
          content="https://tscircuit.com/assets/og-image.png"
        />
        <meta property="og:site_name" content="TSCircuit" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tscircuit.com" />
        <meta
          property="twitter:title"
          content="TSCircuit - Electronics Design with Code"
        />
        <meta
          property="twitter:description"
          content="Build electronics with TypeScript and drag'n'drop tools. Create schematics, PCBs, 3D models, and fabrication files."
        />
        <meta
          property="twitter:image"
          content="https://tscircuit.com/assets/twitter-image.png"
        />
        <meta property="twitter:creator" content="@tscircuit" />

        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://img.shields.io" />
        <link rel="dns-prefetch" href="https://img.shields.io" />
        <link rel="preconnect" href="https://github.com" />
        <link rel="dns-prefetch" href="https://github.com" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "TSCircuit",
            description:
              "Electronics design platform for building PCBs, schematics, and circuit boards with TypeScript and code.",
            url: "https://tscircuit.com",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            creator: {
              "@type": "Organization",
              name: "TSCircuit",
              url: "https://tscircuit.com",
            },
            featureList: [
              "Electronics design",
              "TypeScript-based circuit creation",
              "Automatic PCB routing",
              "Schematic generation",
              "3D visualization",
              "Gerber file export",
              "Open source and MIT licensed",
            ],
          })}
        </script>
      </Helmet>

      <Header2 />

      <main className="flex-1" role="main">
        {/* Hero Section */}
        <section
          className="w-full py-12 md:py-20 lg:py-28 xl:py-36"
          aria-labelledby="hero-heading"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_600px] items-center">
                <div className="flex flex-col justify-center space-y-8">
                  {/* Social Proof Badge */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                      Open-Source & MIT Licensed
                    </Badge>
                  </div>

                  {/* Main Headline */}
                  <div className="space-y-6">
                    <h1
                      id="hero-heading"
                      className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-tight text-foreground"
                    >
                      Codes electronics with tscircuit
                    </h1>

                    <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-[600px] leading-relaxed">
                      Build electronics with code and drag'n'drop tools.
                      <span className="text-foreground font-semibold">
                        {" "}
                        Render code into schematics, PCBs, 3D, fabrication
                        files, and more.
                      </span>
                    </p>
                  </div>

                  {/* Key Benefits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">
                        Lightning Fast Autorouting
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Innovative Design</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Export & Manufacture</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Open Web Standards</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <a href="https://docs.tscircuit.com" className="group">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto text-lg px-8 py-6"
                        aria-label="Get started with TSCircuit"
                      >
                        Start Building Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </a>

                    <PrefetchPageLink href="/seveibar/usb-c-flashlight#3d">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-blue-50"
                        aria-label="Open online example of TSCircuit"
                      >
                        Live Demo
                      </Button>
                    </PrefetchPageLink>
                  </div>

                  {/* GitHub Stars & Trust Signals */}
                  <div className="flex items-center gap-6 pt-4">
                    <a
                      href="https://github.com/tscircuit/tscircuit"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        alt="GitHub stars"
                        src="https://img.shields.io/github/stars/tscircuit/tscircuit?style=for-the-badge&labelColor=black&color=black&logo=github"
                        className="h-6 hover:opacity-80 transition-opacity"
                      />
                    </a>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">
                        Trusted by developers worldwide
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="w-full aspect-video">
                  <OptimizedImage
                    alt="TSCircuit electronics design platform interface featuring TypeScript code editor, real-time PCB visualization, schematic generation, and 3D circuit board preview"
                    className="w-full h-full rounded-xl object-cover shadow-lg"
                    src="/assets/editor_example_1_more_square.webp"
                    priority={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Packages */}
        <TrendingPackagesCarousel />

        {/* Features Section */}
        <section
          className="w-full py-16 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900"
          aria-labelledby="features-heading"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <header className="text-center space-y-4 mb-16">
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Why Choose TSCircuit
              </Badge>
              <h2
                id="features-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              >
                The Modern Toolkit for Electronic Design
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                TypeScript and React equipped with expertly-designed web-first
                electronics libraries. Build faster, collaborate better, and
                ship products that matter.
              </p>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-8">
                  <GitBranch className="h-12 w-12 mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold mb-4">Version Control</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Collaborate on GitHub or wherever you keep source code.
                    Utilize industry-standard continuous integration tooling for
                    seamless teamwork.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-8">
                  <Zap className="h-12 w-12 mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold mb-4">Robust Autorouting</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Near-instant local and cloud autorouters to give you a
                    functional circuit board fast. No more manual routing
                    headaches.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200 md:col-span-2 lg:col-span-1">
                <CardContent className="p-8">
                  <Shield className="h-12 w-12 mb-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold mb-4">
                    Export & Manufacture
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Export to industry-standard formats like Gerber, SPICE
                    netlists and more. Ready for manufacturing from day one.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Visual Examples */}
        <section className="w-full py-16" aria-labelledby="examples-heading">
          <div className="container px-4 md:px-6 mx-auto space-y-16">
            <div className="max-w-5xl mx-auto">
              <OptimizedImage
                alt="TSCircuit web-based electronics design editor interface showing circuit creation, component placement, and real-time collaboration features"
                className="w-full rounded-xl shadow-lg"
                src="/assets/editor_example_2.webp"
                height={400}
                width={900}
              />
            </div>

            <FAQ />

            <div className="max-w-5xl mx-auto">
              <OptimizedImage
                alt="Professional electronic schematic diagram created with TSCircuit showing circuit components, connections, and electrical pathways for PCB design"
                className="w-full rounded-xl shadow-lg"
                src="/assets/example_schematic.webp"
                height={400}
                width={900}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="w-full py-16 md:py-24 lg:py-32"
          id="cta"
          aria-labelledby="cta-heading"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2
                id="cta-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              >
                Ready to build electronics with code?
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of engineers who are already using TSCircuit to
                design complex electronics.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  onClick={() => {
                    if (!isLoggedIn) {
                      signIn()
                    } else {
                      navigate("/dashboard")
                    }
                  }}
                  size="lg"
                  className="text-lg px-8 py-6 bg-black text-white hover:bg-gray-800"
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
