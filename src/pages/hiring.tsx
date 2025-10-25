import Footer from "@/components/Footer"
import { Header2 } from "@/components/Header2"
import { Button } from "@/components/ui/button"
import { Helmet } from "react-helmet"

export function HiringPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Helmet>
        <title>Join the tscircuit Team</title>
        <meta
          name="description"
          content="Learn about the tscircuit hiring process and how to join our mission to build AI-compatible electronic design tools."
        />
      </Helmet>
      <Header2 />
      <main className="flex-1 bg-slate-50">
        <section className="border-b bg-blue-600 py-16 text-white">
          <div className="container mx-auto px-4 text-center md:px-8">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-100">
              Careers at tscircuit
            </p>
            <h1 className="mt-4 text-4xl font-bold md:text-5xl">
              We&apos;re building the future of electronic design
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-50 md:text-xl">
              Help us create AI-compatible, accessible tooling that empowers
              anyone to design hardware with code.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/tscircuit/tscircuit"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary" size="lg">
                  Contribute on GitHub
                </Button>
              </a>
              <a href="mailto:hello@tscircuit.com">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  Email Us
                </Button>
              </a>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2 md:px-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                Our Hiring Philosophy
              </h2>
              <p className="mt-4 text-gray-600">
                We are a small, mission-driven team focused on building the best
                foundation for AI-driven circuit design. These principles guide
                how we evaluate new teammates:
              </p>
              <ul className="mt-6 space-y-4 text-gray-700">
                <li className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                  We believe the future of electronic design is AI-compatible
                  and accessible to everyone, and we&apos;re building the best
                  TSX foundation to get there.
                </li>
                <li className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                  We prefer to hire contributors who have shown passion through
                  open-source work, community involvement, or thoughtful
                  feedback on our products.
                </li>
                <li className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                  We are a US-based company with a distributed culture that
                  values clear communication across time zones.
                </li>
                <li className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                  We are venture-backed by top-tier investors who believe in the
                  future of AI-compatible EDA tooling, giving us the resources
                  to tackle ambitious problems.
                </li>
              </ul>
            </div>
            <div className="space-y-8">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  Join the Community
                </h3>
                <p className="mt-4 text-gray-700">
                  Join our Discord community or follow the roadmap in our
                  documentation to see how you can get involved. Whether
                  it&apos;s filing issues, improving docs, or building new
                  examples, contributions of all sizes matter.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://tscircuit.com/join"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline">Join the Discord</Button>
                  </a>
                  <a
                    href="https://docs.tscircuit.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="ghost">Explore the Docs</Button>
                  </a>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  How to Apply
                </h3>
                <p className="mt-4 text-gray-700">
                  Send your resume, portfolio, and a short introduction to{" "}
                  <a
                    href="mailto:inbound-careers-aaaaryksemn5hgfop35xwualca@tscircuit.slack.com"
                    className="font-medium text-blue-600 underline underline-offset-2"
                  >
                    inbound-careers-aaaaryksemn5hgfop35xwualca@tscircuit.slack.com
                  </a>
                  . Your message goes straight into our hiring Slack channel so
                  the whole team can review it quickly.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default HiringPage
