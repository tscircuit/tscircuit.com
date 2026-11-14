import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Bot, CircuitBoard, Download, HardDrive } from "lucide-react"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { OptimizedImage } from "@/components/OptimizedImage"
import { Button } from "@/components/ui/button"
import {
  desktopAppReleasesUrl,
  useDesktopAppReleases,
} from "@/hooks/use-desktop-app-releases"
import { desktopAppDownloads } from "@/lib/desktop-app-downloads"
import {
  type DesktopOperatingSystem,
  getDesktopOperatingSystem,
} from "@/lib/enterprise-downloads"

const features = [
  {
    icon: Bot,
    title: "Works with your agent",
    description:
      "Use the coding agents already installed on your machine, such as Claude Code and Codex. The tscircuit skill is built in, so they know how to design boards.",
  },
  {
    icon: CircuitBoard,
    title: "Every view of the board",
    description:
      "PCB, schematic, 3D, assembly and system diagram views are drawn from the same TypeScript files, and refresh when your agent edits them.",
  },
  {
    icon: HardDrive,
    title: "Your files, on your machine",
    description:
      "Projects are ordinary folders of tscircuit code. The circuit viewer is part of the app, so there is no dev server to start.",
  },
]

export default function DesktopPage() {
  const { data: releases } = useDesktopAppReleases()
  const latestRelease = releases?.[0]
  const [operatingSystem, setOperatingSystem] =
    useState<DesktopOperatingSystem | null>(null)

  useEffect(() => {
    setOperatingSystem(
      getDesktopOperatingSystem(navigator.userAgent, navigator.maxTouchPoints),
    )
  }, [])

  const downloads = desktopAppDownloads.flatMap((download) => {
    const asset = latestRelease?.assets.find((asset) =>
      asset.name.endsWith(download.assetNameEnding),
    )
    return asset ? [{ ...download, url: asset.browser_download_url }] : []
  })
  const [primaryDownload, ...otherDownloads] = downloads
  // Only a macOS build exists so far. Say so to everyone else instead of
  // offering them an installer they cannot run.
  const hasBuildForVisitor = !operatingSystem || operatingSystem === "macOS"

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>tscircuit Desktop — Design electronics with AI agents</title>
        <meta
          name="description"
          content="A desktop app for designing electronics with AI agents. Your agent writes the board in tscircuit while the PCB, schematic and 3D views update beside the conversation."
        />
        <link rel="canonical" href="https://tscircuit.com/desktop" />
      </Helmet>
      <Header />
      <main className="flex-grow mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="max-w-3xl" aria-labelledby="desktop-title">
          <h1
            id="desktop-title"
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            tscircuit Desktop
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A desktop app for designing electronics with AI agents. Describe the
            board you want, and your agent writes it in tscircuit while the PCB,
            schematic and 3D model update beside the conversation.
          </p>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            tscircuit Desktop is open source and built on T3 Code. It runs the
            agents you already use and keeps your designs as TypeScript files in
            your own project folders.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-gray-900">
            {hasBuildForVisitor
              ? "Download for macOS"
              : `Not available for ${operatingSystem} yet`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {hasBuildForVisitor
              ? "For Macs with Apple silicon. The app is not signed by Apple yet: the first time you open it, confirm it under System Settings → Privacy & Security → Open Anyway."
              : "tscircuit Desktop is built for Macs with Apple silicon so far. The macOS download is below if you have one."}
          </p>
          <div className="mt-4 flex flex-col flex-wrap gap-3 sm:flex-row">
            <Button
              asChild
              className={
                hasBuildForVisitor ? "bg-blue-600 hover:bg-blue-700" : undefined
              }
              variant={hasBuildForVisitor ? "default" : "outline"}
            >
              <a
                href={
                  primaryDownload?.url ??
                  latestRelease?.html_url ??
                  desktopAppReleasesUrl
                }
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {primaryDownload?.label ?? "Browse downloads on GitHub"}
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={desktopAppReleasesUrl}>
                <GitHubLogoIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                All versions on GitHub
              </a>
            </Button>
          </div>
          {otherDownloads.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-blue-600">
                Other download formats
              </summary>
              <ul className="mt-3 space-y-2 text-sm">
                {otherDownloads.map((download) => (
                  <li key={download.assetNameEnding}>
                    <a className="text-blue-600 underline" href={download.url}>
                      {download.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <figure className="mt-12">
          <OptimizedImage
            src="/assets/desktop_app_pcb_view.webp"
            alt="tscircuit Desktop with the rp2040-motor-controller project open: a new thread with the agent beside the PCB view of the board"
            width={2400}
            height={1508}
            className="w-full rounded-lg border border-gray-200 shadow-sm"
          />
          <figcaption className="mt-3 text-sm leading-6 text-gray-600">
            The PCB view of{" "}
            <a
              className="text-blue-600 underline"
              href="/imrishabh18/rp2040-motor-controller"
            >
              imrishabh18/rp2040-motor-controller
            </a>
            , a USB-PD stepper motor controller, open in tscircuit Desktop.
          </figcaption>
        </figure>

        <section
          className="mt-12 grid gap-6 md:grid-cols-3"
          aria-label="Desktop app features"
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
