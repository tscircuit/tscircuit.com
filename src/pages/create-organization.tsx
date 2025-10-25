import React, { useState } from "react"
import { useLocation } from "wouter"
import { Helmet } from "react-helmet-async"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { useCreateOrgMutation } from "@/hooks/use-create-org-mutation"
import { normalizeName } from "@/lib/utils/normalizeName"

interface FormErrors {
  name?: string
  display_name?: string
}

export const CreateOrganizationPage = () => {
  const [, setLocation] = useLocation()

  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const { mutate: createOrganization, isLoading: isMutating } =
    useCreateOrgMutation({
      onSuccess: (newOrganization) => {
        toast.success(
          `Organization "${newOrganization.display_name || newOrganization.name}" created successfully!`,
        )
        setLocation(`/${newOrganization.name}`)
        setIsLoading(false)
      },
    })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name) {
      newErrors.name = "Organization name is required"
    } else if (formData.name.length > 40) {
      newErrors.name = "Organization name must be less than 40 characters"
    } else if (formData.name.length < 5) {
      newErrors.name = "Organization name must be at least 5 characters"
    }

    const normalizedName = normalizeName(formData.name)
    if (normalizedName.length < 5) {
      newErrors.name =
        "Organization name must be at least 5 characters after normalization"
    }

    if (formData.display_name) {
      if (formData.display_name.length > 40) {
        newErrors.display_name = "Display name must be less than 40 characters"
      } else if (formData.display_name.length < 5) {
        newErrors.display_name = "Display name must be at least 5 characters"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const normalizedName = normalizeName(formData.name)
    const displayName = formData.display_name || formData.name

    setIsLoading(true)
    createOrganization(
      {
        name: normalizedName,
        display_name: displayName,
      },
      {
        onError: (error: any) => {
          console.error("Failed to create organization:", error)
          toast.error(
            error?.response?.data?.error?.message ||
              error?.data?.error?.message ||
              "Failed to create organization. Please try again.",
          )
          setIsLoading(false)
        },
      },
    )
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({ ...prev, name }))
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const display_name = e.target.value
    setFormData((prev) => ({ ...prev, display_name }))
    if (errors.display_name) {
      setErrors((prev) => ({ ...prev, display_name: undefined }))
    }
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

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
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
                Organization Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                spellCheck={false}
                id="org-name"
                type="text"
                placeholder="My Organization"
                value={formData.name}
                onChange={handleNameChange}
                className={`h-10 sm:h-11 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                disabled={isLoading || isMutating}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
              <p className="text-xs text-gray-500">
                This will be your URL.
                <br />
                <span className="font-mono text-gray-700">
                  tscircuit.com/
                  {normalizeName(formData.name) || "my-organization"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="org-display-name"
                className="text-sm font-semibold text-gray-900"
              >
                Display Name
              </Label>
              <Input
                spellCheck={false}
                id="org-display-name"
                type="text"
                placeholder="My Organization (optional)"
                value={formData.display_name}
                onChange={handleDisplayNameChange}
                className={`h-10 sm:h-11 ${
                  errors.display_name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                disabled={isLoading || isMutating}
              />
              {errors.display_name && (
                <p className="text-sm text-red-600">{errors.display_name}</p>
              )}
              <p className="text-xs text-gray-500">
                Optional. If not provided, your organization name will be used
                as the display name.
              </p>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading || isMutating || !formData.name}
                className="w-full h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base"
              >
                {isLoading || isMutating ? (
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
    </div>
  )
}

export default CreateOrganizationPage
