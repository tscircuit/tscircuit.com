import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CircuitBoard,
  Cpu,
  Layers,
  CloudLightningIcon as Lightning,
  Maximize2,
  Zap,
} from "lucide-react"
import { Link } from "wouter"
import { Header2 } from "@/components/Header2"
import Footer from "@/components/Footer"
import editorExampleImage1 from "@/assets/editor_example_1.png"
import editorExampleImage1MoreSquare from "@/assets/editor_example_1_more_square.png"
import editorExampleImage2 from "@/assets/editor_example_2.png"
import schematicExampleImage from "@/assets/schematic_example.png"

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
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
                      {/* Transform your electronic design workflow with AI-powered
                      tools. Design electronics faster, smarter, and more
                      efficiently than ever before. */}
                      Build electronics with code, AI, and drag'n'drop tools.
                      <br />
                      Render code into schematics, PCBs, 3D, fabrication files,
                      and more.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button size="lg">Get Started</Button>
                    <Button size="lg" variant="outline">
                      Open Online Example
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
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
                  </div>
                </div>
                <img
                  alt="Product preview"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
                  height="310"
                  src={editorExampleImage1MoreSquare}
                  width="550"
                />
              </div>
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
          id="features"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Powerful Features for Modern Design
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our platform combines cutting-edge technology with intuitive
                  design tools to streamline your workflow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <Lightning className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold">Real-time Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Work together with your team in real-time. See changes
                    instantly and collaborate seamlessly.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Cpu className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold">AI-Powered Routing</h3>
                  <p className="text-sm text-muted-foreground">
                    Let our AI handle complex routing tasks. Optimize your board
                    layout automatically.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Maximize2 className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold">Advanced Simulation</h3>
                  <p className="text-sm text-muted-foreground">
                    Test your designs before production with our advanced
                    simulation tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="testimonials">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Trusted by Industry Leaders
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  See what our users are saying about tscircuit.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4 italic">
                    "tscircuit has revolutionized how we approach electronic
                    design. The AI-powered features have cut our design time in
                    half."
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      alt="Avatar"
                      className="rounded-full"
                      height="40"
                      src="/placeholder.svg?height=40&width=40"
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width="40"
                    />
                    <div>
                      <p className="text-sm font-medium">Sarah Chen</p>
                      <p className="text-sm text-muted-foreground">
                        Lead Engineer, TechCorp
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="mb-4 italic">
                    "The collaboration features are game-changing. Our
                    distributed team can now work together seamlessly on complex
                    designs."
                  </p>
                  <div className="flex items-center space-x-4">
                    <img
                      alt="Avatar"
                      className="rounded-full"
                      height="40"
                      src="/placeholder.svg?height=40&width=40"
                      style={{
                        aspectRatio: "40/40",
                        objectFit: "cover",
                      }}
                      width="40"
                    />
                    <div>
                      <p className="text-sm font-medium">Michael Rodriguez</p>
                      <p className="text-sm text-muted-foreground">
                        CTO, InnovateTech
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
          id="pricing"
        >
          <div className="container px-4 md:px-6  mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Simple, Transparent Pricing
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Choose the plan that's right for you or your team.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <p className="mt-2 text-muted-foreground">
                    Perfect for individuals
                  </p>
                  <div className="mt-4 text-4xl font-bold">$29</div>
                  <p className="text-sm text-muted-foreground">/month</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      Basic features
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />1 user
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />5 projects
                    </li>
                  </ul>
                  <Button className="mt-6 w-full">Get Started</Button>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <p className="mt-2 text-muted-foreground">
                    Perfect for small teams
                  </p>
                  <div className="mt-4 text-4xl font-bold">$99</div>
                  <p className="text-sm text-muted-foreground">/month</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      All Starter features
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      Up to 5 users
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      20 projects
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      Advanced collaboration
                    </li>
                  </ul>
                  <Button className="mt-6 w-full">Get Started</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="mt-2 text-muted-foreground">
                    Custom solutions for large teams
                  </p>
                  <div className="mt-4 text-4xl font-bold">Custom</div>
                  <p className="text-sm text-muted-foreground">
                    Contact us for pricing
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      All Pro features
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      Unlimited users
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      Unlimited projects
                    </li>
                    <li className="flex items-center">
                      <Lightning className="mr-2 h-4 w-4" />
                      24/7 support
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" variant="outline">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32" id="faq">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Frequently Asked Questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Got questions? We've got answers.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-4 py-12">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How does the AI-powered routing work?
                  </AccordionTrigger>
                  <AccordionContent>
                    Our AI routing system uses advanced algorithms to
                    automatically optimize circuit board layouts. It considers
                    factors like signal integrity, thermal management, and
                    manufacturing constraints to produce the most efficient
                    routing possible.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Can I import designs from other software?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, tscircuit supports importing designs from major EDA
                    software formats. We currently support Gerber, ODB++, and
                    IPC-2581 formats, with more coming soon.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    What kind of support do you offer?
                  </AccordionTrigger>
                  <AccordionContent>
                    We offer email support for all plans, with priority support
                    for Pro plans and 24/7 dedicated support for Enterprise
                    customers. Our documentation is comprehensive and regularly
                    updated.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, we take security seriously. All data is encrypted at
                    rest and in transit. We use industry-standard security
                    practices and regularly undergo security audits.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary" id="cta">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-primary-foreground">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Transform Your Design Workflow?
                </h2>
                <p className="max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Join thousands of engineers who are already using tscircuit to
                  design the future.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                >
                  Schedule Demo
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
