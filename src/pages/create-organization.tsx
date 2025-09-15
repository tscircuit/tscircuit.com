import React, { useState } from "react"
import { useLocation } from "wouter"
import { Helmet } from "react-helmet-async"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { useCreateOrgMutation } from "@/hooks/use-create-org-mutation"

interface FormErrors {
  name?: string
}

export const CreateOrganizationPage = () => {
  const [, setLocation] = useLocation()

  const [formData, setFormData] = useState({
    name: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const { mutate: createOrganization, isLoading: isMutating } =
    useCreateOrgMutation({
      onSuccess: (newOrganization) => {
        toast.success(
          `Organization "${newOrganization.name || formData.name}" created successfully!`,
        )
        setLocation(`/${newOrganization.name || formData.name}`)
        setIsLoading(false)
      },
    })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name) {
      newErrors.name = "Organization name is required"
    } else if (formData.name.length > 30) {
      newErrors.name = "Organization name must be less than 30 characters"
    } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.name)) {
      newErrors.name =
        "Organization name can only contain letters, numbers, hyphens, and underscores"
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
    createOrganization(
      { name: formData.name },
      {
        onError: (error: any) => {
          console.error("Failed to create organization:", error)
          toast.error(
            error?.response?.data?.error?.message ||
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
      setErrors({})
    }
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
                id="org-handle"
                type="text"
                placeholder="tscircuit"
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
                This will be the name of your organization on tscircuit.
                <br />
                Your URL will be:{" "}
                <span className="font-mono text-gray-700">
                  tscircuit.com/{formData.name || "orgname"}
                </span>
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
