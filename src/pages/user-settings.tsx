import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Redirect } from "wouter"
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
import { GithubAvatarWithFallback } from "@/components/GithubAvatarWithFallback"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useHydration } from "@/hooks/use-hydration"
import { Trash2, Loader2, ImageUp, Github, LogOut } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FullPageLoader } from "@/App"
import { useAxios } from "@/hooks/use-axios"
import { useQuery } from "react-query"
import { useToast } from "@/hooks/use-toast"
import { useUpdateAccountMutation } from "@/hooks/use-update-account-mutation"
import { useOrganization } from "@/hooks/use-organization"
import { useAvatarUploadDialog } from "@/hooks/use-avatar-upload-dialog"
import { useApiBaseUrl } from "@/hooks/use-packages-base-api-url"
import { useLogout } from "@/hooks/use-logout"
import { useConfirmDeleteAccountDialog } from "@/components/dialogs/confirm-delete-account-dialog"
import { cn } from "@/lib/utils"

const accountSettingsSchema = z.object({
  tscircuit_handle: z
    .string()
    .min(1, "Handle is required")
    .max(40, "Handle must be 40 characters or less")
    .regex(
      /^[0-9A-Za-z_-]+$/,
      "Handle may only contain letters, numbers, underscores, and hyphens",
    ),
})

type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>

type SettingsSection = "general" | "github" | "danger"

const navItems: { id: SettingsSection; label: string }[] = [
  { id: "general", label: "General" },
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

export default function UserSettingsPage() {
  const session = useGlobalStore((s) => s.session)
  const hasHydrated = useHydration()
  const axios = useAxios()
  const { toast } = useToast()
  const apiBaseUrl = useApiBaseUrl()
  const { handleLogout } = useLogout()

  const [activeSection, setActiveSection] = useState<SettingsSection>("general")

  const { Dialog: DeleteAccountDialog, openDialog: openDeleteAccountDialog } =
    useConfirmDeleteAccountDialog()

  const form = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      tscircuit_handle: "",
    },
  })

  const { data: accountResponse, isLoading: isLoadingAccount } = useQuery(
    ["current-account"],
    async () => {
      const response = await axios.get("/accounts/get")
      return response.data
    },
    {
      enabled: Boolean(session),
      refetchOnWindowFocus: false,
    },
  )
  const account = accountResponse?.account

  const { organization: personalOrg, refetch: refetchPersonalOrg } =
    useOrganization({
      orgId: account?.personal_org_id || undefined,
    })

  const {
    AvatarUploadDialog,
    openDialog: openAvatarDialog,
    preview: avatarPreview,
  } = useAvatarUploadDialog({
    orgId: account?.personal_org_id,
    currentAvatarUrl: personalOrg?.avatar_url,
    fallbackUsername: session?.github_username,
    title: "Update profile avatar",
    description:
      "Upload a square image (PNG, JPG, or GIF) up to 5MB to represent your profile.",
    onSuccess: refetchPersonalOrg,
  })

  const updateAccountMutation = useUpdateAccountMutation({
    onSuccess: (updatedAccount) => {
      toast({
        title: "Account updated",
        description: "Account settings have been updated successfully.",
      })
      form.reset({
        tscircuit_handle: updatedAccount.tscircuit_handle || "",
      })
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.error?.message
      toast({
        title: "Failed to update account",
        description:
          errorMessage || "An error occurred while updating the account.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (account) {
      form.reset({
        tscircuit_handle: account.tscircuit_handle || "",
      })
    }
  }, [account, form])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("installation_complete") === "true") {
      toast({
        title: "GitHub connected",
        description:
          "Your account can now link packages to GitHub repositories.",
      })

      refetchPersonalOrg?.()

      params.delete("installation_complete")
      const newSearch = params.toString()
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "")
      window.history.replaceState({}, "", newUrl)
    }
  }, [toast, refetchPersonalOrg])

  if (!hasHydrated) {
    return <FullPageLoader />
  }

  if (!session) {
    return <Redirect to="/login" />
  }

  const pageTitle = "User Settings - tscircuit"

  const formattedCreatedAt =
    isLoadingAccount && account?.created_at === undefined
      ? "Loading..."
      : account?.created_at &&
          !Number.isNaN(new Date(account.created_at).getTime())
        ? new Date(account.created_at).toLocaleString()
        : "Not available"

  const userInfo = [
    {
      label: "GitHub Username",
      value: account?.github_username || "Not connected",
    },
    {
      label: "Email",
      value: isLoadingAccount
        ? "Loading..."
        : account?.email || "Not available",
    },
    { label: "Account ID", value: session.account_id || "Not available" },
    {
      label: "Personal Organization ID",
      value: isLoadingAccount
        ? "Loading..."
        : account?.personal_org_id || "Not available",
    },
    { label: "Session ID", value: session.session_id || "Not available" },
    { label: "Created At", value: formattedCreatedAt },
  ]

  const handleDeleteAccount = () => {
    openDeleteAccountDialog({
      tscircuitHandle: session.tscircuit_handle ?? "",
      accountId: session.account_id,
    })
  }

  const handleConnectGithub = () => {
    if (!personalOrg) return

    const params = new URLSearchParams()
    params.set("redirect_uri", window.location.href)

    if (personalOrg.org_id) {
      params.set("org_id", personalOrg.org_id)
    }

    if (session?.account_id) {
      params.set("account_id", session.account_id)
    }

    window.location.href = `${apiBaseUrl}/internal/github/installations/create_new_installation_redirect?${params.toString()}`
  }

  const onSubmit = (data: AccountSettingsFormData) => {
    updateAccountMutation.mutate({
      tscircuit_handle: data.tscircuit_handle,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <GithubAvatarWithFallback
              username={session.tscircuit_handle}
              imageUrl={personalOrg?.avatar_url || undefined}
              className="h-10 w-10 border border-gray-200"
              fallbackClassName="text-sm font-medium"
              colorClassName="text-black"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Account Settings
              </h1>
              {session.tscircuit_handle && (
                <p className="text-xs sm:text-sm text-gray-500">
                  @{session.tscircuit_handle}
                </p>
              )}
            </div>
          </div>
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
                  title="Avatar"
                  description="Upload a custom avatar to replace the default GitHub image."
                >
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <GithubAvatarWithFallback
                      username={session?.tscircuit_handle}
                      imageUrl={
                        avatarPreview || personalOrg?.avatar_url || undefined
                      }
                      className="shadow-sm size-16"
                      fallbackClassName="font-semibold text-lg"
                      colorClassName="text-black"
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
                      {personalOrg?.avatar_url && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          Custom avatar active
                        </Badge>
                      )}
                    </div>
                  </div>
                </SettingCard>

                <SettingCard
                  title="Tscircuit Handle"
                  description="This is your account's URL identifier."
                  footer={
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => form.reset()}
                        disabled={updateAccountMutation.isLoading}
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={
                          updateAccountMutation.isLoading ||
                          !form.formState.isDirty
                        }
                      >
                        {updateAccountMutation.isLoading && (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        )}
                        Save
                      </Button>
                    </div>
                  }
                >
                  <Form {...form}>
                    <FormField
                      control={form.control}
                      name="tscircuit_handle"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              autoComplete="off"
                              spellCheck={false}
                              placeholder="Enter handle"
                              {...field}
                              disabled={updateAccountMutation.isLoading}
                              className={cn(
                                "w-full sm:max-w-md text-sm",
                                !account?.tscircuit_handle
                                  ? "border-blue-400 focus:border-blue-500 focus:ring-blue-500 ring-2 ring-blue-100"
                                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                              )}
                            />
                          </FormControl>
                          <FormMessage className="mt-2" />
                          {!account?.tscircuit_handle && (
                            <p className="text-xs text-blue-600 mt-1.5">
                              A handle is required to use your account.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </Form>
                </SettingCard>

                <SettingCard
                  title="Account Information"
                  description="Your account details and session information."
                >
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {userInfo.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <dt className="text-xs font-medium text-gray-500">
                          {item.label}
                        </dt>
                        <dd className="text-sm text-gray-900 break-words font-mono">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </SettingCard>
              </>
            )}

            {activeSection === "github" && (
              <SettingCard
                title="GitHub Connection"
                description="Install the tscircuit GitHub app for your account to link packages to repositories and enable PR previews."
                footer={
                  <Button size="sm" onClick={handleConnectGithub}>
                    <Github className="h-3.5 w-3.5 mr-1.5" />
                    {personalOrg?.github_installation_handles?.length
                      ? "Manage connection"
                      : "Connect GitHub"}
                  </Button>
                }
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-100 rounded-lg">
                      <Github className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {personalOrg?.github_installation_handles?.length
                          ? `Connected to ${personalOrg.github_installation_handles.length} GitHub account${personalOrg.github_installation_handles.length > 1 ? "s" : ""}`
                          : "Not connected"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Connect or update the GitHub installation for your
                        account.
                      </p>
                    </div>
                  </div>

                  {personalOrg?.github_installation_handles &&
                    personalOrg.github_installation_handles.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Connected accounts
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {personalOrg.github_installation_handles.map(
                            (handle) => (
                              <a
                                key={handle}
                                href={`https://github.com/${handle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors text-sm"
                              >
                                <GithubAvatarWithFallback
                                  username={handle}
                                  className="h-5 w-5"
                                  fallbackClassName="text-xs"
                                />
                                <span className="font-medium text-gray-900">
                                  @{handle}
                                </span>
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </SettingCard>
            )}

            {activeSection === "danger" && (
              <>
                <SettingCard
                  title="Logout"
                  description="Sign out of your account on this device. You can log back in anytime with your credentials."
                  danger
                  footer={
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-3.5 w-3.5 mr-1.5" />
                      Logout
                    </Button>
                  }
                >
                  <p className="text-xs sm:text-sm text-gray-600">
                    This will end your current session. You will need to sign in
                    again to access your account.
                  </p>
                </SettingCard>

                <SettingCard
                  title="Delete Account"
                  description="Permanently delete your account and all associated data. This action cannot be undone."
                  danger
                  footer={
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete Account
                    </Button>
                  }
                >
                  <p className="text-xs sm:text-sm text-gray-600">
                    Once you delete your account, there is no going back. All
                    your packages and account information will be permanently
                    removed.
                  </p>
                </SettingCard>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AvatarUploadDialog />

      <DeleteAccountDialog />
    </div>
  )
}
