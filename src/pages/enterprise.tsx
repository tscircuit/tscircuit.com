import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { CircuitBoard, Download, Server, Terminal } from "lucide-react"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import {
  enterpriseReleasesUrl,
  useEnterpriseReleases,
} from "@/hooks/use-enterprise-releases"
import {
  type DesktopOperatingSystem,
  enterpriseDownloads,
  getDesktopOperatingSystem,
} from "@/lib/enterprise-downloads"

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
  const [operatingSystem, setOperatingSystem] =
    useState<DesktopOperatingSystem | null>(null)

  useEffect(() => {
    setOperatingSystem(
      getDesktopOperatingSystem(navigator.userAgent, navigator.maxTouchPoints),
    )
  }, [])

  const downloads = enterpriseDownloads.flatMap((download) => {
    const asset = latestRelease?.assets.find(
      (asset) => asset.name === download.assetName,
    )
    return asset ? [{ ...download, url: asset.browser_download_url }] : []
  })
  const recommendedDownloads = downloads.filter(
    (download) => !operatingSystem || download.os === operatingSystem,
  )
  const otherDownloads = downloads.filter(
    (download) => operatingSystem && download.os !== operatingSystem,
  )

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
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Install tscircuit with a bundled JavaScript runtime, component
            catalog and development tools. Download the macOS or Windows
            installer, or a standalone archive for Linux.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-gray-900">
            {operatingSystem
              ? `Recommended for ${operatingSystem}`
              : "Choose your download"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Run the macOS or Windows installer to get started. For Linux,
            extract the archive. Choose the architecture for your machine.
          </p>
          <div className="mt-4 flex flex-col flex-wrap gap-3 sm:flex-row">
            {recommendedDownloads.map((download) => (
              <Button
                key={download.assetName}
                asChild
                className="bg-blue-600 hover:bg-blue-700"
              >
                <a href={download.url}>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  {download.label}
                </a>
              </Button>
            ))}
            {recommendedDownloads.length === 0 && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href={latestRelease?.html_url ?? enterpriseReleasesUrl}>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Browse installers on GitHub
                </a>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href={enterpriseReleasesUrl}>
                <GitHubLogoIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                All versions on GitHub
              </a>
            </Button>
          </div>
          {otherDownloads.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-blue-600">
                Downloads for other operating systems
              </summary>
              <ul className="mt-3 space-y-2 text-sm">
                {otherDownloads.map((download) => (
                  <li key={download.assetName}>
                    <a className="text-blue-600 underline" href={download.url}>
                      {download.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
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
      </main>
      <Footer />
    </div>
  )
}
