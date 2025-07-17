import { useEffect, useMemo, useState } from "react"

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
  defaultView: string
  unscopedPackageName: string
}

interface UsePackageDetailsFormProps {
  initialDescription: string
  initialWebsite: string
  initialLicense: string | null
  initialVisibility: string
  initialDefaultView: string
  initialUnscopedPackageName: string
  isDialogOpen: boolean
}

export const usePackageDetailsForm = ({
  initialDescription,
  initialWebsite,
  initialLicense,
  initialVisibility,
  initialDefaultView,
  initialUnscopedPackageName,
  isDialogOpen,
}: UsePackageDetailsFormProps) => {
  const [formData, setFormData] = useState<PackageDetailsForm>({
    description: initialDescription,
    website: initialWebsite,
    license: initialLicense || null,
    visibility: initialVisibility,
    defaultView: initialDefaultView,
    unscopedPackageName: initialUnscopedPackageName,
  })
  const [websiteError, setWebsiteError] = useState<string | null>(null)

  useEffect(() => {
    if (isDialogOpen) {
      setFormData({
        description: initialDescription,
        website: initialWebsite,
        license: initialLicense || null,
        visibility: initialVisibility,
        defaultView: initialDefaultView,
        unscopedPackageName: initialUnscopedPackageName,
      })
      setWebsiteError(null)
    }
  }, [
    isDialogOpen,
    initialDescription,
    initialWebsite,
    initialLicense,
    initialVisibility,
    initialDefaultView,
    initialUnscopedPackageName,
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

  const hasDefaultViewChanged = useMemo(
    () => formData.defaultView !== initialDefaultView,
    [formData.defaultView, initialDefaultView],
  )

  const hasChanges = useMemo(
    () =>
      formData.description !== initialDescription ||
      formData.website !== initialWebsite ||
      formData.license !== initialLicense ||
      formData.visibility !== initialVisibility ||
      formData.defaultView !== initialDefaultView ||
      formData.unscopedPackageName !== initialUnscopedPackageName,
    [
      formData,
      initialDescription,
      initialWebsite,
      initialLicense,
      initialVisibility,
      initialDefaultView,
      initialUnscopedPackageName,
    ],
  )

  const isFormValid = useMemo(() => !websiteError, [websiteError])

  return {
    formData,
    setFormData,
    websiteError,
    hasLicenseChanged,
    hasVisibilityChanged,
    hasDefaultViewChanged,
    hasChanges,
    isFormValid,
  }
}
