import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams, useLocation, Link, Redirect } from "wouter"
import { Helmet } from "react-helmet-async"
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
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useAddOrgMemberMutation } from "@/hooks/use-add-org-member-mutation"
import { useRemoveOrgMemberMutation } from "@/hooks/use-remove-org-member-mutation"
import { useOrgByGithubHandle } from "@/hooks/use-org-by-github-handle"
import { useGlobalStore } from "@/hooks/use-global-store"
import { Account } from "fake-snippets-api/lib/db/schema"
import {
  Users,
  Crown,
  AlertTriangle,
  Loader2,
  PlusIcon,
  ArrowLeft,
  Building2,
} from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import NotFoundPage from "@/pages/404"
import { FullPageLoader } from "@/App"
import { OrganizationHeader } from "@/components/organization/OrganizationHeader"

const organizationSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(50, "Organization name must be 50 characters or less")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Organization name can only contain letters, numbers, underscores, and hyphens",
    ),
})

type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>

export default function OrganizationSettingsPage() {
  const { orgname } = useParams()
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const session = useGlobalStore((s) => s.session)

  const {
    data: organization,
    isLoading: isLoadingOrg,
    error: orgError,
  } = useOrgByGithubHandle(orgname || null)

  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState<{
    member: Account
    show: boolean
  }>({ member: {} as Account, show: false })
  const [newMemberInput, setNewMemberInput] = useState("")
  const [addMemberError, setAddMemberError] = useState("")

  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: "",
    },
  })

  const { data: members = [], isLoading: isLoadingMembers } = useListOrgMembers(
    {
      orgId: organization?.org_id || "",
    },
  )

  const updateOrgMutation = useUpdateOrgMutation({
    onSuccess: (updatedOrg) => {
      toast({
        title: "Organization updated",
        description: "Organization settings have been updated successfully.",
      })
      form.reset({ name: updatedOrg.name || "" })
      if (updatedOrg.name !== orgname) {
        navigate(`/${updatedOrg.name}/settings`)
      }
    },
  })

  const addMemberMutation = useAddOrgMemberMutation({
    onSuccess: () => {
      toast({
        title: "Member added",
        description: "Member has been added to the organization successfully.",
      })
      setNewMemberInput("")
      setAddMemberError("")
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.error?.message
      setAddMemberError(errorMessage)

      toast({
        title: "Failed to add member",
        description:
          errorMessage || "An error occurred while adding the member.",
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

  useEffect(() => {
    if (organization) {
      form.reset({ name: organization.name || "" })
    }
  }, [organization, form])

  if (!orgname) {
    return <NotFoundPage />
  }

  if (isLoadingOrg) {
    return <FullPageLoader />
  }

  if (orgError || !organization) {
    return <NotFoundPage heading="Organization Not Found" />
  }

  const pageTitle = organization?.name
    ? `${organization.name} Settings - tscircuit`
    : orgname
      ? `${orgname} Settings - tscircuit`
      : "Organization Settings - tscircuit"

  const canManageOrg =
    organization.user_permissions?.can_manage_org ||
    organization.owner_account_id === session?.account_id

  if (!canManageOrg) {
    return (
      <div className="min-h-screen bg-white">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <Header />
        <Redirect to="/dashboard" />
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

  const isPersonalOrg = organization?.is_personal_org

  const onSubmit = (data: OrganizationSettingsFormData) => {
    if (!organization) return
    updateOrgMutation.mutate({
      orgId: organization.org_id,
      name: data.name,
    })
  }

  const handleAddMember = () => {
    if (!newMemberInput.trim() || !organization) return

    // Clear previous errors
    setAddMemberError("")

    const input = newMemberInput.trim()

    // Basic validation
    if (input.length < 1) {
      setAddMemberError("Please enter a GitHub username.")
      return
    }

    if (input.length > 39) {
      setAddMemberError("GitHub usernames cannot be longer than 39 characters.")
      return
    }

    // Check for invalid characters (GitHub usernames can only contain alphanumeric characters and hyphens)
    if (!/^[a-zA-Z0-9-]+$/.test(input)) {
      setAddMemberError(
        "GitHub usernames can only contain letters, numbers, and hyphens.",
      )
      return
    }

    // Check if it starts or ends with hyphen
    if (input.startsWith("-") || input.endsWith("-")) {
      setAddMemberError("GitHub usernames cannot start or end with a hyphen.")
      return
    }

    addMemberMutation.mutate({
      orgId: organization.org_id,
      githubUsername: input,
    })
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

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <Header />

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <OrganizationHeader organization={organization} showActions={false} />

        <div className="py-8">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Organization Profile */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">
                  Organization profile
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Update your organization's basic information and settings.
                </p>
              </div>

              <div className="p-6 lg:p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                          <div className="lg:col-span-2">
                            <FormLabel className="text-sm font-semibold text-gray-900">
                              Organization name
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500 mt-2 leading-relaxed">
                              This is your organization's display name and URL
                              identifier. Choose carefully as this affects your
                              organization's web address.
                              {isPersonalOrg && (
                                <p className="text-sm text-red-500 mt-2">
                                  Personal organizations cannot be renamed.
                                </p>
                              )}
                            </FormDescription>
                          </div>
                          <div className="lg:col-span-3">
                            <FormControl>
                              <Input
                                placeholder="Enter organization name"
                                {...field}
                                disabled={
                                  updateOrgMutation.isLoading || isPersonalOrg
                                }
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
                          updateOrgMutation.isLoading ||
                          !form.formState.isDirty ||
                          isPersonalOrg
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

            {/* Members Management */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
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
                {/* Add Member Section */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    Add a member
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-4">
                      <Input
                        id="member-input"
                        placeholder="Enter GitHub username"
                        value={newMemberInput}
                        onChange={(e) => {
                          setNewMemberInput(e.target.value)
                          // Clear error when user starts typing
                          if (addMemberError) {
                            setAddMemberError("")
                          }
                        }}
                        disabled={addMemberMutation.isLoading}
                        className={`w-full h-11 text-base bg-white focus:border-blue-500 focus:ring-blue-500 ${
                          addMemberError
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !addMemberMutation.isLoading
                          ) {
                            handleAddMember()
                          }
                        }}
                      />
                      {addMemberError && (
                        <p className="mt-2 text-sm text-red-600">
                          {addMemberError}
                        </p>
                      )}
                    </div>
                    <div className="lg:col-span-1">
                      <Button
                        onClick={handleAddMember}
                        disabled={
                          !newMemberInput.trim() || addMemberMutation.isLoading
                        }
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white px-6 text-sm font-medium shadow-sm"
                      >
                        {addMemberMutation.isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <PlusIcon className="h-4 w-4 mr-2" />
                        )}
                        Add member
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Members List */}
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
                    members.map((member) => (
                      <div
                        key={member.account_id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 hover:bg-gray-50 transition-all duration-200 gap-4 sm:gap-0"
                      >
                        <Link
                          href={`/${member.github_username || member.account_id}`}
                          className="flex items-center gap-4 group cursor-pointer flex-1 min-w-0"
                        >
                          <Avatar className="h-12 w-12 border-2 border-gray-200 shadow-sm">
                            <AvatarImage
                              src={`https://github.com/${member.github_username}.png`}
                              alt={`${member.github_username} avatar`}
                            />
                            <AvatarFallback className="text-sm bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-medium">
                              {(
                                member.github_username ||
                                member.account_id ||
                                ""
                              )
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors truncate">
                                {member.github_username || member.account_id}
                              </span>
                              {member.account_id ===
                                organization.owner_account_id && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex-shrink-0">
                                  <Crown className="h-3 w-3" />
                                  Owner
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {member.account_id ===
                              organization.owner_account_id
                                ? "Full access to organization settings"
                                : "Standard member access"}
                            </p>
                          </div>
                        </Link>
                        {member.account_id !== organization.owner_account_id &&
                          member.account_id !== session?.account_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member)}
                              disabled={removeMemberMutation.isLoading}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 self-start sm:self-center px-4 py-2"
                            >
                              Remove
                            </Button>
                          )}
                      </div>
                    ))
                  )}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>
                {showRemoveMemberDialog.member.github_username ||
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
    </div>
  )
}
