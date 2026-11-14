import type { DesktopOperatingSystem } from "@/lib/enterprise-downloads"

// Release assets carry the version in their name
// (tscircuit-desktop-0.1.3-arm64.dmg), so they are matched by their ending.
export const desktopAppDownloads = [
  {
    os: "macOS",
    label: "macOS Apple silicon (.dmg)",
    assetNameEnding: "-arm64.dmg",
  },
  {
    os: "macOS",
    label: "macOS Apple silicon (.zip)",
    assetNameEnding: "-arm64.zip",
  },
] as const satisfies readonly {
  os: DesktopOperatingSystem
  label: string
  assetNameEnding: string
}[]
