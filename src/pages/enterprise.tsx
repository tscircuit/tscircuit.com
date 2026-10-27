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
      "Work with local circuit files and a local preview server in your own environment.",
  },
  {
    icon: Terminal,
    title: "JavaScript runtime included",
    description:
      "The standalone binary bundles its JavaScript runtime, compiler and local editor. There is no separate Node.js or Bun installation to manage.",
  },
  {
    icon: CircuitBoard,
    title: "Viewer assets included",
    description:
      "The local viewer includes its JavaScript assets. Some parts, routing and other features still use remote services.",
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
          content="Download the standalone tscircuit CLI with a bundled JavaScript runtime and local viewer assets."
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
            Run tscircuit on your own machines with a bundled JavaScript runtime
            and local development tools.
          </p>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Download a standalone binary for Linux, macOS or Windows. Some
            workflows still require network access; test your circuit and tools
            in your target environment before relying on offline operation.
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
            Choose a release for your operating system and architecture. Use the
            macOS or Windows installer, or extract the Linux archive. Current
            releases are development prereleases. Open a new terminal and check
            your version; the JavaScript runtime is already included.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-lg bg-gray-950 p-5 text-sm leading-7 text-gray-100">
            <code>{`tsci --version
tsci build my-board.circuit.tsx
tsci dev my-board.circuit.tsx`}</code>
          </pre>
          <p className="mt-4 text-gray-600 leading-7">
            Remote part imports, routing, registry operations and other features
            may require network access. See the{" "}
            <a
              className="text-blue-600 underline"
              href="https://docs.tscircuit.com/guides/running-tscircuit/standalone-binary"
            >
              standalone installation and usage guide
            </a>{" "}
            for platform details and offline limitations.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
