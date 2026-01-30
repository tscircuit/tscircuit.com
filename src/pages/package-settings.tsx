import { useState, useEffect, useMemo } from "react"
import { useParams, useLocation, Redirect, Link } from "wouter"
import { Helmet } from "react-helmet-async"
import { useMutation, useQueryClient } from "react-query"
import { normalizeName } from "@/lib/utils/normalizeName"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAxios } from "@/hooks/use-axios"
import { useCurrentPackageInfo } from "@/hooks/use-current-package-info"
import { useCurrentPackageRelease } from "@/hooks/use-current-package-release"
import { useDeletePackage } from "@/hooks/use-delete-package"
import { useListUserOrgs } from "@/hooks/use-list-user-orgs"
import { useOrganization } from "@/hooks/use-organization"
import { useGetOrgMember } from "@/hooks/use-get-org-member"
import { usePackageFiles, usePackageFileById } from "@/hooks/use-package-files"
import { getLicenseContent } from "@/components/ViewPackagePage/utils/get-license-content"
import { getLicenseFromLicenseContent } from "@/lib/getLicenseFromLicenseContent"
import { GitHubRepositorySelector } from "@/components/dialogs/GitHubRepositorySelector"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import NotFoundPage from "@/pages/404"
import { FullPageLoader } from "@/App"
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Trash2,
  ArrowRightLeft,
  Search,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SettingsSection = "general" | "domains" | "github" | "danger"

const navItems: { id: SettingsSection; label: string }[] = [
  { id: "general", label: "General" },
  { id: "domains", label: "Domains" },
  { id: "github", label: "GitHub" },
  { id: "danger", label: "Danger Zone" },
]

function SettingCard({
  title,
  description,
  children,
  footer,
  danger,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className={cn(
        "border rounded-lg",
        danger ? "border-red-200" : "border-gray-200",
      )}
    >
      <div className="p-4 sm:p-6">
        <h3
          className={cn(
            "text-sm sm:text-base font-semibold mb-1",
            danger ? "text-red-600" : "text-gray-900",
          )}
        >
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">{description}</p>
        {children}
      </div>
      {footer && (
        <div
          className={cn(
            "px-4 sm:px-6 py-3 border-t flex items-center justify-end",
            danger
              ? "bg-red-50/30 border-red-100"
              : "bg-gray-50/50 border-gray-100",
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

export default function PackageSettingsPage() {
  const { author, packageName } = useParams()
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const axios = useAxios()
  const qc = useQueryClient()
  const session = useGlobalStore((s) => s.session)

  const [activeSection, setActiveSection] = useState<SettingsSection>("general")

  const {
    packageInfo,
    isLoading: isLoadingPackage,
    error: packageError,
  } = useCurrentPackageInfo()
  const { packageRelease } = useCurrentPackageRelease()
  const { data: organizations = [] } = useListUserOrgs()

  const { data: releaseFiles } = usePackageFiles(
    packageInfo?.latest_package_release_id,
  )
  const licenseFileId = useMemo(() => {
    return (
      releaseFiles?.find((f) => f.file_path === "LICENSE")?.package_file_id ||
      null
    )
  }, [releaseFiles])
  const { data: licenseFileMeta } = usePackageFileById(licenseFileId)

  const currentLicense = useMemo(() => {
    if (packageInfo?.latest_license) return packageInfo.latest_license
    if (licenseFileMeta?.content_text)
      return getLicenseFromLicenseContent(licenseFileMeta.content_text)
    return null
  }, [licenseFileMeta, packageInfo?.latest_license])

  const { organization } = useOrganization(
    packageInfo?.owner_org_id
      ? { orgId: String(packageInfo.owner_org_id) }
      : packageInfo?.owner_github_username
        ? { github_handle: packageInfo.owner_github_username }
        : {},
  )

  const isOwner =
    session?.github_username === packageInfo?.owner_github_username
  const currentAccountId = session?.account_id
  const { data: orgMember } = useGetOrgMember({
    orgId: packageInfo?.owner_org_id,
    accountId: currentAccountId,
  })

  const canManagePackage = isOwner || Boolean(orgMember)

  const [formData, setFormData] = useState({
    unscopedPackageName: "",
    description: "",
    website: "",
    license: null as string | null,
    visibility: "public",
    defaultView: "files",
    githubRepoFullName: null as string | null,
    allowPrPreviews: false,
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [targetOrgId, setTargetOrgId] = useState("")
  const [websiteError, setWebsiteError] = useState<string | null>(null)
  const [savingField, setSavingField] = useState<string | null>(null)

  const normalizedPackageName = useMemo(() => {
    if (!formData.unscopedPackageName.trim()) return ""
    return normalizeName(formData.unscopedPackageName)
  }, [formData.unscopedPackageName])

  const availableOrgs = useMemo(
    () =>
      organizations.filter((org) => org.org_id !== packageInfo?.owner_org_id),
    [organizations, packageInfo?.owner_org_id],
  )

  const selectedTransferOrg = useMemo(
    () => availableOrgs.find((org) => org.org_id === targetOrgId),
    [availableOrgs, targetOrgId],
  )

  const initialFormData = useMemo(() => {
    if (!packageInfo || !packageRelease) return null
    return {
      unscopedPackageName: packageInfo.unscoped_name || "",
      description: packageInfo.description || packageInfo.ai_description || "",
      website:
        packageRelease.package_release_website_url || packageInfo.website || "",
      license: currentLicense || null,
      visibility: packageInfo.is_private ? "private" : "public",
      defaultView: packageInfo.default_view || "files",
      githubRepoFullName: packageInfo.github_repo_full_name || null,
      allowPrPreviews: packageInfo.allow_pr_previews ?? false,
    }
  }, [packageInfo, packageRelease, currentLicense])

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData)
    }
  }, [initialFormData])

  useEffect(() => {
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website)
        setWebsiteError(null)
      } catch {
        setWebsiteError("Please enter a valid URL")
      }
    } else {
      setWebsiteError(null)
    }
  }, [formData.website])

  const hasLicenseChanged = formData.license !== currentLicense
  const isFormValid = !websiteError && normalizedPackageName.length > 0

  const deletePackageMutation = useDeletePackage({
    onSuccess: async () => {
      await qc.invalidateQueries(["packages"])
      navigate("/dashboard")
    },
  })

  const transferPackageMutation = useMutation({
    mutationFn: async () => {
      if (!targetOrgId || !packageInfo)
        throw new Error("Please select an organization to transfer to.")
      const response = await axios.post("/packages/transfer", {
        package_id: packageInfo.package_id,
        target_org_id: targetOrgId,
      })
      if (response.status !== 200) throw new Error("Failed to transfer package")
      return response.data.package
    },
    onSuccess: async (pkg) => {
      await qc.invalidateQueries(["packages"])
      setShowTransferDialog(false)
      toast({
        title: "Package transferred",
        description: "The package has been transferred successfully.",
      })
      if (pkg.name) navigate(`/${pkg.name}/settings`)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error?.data?.error?.message ||
          error?.message ||
          "Failed to transfer package.",
        variant: "destructive",
      })
    },
  })

  const saveField = async (fieldName: string) => {
    if (!isFormValid || !packageInfo) return
    setSavingField(fieldName)

    try {
      const packageAuthor = packageInfo.name.split("/")[0]

      if (fieldName === "license" && hasLicenseChanged && packageRelease) {
        await axios.post("/package_releases/update", {
          package_id: packageInfo.package_id,
          package_release_id: packageRelease.package_release_id,
          license: formData.license ?? "unset",
        })

        const filesRes = await axios.get("/package_files/list", {
          params: {
            package_name_with_version: `${packageAuthor}/${normalizedPackageName}`,
          },
        })
        const packageFiles: string[] =
          filesRes.status === 200
            ? filesRes.data.package_files.map((x: any) => x.file_path)
            : []
        const licenseContent = getLicenseContent(
          formData.license ?? "",
          packageAuthor,
        )

        if (packageFiles.includes("LICENSE") && !licenseContent) {
          await axios.post("/package_files/delete", {
            package_name_with_version: `${packageAuthor}/${normalizedPackageName}`,
            file_path: "LICENSE",
          })
        }
        if (licenseContent) {
          await axios.post("/package_files/create_or_update", {
            package_name_with_version: `${packageAuthor}/${normalizedPackageName}`,
            file_path: "LICENSE",
            content_text: licenseContent,
          })
        }
      }

      const updatePayload: any = { package_id: packageInfo.package_id }

      if (
        fieldName === "name" &&
        normalizedPackageName !== packageInfo.unscoped_name
      ) {
        updatePayload.name = normalizedPackageName
      }
      if (fieldName === "description")
        updatePayload.description = formData.description.trim()
      if (fieldName === "website")
        updatePayload.website = formData.website.trim()
      if (fieldName === "visibility")
        updatePayload.is_private = formData.visibility === "private"
      if (fieldName === "defaultView")
        updatePayload.default_view = formData.defaultView
      if (fieldName === "github") {
        updatePayload.github_repo_full_name =
          formData.githubRepoFullName === "unlink//repo"
            ? null
            : formData.githubRepoFullName
      }

      if (Object.keys(updatePayload).length > 1) {
        const response = await axios.post("/packages/update", updatePayload)
        if (response.status !== 200) throw new Error("Failed to update")
      }

      qc.invalidateQueries(["packages"])
      qc.invalidateQueries(["packageFile"])
      qc.invalidateQueries(["packageFiles"])
      qc.invalidateQueries(["packageRelease"])
      toast({ title: "Saved", description: "Setting updated successfully." })

      if (
        fieldName === "name" &&
        normalizedPackageName !== packageInfo.unscoped_name
      ) {
        navigate(`/${packageAuthor}/${normalizedPackageName}/settings`)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.data?.error?.message || error?.message || "Failed to save.",
        variant: "destructive",
      })
    } finally {
      setSavingField(null)
    }
  }

  if (isLoadingPackage) return <FullPageLoader />
  if (packageError || !packageInfo) return <NotFoundPage />
  if (!session) return <Redirect to="/login" />

  const pageTitle = `${author}/${packageName} Settings - tscircuit`
  const packageSlug = `${author}/${packageName}`

  if (!canManagePackage) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-50 flex items-center justify-center mb-4 sm:mb-6">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            </div>
            <h1 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              Access denied
            </h1>
            <p className="text-gray-500 mb-6 sm:mb-8 text-sm">
              You don't have permission to manage this package.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/${packageSlug}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to package
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const hasNameChanged =
    initialFormData &&
    formData.unscopedPackageName !== initialFormData.unscopedPackageName
  const hasDescriptionChanged =
    initialFormData && formData.description !== initialFormData.description
  const hasWebsiteChanged =
    initialFormData && formData.website !== initialFormData.website
  const hasVisibilityChanged =
    initialFormData && formData.visibility !== initialFormData.visibility
  const hasLicenseFieldChanged =
    initialFormData && formData.license !== initialFormData.license
  const hasDefaultViewChanged =
    initialFormData && formData.defaultView !== initialFormData.defaultView
  const hasGithubChanged =
    initialFormData &&
    formData.githubRepoFullName !== initialFormData.githubRepoFullName

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Package Settings
          </h1>
          <Link
            href={`/${packageSlug}`}
            className="inline-flex items-center text-xs sm:text-sm text-gray-500 mt-1"
          >
            <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
            Go to {packageSlug}
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-12">
          <aside className="w-full lg:w-48 shrink-0">
            <nav className="lg:sticky lg:top-4">
              <ul className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-md font-normal text-left transition-all duration-150 whitespace-nowrap",
                        activeSection === item.id
                          ? item.id === "danger"
                            ? "bg-red-50 text-red-700 font-[500]"
                            : "bg-gray-100 text-gray-900 font-[500]"
                          : item.id === "danger"
                            ? "text-red-600 hover:bg-red-50"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="flex-1 min-w-0 space-y-4 sm:space-y-6">
            {activeSection === "general" && (
              <>
                <SettingCard
                  title="Package Name"
                  description="Used to identify your package in URLs and when installing via the CLI."
                  footer={
                    <Button
                      size="sm"
                      onClick={() => saveField("name")}
                      disabled={
                        !hasNameChanged ||
                        savingField === "name" ||
                        !normalizedPackageName
                      }
                    >
                      {savingField === "name" && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      Save
                    </Button>
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0">
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-50 border border-gray-200 sm:border-r-0 rounded-t-md sm:rounded-t-none sm:rounded-l-md px-3 py-2 truncate">
                      tscircuit.com/{author}/
                    </span>
                    <Input
                      value={formData.unscopedPackageName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          unscopedPackageName: e.target.value,
                        }))
                      }
                      className="rounded-t-none sm:rounded-t-md sm:rounded-l-none flex-1 text-sm"
                      autoComplete="off"
                    />
                  </div>
                  {formData.unscopedPackageName.trim() &&
                    normalizedPackageName !==
                      formData.unscopedPackageName.trim() &&
                    normalizedPackageName && (
                      <p className="text-xs text-gray-500 mt-2">
                        Will be normalized to: {normalizedPackageName}
                      </p>
                    )}
                </SettingCard>

                <SettingCard
                  title="Description"
                  description="A short description of what your package does. This appears on your package page and in search results."
                  footer={
                    <Button
                      size="sm"
                      onClick={() => saveField("description")}
                      disabled={
                        !hasDescriptionChanged || savingField === "description"
                      }
                    >
                      {savingField === "description" && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      Save
                    </Button>
                  }
                >
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter a description for your package"
                    className="w-full min-h-[80px] sm:min-h-[100px] resize-none text-sm"
                    spellCheck={false}
                  />
                </SettingCard>

                <SettingCard
                  title="Website"
                  description="A link to your package's homepage, documentation, or repository."
                  footer={
                    <Button
                      size="sm"
                      onClick={() => saveField("website")}
                      disabled={
                        !hasWebsiteChanged ||
                        savingField === "website" ||
                        !!websiteError
                      }
                    >
                      {savingField === "website" && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      Save
                    </Button>
                  }
                >
                  <Input
                    value={formData.website}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    placeholder="https://example.com"
                    className={cn(
                      "w-full sm:max-w-md text-sm",
                      websiteError && "border-red-300",
                    )}
                    autoComplete="off"
                  />
                  {websiteError && (
                    <p className="text-xs text-red-500 mt-1.5">
                      {websiteError}
                    </p>
                  )}
                </SettingCard>

                <SettingCard
                  title="Visibility"
                  description="Control who can view and access your package. Private packages are only visible to you and your organization members."
                  footer={
                    <Button
                      size="sm"
                      onClick={() => saveField("visibility")}
                      disabled={
                        !hasVisibilityChanged || savingField === "visibility"
                      }
                    >
                      {savingField === "visibility" && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      Save
                    </Button>
                  }
                >
                  <Select
                    value={formData.visibility}
                    onValueChange={(val) =>
                      setFormData((prev) => ({ ...prev, visibility: val }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingCard>

                <SettingCard
                  title="License"
                  description="Choose a license for your package. This determines how others can use, modify, and distribute your code."
                  footer={
                    <Button
                      size="sm"
                      onClick={() => saveField("license")}
                      disabled={
                        !hasLicenseFieldChanged || savingField === "license"
                      }
                    >
                      {savingField === "license" && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      Save
                    </Button>
                  }
                >
                  <Select
                    value={formData.license || "unset"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        license: value === "unset" ? null : value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MIT">MIT</SelectItem>
                      <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                      <SelectItem value="BSD-3-Clause">BSD-3-Clause</SelectItem>
                      <SelectItem value="GPL-3.0">GPL-3.0</SelectItem>
                      <SelectItem value="unset">None</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingCard>

                <SettingCard
                  title="Default View"
                  description="The default tab shown when someone visits your package page."
                  footer={
                    <Button
                      size="sm"
                      onClick={() => saveField("defaultView")}
                      disabled={
                        !hasDefaultViewChanged || savingField === "defaultView"
                      }
                    >
                      {savingField === "defaultView" && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      Save
                    </Button>
                  }
                >
                  <Select
                    value={formData.defaultView}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, defaultView: value }))
                    }
                  >
                    <SelectTrigger className="w-full sm:w-48 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="files">Files</SelectItem>
                      <SelectItem value="3d">3D View</SelectItem>
                      <SelectItem value="pcb">PCB View</SelectItem>
                      <SelectItem value="schematic">Schematic</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingCard>
              </>
            )}

            {activeSection === "domains" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Domains
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Domains can be assigned to pacakge release preview.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      className="bg-white"
                      onClick={() =>
                        toast({
                          title: "Work in progress",
                          description: "This feature is coming soon",
                        })
                      }
                    >
                      Add new subdomain
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search any domain"
                        className="pl-9 border-none bg-transparent focus-visible:ring-0 placeholder:text-gray-400 focus:shadow-none shadow-none focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {packageRelease?.package_release_website_url ? (
                      [
                        {
                          name: packageRelease.package_release_website_url,
                        },
                      ].map((domain, i) => (
                        <div
                          key={i}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <CheckCircle2 className="h-5 w-5 text-white fill-blue-500 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {domain.name}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-8 sm:ml-0">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 bg-white"
                              onClick={() =>
                                toast({
                                  title: "Work in progress",
                                  description: "Edit coming soon",
                                })
                              }
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500 text-sm">
                        No domains configured yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "github" && (
              <SettingCard
                title="GitHub Repository"
                description="Connect your package to a GitHub repository to enable automatic syncing, PR previews, and more."
                footer={
                  <Button
                    size="sm"
                    onClick={() => saveField("github")}
                    disabled={!hasGithubChanged || savingField === "github"}
                  >
                    {savingField === "github" && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    Save
                  </Button>
                }
              >
                <GitHubRepositorySelector
                  selectedRepository={formData.githubRepoFullName || ""}
                  setSelectedRepository={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      githubRepoFullName: value,
                    }))
                  }
                  disabled={!!savingField}
                  open={true}
                  formData={formData}
                  addFormContent={(content) =>
                    setFormData((prev) => ({ ...prev, ...content }))
                  }
                  orgId={packageInfo?.owner_org_id}
                />
              </SettingCard>
            )}

            {activeSection === "danger" && (
              <>
                {availableOrgs.length > 0 && (
                  <SettingCard
                    title="Transfer Ownership"
                    description="Transfer this package to another organization. You must have admin access to the target organization."
                    danger
                    footer={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTransferDialog(true)}
                        disabled={
                          !targetOrgId || transferPackageMutation.isLoading
                        }
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                        Transfer
                      </Button>
                    }
                  >
                    <Select value={targetOrgId} onValueChange={setTargetOrgId}>
                      <SelectTrigger className="w-full sm:w-64 text-sm">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOrgs.map((org) => (
                          <SelectItem key={org.org_id} value={org.org_id}>
                            {org.display_name ||
                              org.tscircuit_handle ||
                              org.github_handle ||
                              org.org_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </SettingCard>
                )}

                <SettingCard
                  title="Delete Package"
                  description="Permanently delete this package and all of its releases, files, and data. This action is irreversible."
                  danger
                  footer={
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={deletePackageMutation.isLoading}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete Package
                    </Button>
                  }
                >
                  <p className="text-xs sm:text-sm text-gray-600">
                    Once you delete a package, there is no going back. Please be
                    certain.
                  </p>
                </SettingCard>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">{packageSlug}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (packageInfo)
                  deletePackageMutation.mutate({
                    package_id: packageInfo.package_id,
                  })
              }}
              disabled={deletePackageMutation.isLoading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
            >
              {deletePackageMutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer package</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTransferOrg ? (
                <>
                  Transfer{" "}
                  <span className="font-medium text-gray-700">
                    {packageSlug}
                  </span>{" "}
                  to{" "}
                  {selectedTransferOrg.display_name ||
                    selectedTransferOrg.tscircuit_handle}
                  ?
                </>
              ) : (
                "Select an organization to transfer this package to."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => transferPackageMutation.mutate()}
              disabled={
                transferPackageMutation.isLoading || !selectedTransferOrg
              }
              className="w-full sm:w-auto"
            >
              {transferPackageMutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
