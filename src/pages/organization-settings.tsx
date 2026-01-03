import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams, useLocation, Link, Redirect } from "wouter"
import { Helmet } from "react-helmet-async"
import { normalizeName } from "@/lib/utils/normalizeName"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GithubAvatarWithFallback } from "@/components/GithubAvatarWithFallback"
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
import { useUpdateOrgMutation } from "@/hooks/use-update-org-mutation"
import { useListOrgMembers } from "@/hooks/use-list-org-members"
import { useRemoveOrgMemberMutation } from "@/hooks/use-remove-org-member-mutation"
import { useDeleteOrgMutation } from "@/hooks/use-delete-org-mutation"
import { useCreateOrgInvitationMutation } from "@/hooks/use-create-org-invitation-mutation"
import { useListOrgInvitations } from "@/hooks/use-list-org-invitations"
import { useRevokeOrgInvitationMutation } from "@/hooks/use-revoke-org-invitation-mutation"
import {
  SelectedMember,
  useEditOrgMemberPermissionsDialog,
} from "@/components/dialogs/edit-org-member-permissions-dialog"
import { InvitationStatusBadge } from "@/components/ui/invitation-status-badge"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Account } from "fake-snippets-api/lib/db/schema"
import {
  Users,
  AlertTriangle,
  Loader2,
  PlusIcon,
  ArrowLeft,
  Building2,
  Trash2,
  Mail,
  Clock,
  X,
  Github,
  ImageUp,
  RotateCw,
} from "lucide-react"
import { getMemberRole } from "@/lib/utils/member-role"
import { RoleBadge } from "@/components/ui/role-badge"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import NotFoundPage from "@/pages/404"
import { FullPageLoader } from "@/App"
import { OrganizationHeader } from "@/components/organization/OrganizationHeader"
import { useOrganization } from "@/hooks/use-organization"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useAvatarUploadDialog } from "@/hooks/use-avatar-upload-dialog"

const organizationSettingsSchema = z.object({
  tscircuit_handle: z
    .string()
    .min(5, "Organization handle must be at least 5 characters")
    .max(40, "Organization handle must be less than 40 characters"),
  display_name: z
    .string()
    .min(5, "Display name must be at least 5 characters")
    .max(40, "Display name must be less than 40 characters")
    .optional()
    .or(z.literal("")),
})

type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>

export default function OrganizationSettingsPage() {
  const { orgname } = useParams()
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const session = useGlobalStore((s) => s.session)

  const {
    organization,
    isLoading: isLoadingOrg,
    error: orgError,
    refetch: refetchOrganization,
  } = useOrganization({
    orgTscircuitHandle: orgname,
  })

  const apiBaseUrl = useApiBaseUrl()

  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState<{
    member: Account
    show: boolean
  }>({ member: {} as Account, show: false })
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [inviteeEmail, setInviteeEmail] = useState("")
  const [inviteError, setInviteError] = useState("")
  const [invitationFilter, setInvitationFilter] = useState<
    "all" | "pending" | "accepted" | "expired" | "revoked"
  >("all")
  const [showRevokeDialog, setShowRevokeDialog] = useState<string | null>(null)
  const [resendingInvitationId, setResendingInvitationId] = useState<
    string | null
  >(null)

  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      tscircuit_handle: "",
      display_name: "",
    },
  })

  const { data: members = [], isLoading: isLoadingMembers } = useListOrgMembers(
    {
      orgId: organization?.org_id || "",
    },
  )

  const { data: invitations = [], isLoading: isLoadingInvitations } =
    useListOrgInvitations({
      orgId: organization?.org_id,
    })

  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      if (invitationFilter === "all") return true
      if (invitationFilter === "pending")
        return inv.is_pending && !inv.is_expired
      if (invitationFilter === "accepted") return inv.is_accepted
      if (invitationFilter === "expired") return inv.is_expired
      if (invitationFilter === "revoked") return inv.is_revoked
      return false
    })
  }, [invitations, invitationFilter])

  const updateOrgMutation = useUpdateOrgMutation({
    onSuccess: (updatedOrg) => {
      toast({
        title: "Organization updated",
        description: "Organization settings have been updated successfully.",
      })
      form.reset({
        tscircuit_handle: updatedOrg.tscircuit_handle || "",
        display_name: updatedOrg.display_name || "",
      })
      if (updatedOrg.tscircuit_handle !== orgname) {
        navigate(`/${updatedOrg.tscircuit_handle}/settings`)
      }
    },
    onError: (error) => {
      const errorMessage = error?.data?.message
      toast({
        title: "Failed to update organization",
        description:
          errorMessage || "An error occurred while updating the organization.",
        variant: "destructive",
      })
    },
  })

  const { AvatarUploadDialog, openDialog: openAvatarDialog } =
    useAvatarUploadDialog({
      orgId: organization?.org_id,
      currentAvatarUrl: organization?.avatar_url,
      fallbackUsername: organization?.github_handle,
      fallbackText: organization?.name,
      title: "Update organization avatar",
      description:
        "Upload a square image (PNG, JPG, or GIF) up to 5MB to represent your organization.",
      onSuccess: refetchOrganization,
    })

  const createInvitationMutation = useCreateOrgInvitationMutation({
    onSuccess: (data) => {
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${data.invitee_email}`,
      })
      setInviteeEmail("")
      setInviteError("")
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.error?.message || "Failed to send invitation"

      setInviteError(errorMessage)
    },
  })

  const revokeInvitationMutation = useRevokeOrgInvitationMutation({
    onSuccess: () => {
      toast({
        title: "Invitation revoked",
        description: "The invitation has been cancelled.",
      })
      setShowRevokeDialog(null)
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.error?.message
      toast({
        title: "Failed to revoke invitation",
        description:
          errorMessage || "An error occurred while revoking the invitation.",
        variant: "destructive",
      })
    },
  })

  const removeMemberMutation = useRemoveOrgMemberMutation({
    onSuccess: () => {
      toast({
        title: "Member removed",
        description: "Member has been removed from the organization.",
      })
      setShowRemoveMemberDialog({ member: {} as Account, show: false })
    },
  })

  const {
    Dialog: EditMemberPermissionsDialog,
    openDialog: openEditMemberPermissionsDialog,
  } = useEditOrgMemberPermissionsDialog()

  const deleteOrgMutation = useDeleteOrgMutation({
    onSuccess: () => {
      toast({
        title: "Organization deleted",
        description: "Organization has been permanently deleted.",
      })
      navigate("/dashboard")
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.error?.message
      toast({
        title: "Failed to delete organization",
        description:
          errorMessage || "An error occurred while deleting the organization.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (organization) {
      form.reset({
        tscircuit_handle: organization.tscircuit_handle || "",
        display_name: organization.display_name || "",
      })
    }
  }, [organization, form])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("installation_complete") === "true") {
      toast({
        title: "GitHub connected",
        description:
          "Your organization can now link packages to GitHub repositories.",
      })

      refetchOrganization?.()

      params.delete("installation_complete")
      const newSearch = params.toString()
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "")
      window.history.replaceState({}, "", newUrl)
    }
  }, [toast, refetchOrganization])

  if (!orgname) {
    return <NotFoundPage />
  }

  if (isLoadingOrg) {
    return <FullPageLoader />
  }

  if (orgError || !organization) {
    return <NotFoundPage />
  }

  const pageTitle = organization?.tscircuit_handle
    ? `${organization.tscircuit_handle} Settings - tscircuit`
    : orgname
      ? `${orgname} Settings - tscircuit`
      : "Organization Settings - tscircuit"

  const canManageOrg =
    organization.user_permissions?.can_manage_org ||
    organization.owner_account_id === session?.account_id

  if (organization.is_personal_org) {
    return <Redirect to="/settings" />
  }

  if (!canManageOrg) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              Access denied
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You don't have permission to manage this organization's settings.
              Only organization owners and members with admin access can view
              this page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(`/${orgname}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {orgname}
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const orgInfo = [
    {
      label: "Organization ID",
      value: organization?.org_id || "Not available",
    },
    {
      label: "Owner Account ID",
      value: organization?.owner_account_id || "Not available",
    },
    {
      label: "Organization Handle",
      value: organization?.tscircuit_handle || "Not added",
    },
    {
      label: "GitHub Handle",
      value: organization?.github_handle || "Not connected",
    },
    {
      label: "Member Count",
      value: organization?.member_count?.toString() || "0",
    },
    {
      label: "Package Count",
      value: organization?.package_count?.toString() || "0",
    },
    {
      label: "Display Name",
      value: organization?.display_name || "Not added",
    },
    {
      label: "Created At",
      value:
        organization?.created_at &&
        !Number.isNaN(new Date(organization.created_at).getTime())
          ? new Date(organization.created_at).toLocaleString()
          : "Not available",
    },
  ]

  const onSubmit = (data: OrganizationSettingsFormData) => {
    if (!organization) return

    const normalizedHandle = normalizeName(data.tscircuit_handle)

    if (normalizedHandle.length < 5) {
      form.setError("tscircuit_handle", {
        type: "manual",
        message:
          "Organization handle must be at least 5 characters after normalization",
      })
      return
    }

    const changedFields: {
      orgId: string
      tscircuit_handle?: string
      display_name?: string
    } = { orgId: organization.org_id }

    if (normalizedHandle !== organization.tscircuit_handle) {
      changedFields.tscircuit_handle = normalizedHandle
    }

    if (data.display_name !== organization.display_name) {
      changedFields.display_name = data.display_name
    }

    updateOrgMutation.mutate(changedFields)
  }

  const handleConnectGithub = () => {
    if (!organization) return

    const params = new URLSearchParams()
    params.set("redirect_uri", window.location.href)

    if (organization.org_id) {
      params.set("org_id", organization.org_id)
    }

    if (session?.account_id) {
      params.set("account_id", session.account_id)
    }

    window.location.href = `${apiBaseUrl}/internal/github/installations/create_new_installation_redirect?${params.toString()}`
  }

  const handleSendInvitation = () => {
    if (!inviteeEmail.trim() || !organization) return

    // Clear previous errors
    setInviteError("")

    const email = inviteeEmail.trim()

    // Email validation using zod
    const emailSchema = z.string().email()
    const result = emailSchema.safeParse(email)

    if (!result.success) {
      setInviteError("Please enter a valid email address")
      return
    }

    createInvitationMutation.mutate({
      orgId: organization.org_id,
      inviteeEmail: email,
    })
  }

  const handleResendInvitation = (invitationId: string, email: string) => {
    if (!organization || !email) return
    setResendingInvitationId(invitationId)
    createInvitationMutation.mutate(
      {
        orgId: organization.org_id,
        inviteeEmail: email,
      },
      {
        onSuccess: () => {
          toast({
            title: "Invitation resent",
            description: `A new invitation has been sent to ${email}`,
          })
        },
        onError: (error: any) => {
          setInviteError("")
          const errorCode = error?.data?.error?.error_code
          if (errorCode === "invitation_already_exists") {
            toast({
              title: "Invitation already sent",
              description:
                "An active invitation for this email already exists. Ask them to check their spam folder.",
            })
          } else {
            toast({
              title: "Failed to resend invitation",
              description:
                error?.data?.error?.message ||
                "An error occurred while resending the invitation.",
              variant: "destructive",
            })
          }
        },
        onSettled: () => setResendingInvitationId(null),
      },
    )
  }

  const handleRemoveMember = (member: Account) => {
    if (!organization) return
    if (member.account_id === organization.owner_account_id) {
      toast({
        title: "Cannot remove owner",
        description: "The organization owner cannot be removed.",
        variant: "destructive",
      })
      return
    }
    setShowRemoveMemberDialog({ member, show: true })
  }

  const confirmRemoveMember = () => {
    if (!organization) return
    removeMemberMutation.mutate({
      orgId: organization.org_id,
      accountId: showRemoveMemberDialog.member.account_id,
    })
  }

  const handleDeleteOrg = () => {
    setShowDeleteOrgDialog(true)
  }

  const confirmDeleteOrg = () => {
    if (!organization) return
    deleteOrgMutation.mutate({
      orgId: organization.org_id,
    })
    setShowDeleteOrgDialog(false)
    setIsConfirmingDelete(false)
  }

  return (
    <div className="min-h-screen bg-white">
      <AvatarUploadDialog />
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <Header />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <OrganizationHeader organization={organization} showActions={false} />

        <div className="py-8">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto space-y-8">
            {/* GitHub Connection */}
            {canManageOrg && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <h2 className="text-xl font-semibold text-gray-900">
                    GitHub connection
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Install the tscircuit GitHub app for this organization to
                    link packages to repositories and enable PR previews.
                  </p>
                </div>

                <div className="p-6 lg:p-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <Github className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-base font-semibold text-gray-900">
                          {organization.github_installation_handles?.length
                            ? `Connected to ${organization.github_installation_handles.length} GitHub account${organization.github_installation_handles.length > 1 ? "s" : ""}`
                            : "Not connected"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Use the button below to connect or update the GitHub
                          installation for this organization.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <Button
                        onClick={handleConnectGithub}
                        className="sm:w-auto w-full"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        {organization.github_installation_handles?.length
                          ? "Manage GitHub connection"
                          : "Connect GitHub"}
                      </Button>
                    </div>
                  </div>

                  {/* Connected GitHub accounts */}
                  {organization.github_installation_handles &&
                    organization.github_installation_handles.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Connected GitHub accounts
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {organization.github_installation_handles.map(
                            (handle) => (
                              <a
                                key={handle}
                                href={`https://github.com/${handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                              >
                                <GithubAvatarWithFallback
                                  username={handle}
                                  className="h-6 w-6"
                                  fallbackClassName="text-xs"
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  @{handle}
                                </span>
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Organization Profile */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-gray-900">
                  Organization profile
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Update your organization's basic information and settings.
                </p>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 mb-6">
                  <GithubAvatarWithFallback
                    username={organization.tscircuit_handle}
                    fallback={organization.name}
                    imageUrl={organization.avatar_url || undefined}
                    className="shadow-sm size-24 md:size-16"
                    fallbackClassName="font-semibold text-lg"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Organization avatar
                    </p>
                    <p className="text-sm text-gray-600">
                      Upload a custom avatar to replace the default GitHub
                      image.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openAvatarDialog}
                      >
                        <ImageUp className="h-4 w-4 mr-2" />
                        Update avatar
                      </Button>
                      {organization.avatar_url && (
                        <Badge variant="secondary" className="w-fit">
                          Custom avatar active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="tscircuit_handle"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                          <div className="lg:col-span-2">
                            <FormLabel className="text-sm font-semibold text-gray-900">
                              Organization handle
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500 mt-2 leading-relaxed">
                              This is your organization's URL identifier. Choose
                              carefully as this affects your organization's web
                              address.
                            </FormDescription>
                          </div>
                          <div className="lg:col-span-3">
                            <FormControl>
                              <Input
                                type="text"
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="Enter organization handle"
                                {...field}
                                disabled={updateOrgMutation.isLoading}
                                className="w-full max-w-lg h-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="mt-2" />
                            {field.value &&
                              normalizeName(field.value)?.length && (
                                <p className="text-xs text-gray-500 mt-2">
                                  This will be your URL.
                                  <br />
                                  <span className="font-mono text-gray-700">
                                    tscircuit.com/
                                    {normalizeName(field.value)}
                                  </span>
                                </p>
                              )}
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                          <div className="lg:col-span-2">
                            <FormLabel className="text-sm font-semibold text-gray-900">
                              Display name
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500 mt-2 leading-relaxed">
                              This is the name that will be displayed publicly.
                              If left empty, the organization handle will be
                              used.
                            </FormDescription>
                          </div>
                          <div className="lg:col-span-3">
                            <FormControl>
                              <Input
                                placeholder="Enter display name"
                                {...field}
                                disabled={updateOrgMutation.isLoading}
                                className="w-full max-w-lg h-11 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="mt-2" />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                      <Button
                        type="submit"
                        disabled={
                          updateOrgMutation.isLoading || !form.formState.isDirty
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium shadow-sm"
                      >
                        {updateOrgMutation.isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update organization
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={updateOrgMutation.isLoading}
                        className="px-6 py-2.5 text-sm font-medium border-gray-300 hover:bg-gray-50"
                      >
                        Reset changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-gray-900">
                  Organization information
                </h2>
              </div>
              <div className="p-6 lg:p-8">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {orgInfo.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <dt className="text-sm font-semibold text-gray-900">
                        {item.label}
                      </dt>
                      <dd className="text-sm text-gray-600 break-words">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Members Management */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Organization members
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                      Manage who has access to this organization and their
                      permissions.
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-sm px-3 py-1 bg-white border border-gray-200 self-start"
                  >
                    {members.length} member{members.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                {/* Invite Member Section */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Invite member
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-4">
                      <Input
                        id="invite-email-input"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteeEmail}
                        onChange={(e) => {
                          setInviteeEmail(e.target.value)
                          // Clear error when user starts typing
                          if (inviteError) {
                            setInviteError("")
                          }
                        }}
                        disabled={createInvitationMutation.isLoading}
                        className={`w-full h-11 text-base bg-white focus:border-blue-500 focus:ring-blue-500 ${
                          inviteError
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !createInvitationMutation.isLoading
                          ) {
                            handleSendInvitation()
                          }
                        }}
                      />
                      {inviteError && (
                        <p className="mt-2 text-sm text-red-600">
                          {inviteError}
                        </p>
                      )}
                    </div>
                    <div className="lg:col-span-1">
                      <Button
                        onClick={handleSendInvitation}
                        disabled={
                          !inviteeEmail.trim() ||
                          createInvitationMutation.isLoading
                        }
                        className="w-full md:h-11 bg-blue-600 hover:bg-blue-700 text-white px-6 text-sm font-medium shadow-sm"
                      >
                        {createInvitationMutation.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        Send Invitation
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5" />
                    Members
                  </h3>
                  <div className="space-y-0 border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
                    {isLoadingMembers ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No members found</p>
                        <p className="text-sm mt-1">
                          Add your first team member to get started.
                        </p>
                      </div>
                    ) : (
                      members.map((member) => {
                        const role = getMemberRole(member.account_id, {
                          org_owner_account_id: organization.owner_account_id,
                          member_permissions:
                            member.org_member_permissions ?? {},
                        })
                        return (
                          <div
                            key={member.account_id}
                            className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-5 hover:bg-gray-50 transition-all duration-200"
                          >
                            <Link
                              href={
                                member.tscircuit_handle
                                  ? `/${member.tscircuit_handle}`
                                  : `#`
                              }
                              className="flex items-center gap-4 group cursor-pointer flex-1 min-w-0"
                            >
                              <GithubAvatarWithFallback
                                username={member.tscircuit_handle}
                                imageUrl={member.avatar_url}
                                fallback={
                                  member.tscircuit_handle || member.account_id
                                }
                                className="h-12 w-12"
                                fallbackClassName="text-sm font-medium"
                                colorClassName="text-black"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors truncate">
                                    {member.tscircuit_handle ||
                                      member.account_id}
                                  </span>
                                  {role !== "member" && (
                                    <RoleBadge role={role} />
                                  )}
                                </div>
                                {member.email && (
                                  <p className="text-sm text-gray-500 truncate">
                                    {member.email}
                                  </p>
                                )}
                              </div>
                            </Link>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 flex-shrink-0 w-full lg:w-auto">
                              <div className="flex flex-wrap gap-3 justify-start sm:justify-end">
                                {member.account_id !==
                                  organization.owner_account_id &&
                                  member.account_id !== session?.account_id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveMember(member)}
                                      disabled={removeMemberMutation.isLoading}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 px-4 py-2"
                                    >
                                      Remove
                                    </Button>
                                  )}
                                {member.account_id !==
                                  organization.owner_account_id &&
                                  member.account_id !== session?.account_id &&
                                  organization.user_permissions
                                    ?.can_manage_org && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        openEditMemberPermissionsDialog({
                                          selectedMember: {
                                            member,
                                            orgId: organization.org_id,
                                            currentPermissions:
                                              member.org_member_permissions,
                                          },
                                        })
                                      }}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 px-4 py-2"
                                    >
                                      Edit
                                    </Button>
                                  )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Invitations Section */}
                {invitations.length > 0 && (
                  <div className="mt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Invitations
                      </h3>
                      <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label="Filter invitations by status"
                      >
                        {(
                          [
                            "all",
                            "pending",
                            "accepted",
                            "expired",
                            "revoked",
                          ] as const
                        ).map((filter) => (
                          <Button
                            key={filter}
                            variant={
                              invitationFilter === filter
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setInvitationFilter(filter)}
                            className="capitalize"
                            aria-label={`Show ${filter} invitations`}
                            aria-pressed={invitationFilter === filter}
                          >
                            {filter}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-0 border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
                      {isLoadingInvitations ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                      ) : filteredInvitations.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">
                            No{" "}
                            {invitationFilter !== "all" ? invitationFilter : ""}{" "}
                            invitations
                          </p>
                        </div>
                      ) : (
                        filteredInvitations.map((invitation) => {
                          const status = invitation.is_revoked
                            ? "revoked"
                            : invitation.is_accepted
                              ? "accepted"
                              : invitation.is_expired
                                ? "expired"
                                : "pending"
                          const inviterName =
                            invitation.inviter.tscircuit_handle ||
                            invitation.inviter.github_username ||
                            "Unknown"

                          return (
                            <div
                              key={invitation.org_invitation_id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 hover:bg-gray-50 transition-all duration-200 gap-4 sm:gap-0"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {invitation.invitee_email || "No email"}
                                  </span>
                                  <InvitationStatusBadge status={status} />
                                </div>
                                <p className="text-sm text-gray-500">
                                  Invited by {inviterName} on{" "}
                                  {new Date(
                                    invitation.created_at,
                                  ).toLocaleDateString()}
                                </p>
                                {invitation.is_accepted &&
                                  invitation.accepted_at && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Accepted on{" "}
                                      {new Date(
                                        invitation.accepted_at,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                {invitation.is_pending &&
                                  !invitation.is_expired && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Expires on{" "}
                                      {new Date(
                                        invitation.expires_at,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                              </div>
                              <div className="flex items-center gap-2">
                                {(invitation.is_pending ||
                                  invitation.is_expired) &&
                                  !invitation.is_revoked &&
                                  !invitation.is_accepted &&
                                  invitation.invitee_email && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleResendInvitation(
                                          invitation.org_invitation_id,
                                          invitation.invitee_email!,
                                        )
                                      }
                                      disabled={
                                        resendingInvitationId ===
                                        invitation.org_invitation_id
                                      }
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 px-4 py-2"
                                    >
                                      {resendingInvitationId ===
                                      invitation.org_invitation_id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <RotateCw className="h-4 w-4 mr-1" />
                                          Resend
                                        </>
                                      )}
                                    </Button>
                                  )}
                                {invitation.is_pending &&
                                  !invitation.is_expired && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setShowRevokeDialog(
                                          invitation.org_invitation_id,
                                        )
                                      }
                                      disabled={
                                        revokeInvitationMutation.isLoading
                                      }
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 px-4 py-2"
                                    >
                                      Revoke
                                    </Button>
                                  )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-red-200 bg-red-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-red-900">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-600 mt-2">
                  Irreversible and destructive actions for this organization.
                </p>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Delete Organization
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Permanently delete this organization and all associated
                      data. This action cannot be undone and will remove all
                      packages, snippets, and organization information.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteOrg}
                      disabled={
                        organization.owner_account_id !== session?.account_id
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-medium shadow-sm w-full lg:w-auto"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Organization
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={showRemoveMemberDialog.show}
        onOpenChange={(open) =>
          setShowRemoveMemberDialog({ ...showRemoveMemberDialog, show: open })
        }
      >
        <AlertDialogContent className="w-[90vw] p-6 rounded-2xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>
                {showRemoveMemberDialog.member.tscircuit_handle ||
                  showRemoveMemberDialog.member.account_id}
              </strong>{" "}
              from this organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              disabled={removeMemberMutation.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {removeMemberMutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditMemberPermissionsDialog />

      <AlertDialog
        open={showDeleteOrgDialog}
        onOpenChange={(open) => {
          setShowDeleteOrgDialog(open)
          if (!open) {
            setIsConfirmingDelete(false)
          }
        }}
      >
        <AlertDialogContent className="w-[90vw] md:w-auto rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Organization
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete{" "}
              <strong>{organization?.tscircuit_handle}</strong>? This action is
              permanent and cannot be undone. All packages, snippets, and
              organization data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {!isConfirmingDelete ? (
              <Button
                variant="destructive"
                onClick={() => setIsConfirmingDelete(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Organization
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={confirmDeleteOrg}
                disabled={deleteOrgMutation.isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteOrgMutation.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Yes, Delete Organization
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Invitation Confirmation Dialog */}
      <AlertDialog
        open={showRevokeDialog !== null}
        onOpenChange={(open) => !open && setShowRevokeDialog(null)}
      >
        <AlertDialogContent className="w-[90vw] p-6 rounded-2xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this invitation? The invitation
              link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showRevokeDialog) {
                  revokeInvitationMutation.mutate({
                    invitationId: showRevokeDialog,
                  })
                }
              }}
              disabled={revokeInvitationMutation.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {revokeInvitationMutation.isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Revoke invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
