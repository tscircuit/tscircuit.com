type LicenseType = "MIT" | "Apache-2.0" | "BSD-3-Clause" | "GPL-3.0" | "unset"

const licenseKeyPhrases = {
  MIT: [
    "mit license",
    "permission is hereby granted, free of charge",
    "without restriction",
    "furnished to do so",
    'the software is provided "as is"',
    "without warranty of any kind",
    "copyright (c)",
  ],
  "Apache-2.0": [
    "apache license",
    "version 2.0",
    "licensed under the apache license",
    "http://www.apache.org/licenses/",
    "subject to the following conditions",
    "unless required by applicable law",
  ],
  "BSD-3-Clause": [
    "redistribution and use in source and binary forms",
    "redistributions of source code must retain",
    "redistributions in binary form must reproduce",
    "neither the name",
    "nor the names of its contributors may be used",
  ],
  "GPL-3.0": [
    "gnu general public license",
    "version 3",
    "free software foundation",
    "either version 3 of the license",
    "everyone is permitted to copy and distribute",
    "gnu general public license for more details",
  ],
}

// Currently using this because latest_license is not fully supported yet
export const getLicenseFromLicenseContent = (
  licenseContent: string,
): LicenseType => {
  // Normalize the license content by removing extra whitespace and converting to lowercase
  const normalizedContent = licenseContent
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()

  let bestMatch: { type: LicenseType; ratio: number } = {
    type: "unset",
    ratio: 0,
  }
  const matchThreshold = 0.7

  // Check each license type
  for (const [licenseType, phrases] of Object.entries(licenseKeyPhrases)) {
    const matchedPhrases = phrases.filter((phrase) =>
      normalizedContent.includes(phrase.toLowerCase()),
    )
    const matchRatio = matchedPhrases.length / phrases.length

    if (matchRatio >= matchThreshold && matchRatio > bestMatch.ratio) {
      bestMatch = { type: licenseType as LicenseType, ratio: matchRatio }
    }
  }

  return bestMatch.type
}
