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
  FormField,
  FormItem,
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
import { useEditOrgMemberPermissionsDialog } from "@/components/dialogs/edit-org-member-permissions-dialog"
import { InvitationStatusBadge } from "@/components/ui/invitation-status-badge"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Account } from "fake-snippets-api/lib/db/schema"
import {
  Users,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Trash2,
  Mail,
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
import { useOrganization } from "@/hooks/use-organization"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useAvatarUploadDialog } from "@/hooks/use-avatar-upload-dialog"
import { cn } from "@/lib/utils"
import { OrgDomainsList } from "@/components/org-settings/OrgDomainsList"

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

type SettingsSection = "general" | "members" | "domains" | "github" | "danger"

const navItems: { id: SettingsSection; label: string }[] = [
  { id: "general", label: "General" },
  { id: "members", label: "Members" },
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

export default function OrganizationSettingsPage() {
  const { orgname } = useParams()
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const session = useGlobalStore((s) => s.session)

  const [activeSection, setActiveSection] = useState<SettingsSection>("general")

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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-50 flex items-center justify-center mb-4 sm:mb-6">
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
            </div>
            <h1 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              Access denied
            </h1>
            <p className="text-gray-500 mb-6 sm:mb-8 text-sm">
              You don't have permission to manage this organization's settings.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/${orgname}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {orgname}
            </Button>
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

    setInviteError("")

    const email = inviteeEmail.trim()

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

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Organization Settings
          </h1>
          <Link
            href={`/${orgname}`}
            className="inline-flex items-center text-xs sm:text-sm text-gray-500 mt-1"
          >
            <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
            Go to {orgname}
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto md:min-h-[55vh] px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
                  title="Avatar"
                  description="Upload a custom avatar to represent your organization."
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <GithubAvatarWithFallback
                      username={organization.tscircuit_handle}
                      fallback={organization.name}
                      imageUrl={organization.avatar_url || undefined}
                      className="shadow-sm size-16"
                      fallbackClassName="font-semibold text-lg"
                    />
                    <div className="flex flex-col items-start gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openAvatarDialog}
                      >
                        <ImageUp className="h-4 w-4 mr-2" />
                        Update avatar
                      </Button>
                      {organization.avatar_url && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          Custom avatar active
                        </Badge>
                      )}
                    </div>
                  </div>
                </SettingCard>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <SettingCard
                      title="Organization Handle"
                      description="This is your organization's URL identifier. Changing it will affect your web address."
                      footer={
                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            updateOrgMutation.isLoading ||
                            !form.formState.isDirty
                          }
                        >
                          {updateOrgMutation.isLoading && (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          )}
                          Save
                        </Button>
                      }
                    >
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="tscircuit_handle"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-0">
                                  <span className="text-xs sm:text-sm text-gray-500 bg-gray-50 border border-gray-200 sm:border-r-0 rounded-t-md sm:rounded-t-none sm:rounded-l-md px-3 py-2">
                                    tscircuit.com/
                                  </span>
                                  <Input
                                    type="text"
                                    autoComplete="off"
                                    spellCheck={false}
                                    placeholder="Enter organization handle"
                                    {...field}
                                    disabled={updateOrgMutation.isLoading}
                                    className="rounded-t-none sm:rounded-t-md sm:rounded-l-none flex-1 text-sm"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="mt-2" />
                              {field.value &&
                                normalizeName(field.value)?.length > 0 &&
                                normalizeName(field.value) !== field.value && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Will be normalized to:{" "}
                                    <span className="font-mono text-gray-700">
                                      {normalizeName(field.value)}
                                    </span>
                                  </p>
                                )}
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="display_name"
                          render={({ field }) => (
                            <FormItem>
                              <label className="text-sm font-medium text-gray-700">
                                Display Name
                              </label>
                              <p className="text-xs text-gray-500 mb-1.5">
                                Publicly visible name. If empty, the handle is
                                used.
                              </p>
                              <FormControl>
                                <Input
                                  placeholder="Enter display name"
                                  {...field}
                                  disabled={updateOrgMutation.isLoading}
                                  className="w-full sm:max-w-md text-sm"
                                />
                              </FormControl>
                              <FormMessage className="mt-2" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </SettingCard>
                  </form>
                </Form>

                <SettingCard
                  title="Organization Information"
                  description="Read-only details about this organization."
                >
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {orgInfo.map((item) => (
                      <div key={item.label} className="space-y-0.5">
                        <dt className="text-xs font-medium text-gray-500">
                          {item.label}
                        </dt>
                        <dd className="text-sm text-gray-900 break-words">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </SettingCard>
              </>
            )}

            {activeSection === "members" && (
              <>
                <SettingCard
                  title="Invite Member"
                  description="Send an email invitation to add a new member to this organization."
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      id="invite-email-input"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteeEmail}
                      onChange={(e) => {
                        setInviteeEmail(e.target.value)
                        if (inviteError) setInviteError("")
                      }}
                      disabled={createInvitationMutation.isLoading}
                      className={cn(
                        "flex-1 text-sm",
                        inviteError && "border-red-300",
                      )}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !createInvitationMutation.isLoading
                        ) {
                          handleSendInvitation()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendInvitation}
                      disabled={
                        !inviteeEmail.trim() ||
                        createInvitationMutation.isLoading
                      }
                      size="sm"
                      className="sm:w-auto w-full"
                    >
                      {createInvitationMutation.isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Send Invitation
                    </Button>
                  </div>
                  {inviteError && (
                    <p className="mt-2 text-xs text-red-600">{inviteError}</p>
                  )}
                </SettingCard>

                <SettingCard
                  title="Members"
                  description={`Manage who has access to this organization. ${members.length} member${members.length !== 1 ? "s" : ""} total.`}
                >
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                    {isLoadingMembers ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No members found</p>
                        <p className="text-xs mt-1">
                          Add your first team member above.
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
                            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                          >
                            <Link
                              href={
                                member.tscircuit_handle
                                  ? `/${member.tscircuit_handle}`
                                  : `#`
                              }
                              className="flex items-center gap-3 group cursor-pointer flex-1 min-w-0"
                            >
                              <GithubAvatarWithFallback
                                username={member.tscircuit_handle}
                                imageUrl={member.avatar_url}
                                fallback={
                                  member.tscircuit_handle || member.account_id
                                }
                                className="h-9 w-9"
                                fallbackClassName="text-xs font-medium"
                                colorClassName="text-black"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                                    {member.tscircuit_handle ||
                                      member.account_id}
                                  </span>
                                  {role !== "member" && (
                                    <RoleBadge role={role} />
                                  )}
                                </div>
                                {member.email && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {member.email}
                                  </p>
                                )}
                              </div>
                            </Link>
                            <div className="flex flex-wrap gap-2 justify-start sm:justify-end flex-shrink-0">
                              {member.account_id !==
                                organization.owner_account_id &&
                                member.account_id !== session?.account_id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member)}
                                    disabled={removeMemberMutation.isLoading}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 text-xs px-3 py-1.5 h-auto"
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
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 text-xs px-3 py-1.5 h-auto"
                                  >
                                    Edit
                                  </Button>
                                )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </SettingCard>

                {invitations.length > 0 && (
                  <SettingCard
                    title="Invitations"
                    description="Track and manage pending invitations."
                  >
                    <div className="flex flex-wrap gap-1.5 mb-4">
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
                            invitationFilter === filter ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setInvitationFilter(filter)}
                          className="capitalize text-xs h-7 px-2.5"
                        >
                          {filter}
                        </Button>
                      ))}
                    </div>

                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                      {isLoadingInvitations ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      ) : filteredInvitations.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Mail className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm font-medium">
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
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-gray-50 transition-colors gap-3 sm:gap-0"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-medium text-sm text-gray-900">
                                    {invitation.invitee_email || "No email"}
                                  </span>
                                  <InvitationStatusBadge status={status} />
                                </div>
                                <p className="text-xs text-gray-500">
                                  Invited by {inviterName} on{" "}
                                  {new Date(
                                    invitation.created_at,
                                  ).toLocaleDateString()}
                                </p>
                                {invitation.is_accepted &&
                                  invitation.accepted_at && (
                                    <p className="text-xs text-green-600 mt-0.5">
                                      Accepted on{" "}
                                      {new Date(
                                        invitation.accepted_at,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                {invitation.is_pending &&
                                  !invitation.is_expired && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Expires on{" "}
                                      {new Date(
                                        invitation.expires_at,
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
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
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 text-xs px-3 py-1.5 h-auto"
                                    >
                                      {resendingInvitationId ===
                                      invitation.org_invitation_id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <>
                                          <RotateCw className="h-3.5 w-3.5 mr-1" />
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
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 text-xs px-3 py-1.5 h-auto"
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
                  </SettingCard>
                )}
              </>
            )}

            {activeSection === "domains" && (
              <OrgDomainsList orgId={organization.org_id} />
            )}

            {activeSection === "github" && (
              <SettingCard
                title="GitHub Connection"
                description="Install the tscircuit GitHub app for this organization to link packages to repositories and enable PR previews."
                footer={
                  <Button size="sm" onClick={handleConnectGithub}>
                    <Github className="h-3.5 w-3.5 mr-1.5" />
                    {organization.github_installation_handles?.length
                      ? "Manage connection"
                      : "Connect GitHub"}
                  </Button>
                }
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-gray-100 rounded-lg">
                    <Github className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {organization.github_installation_handles?.length
                        ? `Connected to ${organization.github_installation_handles.length} GitHub account${organization.github_installation_handles.length > 1 ? "s" : ""}`
                        : "Not connected"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Use the button below to connect or update the GitHub
                      installation.
                    </p>
                  </div>
                </div>

                {organization.github_installation_handles &&
                  organization.github_installation_handles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        Connected accounts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {organization.github_installation_handles.map(
                          (handle) => (
                            <a
                              key={handle}
                              href={`https://github.com/${handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors text-sm"
                            >
                              <GithubAvatarWithFallback
                                username={handle}
                                className="h-5 w-5"
                                fallbackClassName="text-xs"
                              />
                              <span className="font-medium text-gray-900 text-xs">
                                @{handle}
                              </span>
                            </a>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </SettingCard>
            )}

            {activeSection === "danger" && (
              <SettingCard
                title="Delete Organization"
                description="Permanently delete this organization and all associated data including packages, snippets, and members. This action cannot be undone."
                danger
                footer={
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteOrg}
                    disabled={
                      organization.owner_account_id !== session?.account_id
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete Organization
                  </Button>
                }
              >
                <p className="text-xs sm:text-sm text-gray-600">
                  Once you delete an organization, there is no going back.
                  Please be certain.
                </p>
              </SettingCard>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AlertDialog
        open={showRemoveMemberDialog.show}
        onOpenChange={(open) =>
          setShowRemoveMemberDialog({ ...showRemoveMemberDialog, show: open })
        }
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4 sm:mx-auto">
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
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMember}
              disabled={removeMemberMutation.isLoading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
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
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4 sm:mx-auto">
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
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            {!isConfirmingDelete ? (
              <Button
                variant="destructive"
                onClick={() => setIsConfirmingDelete(true)}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              >
                Delete Organization
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={confirmDeleteOrg}
                disabled={deleteOrgMutation.isLoading}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
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

      <AlertDialog
        open={showRevokeDialog !== null}
        onOpenChange={(open) => !open && setShowRevokeDialog(null)}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this invitation? The invitation
              link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showRevokeDialog) {
                  revokeInvitationMutation.mutate({
                    invitationId: showRevokeDialog,
                  })
                }
              }}
              disabled={revokeInvitationMutation.isLoading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
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
