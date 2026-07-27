import { useEffect, useState } from "react"

const getSettingsSectionFromQuery = <SettingsSection extends string>(
  validSections: readonly SettingsSection[],
  defaultSection: SettingsSection,
): SettingsSection => {
  if (typeof window === "undefined") return defaultSection

  const tab = new URLSearchParams(window.location.search).get("tab")
  return validSections.includes(tab as SettingsSection)
    ? (tab as SettingsSection)
    : defaultSection
}

export const useSettingsSection = <SettingsSection extends string>(
  validSections: readonly SettingsSection[],
  defaultSection: SettingsSection,
) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(() =>
    getSettingsSectionFromQuery(validSections, defaultSection),
  )

  useEffect(() => {
    setActiveSection(getSettingsSectionFromQuery(validSections, defaultSection))
  }, [defaultSection, validSections])

  return [activeSection, setActiveSection] as const
}
