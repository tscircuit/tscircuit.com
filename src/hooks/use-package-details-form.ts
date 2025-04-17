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
}

interface UsePackageDetailsFormProps {
  initialDescription: string
  initialWebsite: string
  initialLicense: string | null
  isDialogOpen: boolean
}

export const usePackageDetailsForm = ({
  initialDescription,
  initialWebsite,
  initialLicense,
  isDialogOpen,
}: UsePackageDetailsFormProps) => {
  const [formData, setFormData] = useState<PackageDetailsForm>({
    description: initialDescription,
    website: initialWebsite,
    license: initialLicense || null,
  })
  const [websiteError, setWebsiteError] = useState<string | null>(null)

  useEffect(() => {
    if (isDialogOpen) {
      setFormData({
        description: initialDescription,
        website: initialWebsite,
        license: initialLicense || null,
      })
      setWebsiteError(null)
    }
  }, [isDialogOpen, initialDescription, initialWebsite, initialLicense])

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

  const hasChanges = useMemo(
    () =>
      formData.description !== initialDescription ||
      formData.website !== initialWebsite ||
      formData.license !== initialLicense,
    [formData, initialDescription, initialWebsite, initialLicense],
  )

  const isFormValid = useMemo(() => !websiteError, [websiteError])

  return {
    formData,
    setFormData,
    websiteError,
    hasLicenseChanged,
    hasChanges,
    isFormValid,
  }
}
