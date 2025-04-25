import { useState, useEffect, useMemo } from "react"

const isValidUrl = (url: string): boolean => {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

interface PackageDetailsForm {
  description: string
  website: string
  license: string | null
  visibility: string
}

interface UsePackageDetailsFormProps {
  initialDescription: string
  initialWebsite: string
  initialLicense: string | null
  initialVisibility: string
  isDialogOpen: boolean
}

export const usePackageDetailsForm = ({
  initialDescription,
  initialWebsite,
  initialLicense,
  initialVisibility,
  isDialogOpen,
}: UsePackageDetailsFormProps) => {
  const [formData, setFormData] = useState<PackageDetailsForm>({
    description: initialDescription,
    website: initialWebsite,
    license: initialLicense || null,
    visibility: initialVisibility,
  })
  const [websiteError, setWebsiteError] = useState<string | null>(null)

  useEffect(() => {
    if (isDialogOpen) {
      setFormData({
        description: initialDescription,
        website: initialWebsite,
        license: initialLicense || null,
        visibility: initialVisibility,
      })
      setWebsiteError(null)
    }
  }, [
    isDialogOpen,
    initialDescription,
    initialWebsite,
    initialLicense,
    initialVisibility,
  ])

  useEffect(() => {
    if (formData.website && !isValidUrl(formData.website)) {
      setWebsiteError("Please enter a valid URL (e.g., https://tscircuit.com)")
    } else {
      setWebsiteError(null)
    }
  }, [formData.website])

  const hasLicenseChanged = useMemo(
    () => formData.license !== initialLicense,
    [formData.license, initialLicense],
  )

  const hasVisibilityChanged = useMemo(
    () => formData.visibility !== initialVisibility,
    [formData.visibility, initialVisibility],
  )

  const hasChanges = useMemo(
    () =>
      formData.description !== initialDescription ||
      formData.website !== initialWebsite ||
      formData.license !== initialLicense ||
      formData.visibility !== initialVisibility,
    [
      formData,
      initialDescription,
      initialWebsite,
      initialLicense,
      initialVisibility,
    ],
  )

  const isFormValid = useMemo(() => !websiteError, [websiteError])

  return {
    formData,
    setFormData,
    websiteError,
    hasLicenseChanged,
    hasVisibilityChanged,
    hasChanges,
    isFormValid,
  }
}
