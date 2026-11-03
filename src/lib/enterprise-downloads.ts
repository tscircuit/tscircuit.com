export type DesktopOperatingSystem = "macOS" | "Windows" | "Linux"

export const enterpriseDownloads = [
  {
    os: "macOS",
    label: "macOS Apple silicon (.pkg)",
    assetName: "tscircuit-standalone-macos-arm64.pkg",
  },
  {
    os: "macOS",
    label: "macOS Intel (.pkg)",
    assetName: "tscircuit-standalone-macos-x64.pkg",
  },
  {
    os: "Windows",
    label: "Windows x64 installer (.exe)",
    assetName: "tscircuit-standalone-windows-x64-setup.exe",
  },
  {
    os: "Linux",
    label: "Linux x64 archive (.tar.gz)",
    assetName: "tscircuit-standalone-linux-x64.tar.gz",
  },
  {
    os: "Linux",
    label: "Linux ARM64 archive (.tar.gz)",
    assetName: "tscircuit-standalone-linux-arm64.tar.gz",
  },
] as const

export function getDesktopOperatingSystem(
  userAgent: string,
  maxTouchPoints = 0,
): DesktopOperatingSystem | null {
  // iPadOS can use a desktop Mac user agent. Mobile devices and ChromeOS
  // should offer all downloads instead of recommending a desktop installer.
  if (
    /Android|iPhone|iPad|iPod|CrOS|Windows Phone/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)
  ) {
    return null
  }
  if (/Windows NT/i.test(userAgent)) return "Windows"
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "macOS"
  if (/Linux/i.test(userAgent)) return "Linux"
  return null
}
