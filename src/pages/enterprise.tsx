import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { CircuitBoard, Download, Server, Terminal } from "lucide-react"
import { Helmet } from "react-helmet-async"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import {
  enterpriseReleasesUrl,
  useEnterpriseReleases,
} from "@/hooks/use-enterprise-releases"

const features = [
  {
    icon: Server,
    title: "Run inside your environment",
    description:
      "Design and build circuits inside enterprise networks, including environments without internet access. Circuit files and previews stay local.",
  },
  {
    icon: Terminal,
    title: "JavaScript runtime included",
    description:
      "The standalone binary bundles its JavaScript runtime, compiler and local editor. There is no separate Node.js or Bun installation to manage.",
  },
  {
    icon: CircuitBoard,
    title: "Components bundled in",
    description:
      "A built-in component catalog and dependencies let you import supported parts, build boards and preview designs without outbound web requests.",
  },
]

export default function EnterprisePage() {
  const { data: releases } = useEnterpriseReleases()
  const latestRelease = releases?.[0]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>tscircuit Enterprise — Offline circuit design</title>
        <meta
          name="description"
          content="Run tscircuit inside enterprise environments without outbound web requests. Download standalone binaries with a bundled JavaScript runtime and component catalog."
        />
        <link rel="canonical" href="https://tscircuit.com/enterprise" />
      </Helmet>
      <Header />
      <main className="flex-grow mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="max-w-3xl" aria-labelledby="enterprise-title">
          <h1
            id="enterprise-title"
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            tscircuit Enterprise
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            An offline version of tscircuit designed to run inside enterprise
            environments. Write circuits in TypeScript, build boards and use the
            local playground without outbound web requests.
          </p>
          <p className="mt-4 text-base leading-7 text-gray-600">
            A standalone binary includes a bundled JavaScript runtime, component
            catalog and development tools. Download it for Linux, macOS or
            Windows and run it on your own machines.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <a href={latestRelease?.html_url ?? enterpriseReleasesUrl}>
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download latest release
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={enterpriseReleasesUrl}>
                <GitHubLogoIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                All versions on GitHub
              </a>
            </Button>
          </div>
        </section>

        <section
          className="mt-12 grid gap-6 md:grid-cols-3"
          aria-label="Enterprise features"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border border-gray-200 p-6">
              <Icon className="mb-4 h-6 w-6 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {description}
              </p>
            </div>
          ))}
        </section>

        <section
          className="mt-12 !border-t-0"
          aria-labelledby="getting-started-title"
        >
          <h2
            id="getting-started-title"
            className="border-b border-black/10 pb-3 text-2xl font-semibold text-gray-900"
          >
            Getting started
          </h2>
          <p className="mt-3 text-gray-600 leading-7">
            Download the archive for your operating system and architecture,
            extract it, and put <code>tsci</code> (<code>tsci.exe</code> on
            Windows) on your PATH. The JavaScript runtime is already included.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-lg bg-gray-950 p-5 text-sm leading-7 text-gray-100">
            <code>{`tsci --version
tsci import C2040
tsci build my-board.circuit.tsx
tsci dev my-board.circuit.tsx`}</code>
          </pre>
        </section>
      </main>
      <Footer />
    </div>
  )
}
