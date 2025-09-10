import React, { useState } from "react"
import { useLocation } from "wouter"
import { Helmet } from "react-helmet-async"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOrganizations } from "@/hooks/use-organizations"
import { Check, X } from "lucide-react"
import toast from "react-hot-toast"
import { Organization } from "fake-snippets-api/lib/db/schema"

interface FormErrors {
  name?: string
  displayName?: string
  description?: string
}

export const CreateOrganizationPage = () => {
  const [, setLocation] = useLocation()
  const { createOrganization, checkNameAvailability } = useOrganizations()

  const [formData, setFormData] = useState<
    Pick<Organization, "github_handle" | "is_personal_org">
  >({
    github_handle: "",
    is_personal_org: true,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null)
  const [checkingName, setCheckingName] = useState(false)

  const checkName = async (name: string) => {
    if (!name || name.length < 3) {
      setNameAvailable(null)
      return
    }

    setCheckingName(true)

    try {
      const isAvailable = await checkNameAvailability(name)
      setNameAvailable(isAvailable)
    } catch (error) {
      console.error("Error checking name availability:", error)
      setNameAvailable(null)
    } finally {
      setCheckingName(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.github_handle) {
      newErrors.name = "Organization name is required"
    } else if (formData.github_handle.length > 30) {
      newErrors.name = "Organization name must be less than 30 characters"
    } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.github_handle)) {
      newErrors.name =
        "Organization name can only contain letters, numbers, hyphens, and underscores"
    } else if (nameAvailable === false) {
      newErrors.name = "This organization name is not available"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const newOrganization = await createOrganization(formData)

      toast.success(
        `Organization "${newOrganization.github_handle}" created successfully!`,
      )

      setLocation(`/${newOrganization.github_handle}`)
    } catch (error) {
      console.error("Failed to create organization:", error)
      toast.error("Failed to create organization. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({ ...prev, github_handle: name }))

    setNameAvailable(null)

    const timeoutId = setTimeout(() => {
      checkName(name)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleCancel = () => {
    setLocation("/dashboard")
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Create Organization - tscircuit</title>
        <meta
          name="description"
          content="Create a new organization to collaborate with others and manage shared projects."
        />
      </Helmet>

      <Header />

      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Set up your organization
          </h1>
          <p className="text-gray-600 text-sm">
            Tell us about your organization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="org-name"
              className="text-sm font-semibold text-gray-900"
            >
              Organization Github Handle <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                spellCheck={false}
                id="org-handle"
                type="text"
                placeholder="tscircuit"
                value={formData.github_handle}
                onChange={handleNameChange}
                className={`h-10 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : nameAvailable === true
                      ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                      : nameAvailable === false
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {checkingName && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                )}
                {nameAvailable === true && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {nameAvailable === false && (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
            {nameAvailable === true && !errors.name && (
              <p className="text-sm text-green-600">✓ This name is available</p>
            )}
            <p className="text-xs text-gray-500">
              This will be the name of your account on tscircuit.
              <br />
              Your URL will be:{" "}
              <span className="font-mono text-gray-700">
                tscircuit.com/{formData.github_handle || "orgname"}
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">
              This organization belongs to:
            </Label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="orgType"
                  checked={formData.is_personal_org}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, is_personal_org: true }))
                  }
                  className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-0 focus:ring-offset-0 checked:bg-blue-600 checked:border-blue-600"
                  style={{ accentColor: "#2563eb" }}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    My personal account
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="orgType"
                  checked={!formData.is_personal_org}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, is_personal_org: false }))
                  }
                  className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-0 focus:ring-offset-0 checked:bg-blue-600 checked:border-blue-600"
                  style={{ accentColor: "#2563eb" }}
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    A business or institution
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              disabled={
                isLoading ||
                nameAvailable === false ||
                checkingName ||
                !formData.github_handle
              }
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating organization...
                </>
              ) : (
                "Create organization"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateOrganizationPage
