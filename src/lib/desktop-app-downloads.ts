import type { DesktopOperatingSystem } from "@/lib/enterprise-downloads"

// Release assets carry the version in their name
// (tscircuit-desktop-0.1.3-arm64.dmg), so they are matched by their ending.
// The first entry for an operating system is its installer; the page offers
// the rest as other formats. An entry whose asset is not in the latest release
// is left off the page, so the Linux one appears once a Linux build is
// published.
export const desktopAppDownloads = [
  {
    os: "macOS",
    label: "macOS Apple silicon (.dmg)",
    assetNameEnding: "-arm64.dmg",
    requirement: "For Macs with Apple silicon.",
  },
  {
    os: "macOS",
    label: "macOS Apple silicon (.zip)",
    assetNameEnding: "-arm64.zip",
    requirement: "For Macs with Apple silicon.",
  },
  {
    os: "Windows",
    label: "Windows x64 installer (.exe)",
    assetNameEnding: "-x64.exe",
    requirement: "For Windows PCs with an x64 processor.",
  },
  {
    os: "Linux",
    label: "Linux x64 (.AppImage)",
    assetNameEnding: "-x86_64.AppImage",
    requirement: "For Linux PCs with an x64 processor.",
  },
] as const satisfies readonly {
  os: DesktopOperatingSystem
  label: string
  assetNameEnding: string
  requirement: string
}[]
