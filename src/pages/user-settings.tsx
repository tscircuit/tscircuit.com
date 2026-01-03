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

export default function UserSettingsPage() {
  const session = useGlobalStore((s) => s.session)
  const hasHydrated = useHydration()
  const axios = useAxios()
  const { toast } = useToast()
  const apiBaseUrl = useApiBaseUrl()
  const { handleLogout } = useLogout()

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

      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl mx-auto py-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <GithubAvatarWithFallback
                username={session.tscircuit_handle}
                imageUrl={personalOrg?.avatar_url || undefined}
                className="h-16 w-16 border-2 border-gray-200 shadow-sm"
                fallbackClassName="text-lg font-medium"
                colorClassName="text-black"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Account Settings{" "}
                  {session.tscircuit_handle
                    ? `- @${session.tscircuit_handle} `
                    : ""}
                </h1>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-gray-900">
                  Account profile
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Update your account's basic information and settings.
                </p>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 mb-6">
                  <GithubAvatarWithFallback
                    username={session?.tscircuit_handle}
                    imageUrl={
                      avatarPreview || personalOrg?.avatar_url || undefined
                    }
                    className="shadow-sm size-24 md:size-16 border-2 border-gray-200"
                    fallbackClassName="font-semibold text-lg"
                    colorClassName="text-black"
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Profile avatar
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
                      {personalOrg?.avatar_url && (
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
                              Tscircuit Handle
                              {!account?.tscircuit_handle && (
                                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                  Required
                                </span>
                              )}
                            </FormLabel>
                            <FormDescription className="text-sm text-gray-500 leading-relaxed">
                              This is your account's URL identifier.
                            </FormDescription>
                          </div>
                          <div className="lg:col-span-3">
                            <FormControl>
                              <Input
                                type="text"
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="Enter handle"
                                {...field}
                                disabled={updateAccountMutation.isLoading}
                                className={`w-full max-w-lg h-11 text-base ${
                                  !account?.tscircuit_handle
                                    ? "border-blue-400 focus:border-blue-500 focus:ring-blue-500 ring-2 ring-blue-100"
                                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                }`}
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
                          updateAccountMutation.isLoading ||
                          !form.formState.isDirty
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium shadow-sm"
                      >
                        {updateAccountMutation.isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update account
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={updateAccountMutation.isLoading}
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
                  Account information
                </h2>
              </div>
              <div className="p-6 lg:p-8">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  {userInfo.map((item) => (
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-gray-900">
                  GitHub connection
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Install the tscircuit GitHub app for your account to link
                  packages to repositories and enable PR previews.
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
                        {personalOrg?.github_installation_handles?.length
                          ? `Connected to ${personalOrg.github_installation_handles.length} GitHub account${personalOrg.github_installation_handles.length > 1 ? "s" : ""}`
                          : "Not connected"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Use the button below to connect or update the GitHub
                        installation for your account.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                      onClick={handleConnectGithub}
                      className="sm:w-auto w-full"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      {personalOrg?.github_installation_handles?.length
                        ? "Manage GitHub connection"
                        : "Connect GitHub"}
                    </Button>
                  </div>
                </div>

                {personalOrg?.github_installation_handles &&
                  personalOrg.github_installation_handles.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Connected GitHub accounts
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {personalOrg.github_installation_handles.map(
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
            <div className="bg-white border border-red-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-red-200 bg-red-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-red-900">
                  Account Actions
                </h2>
              </div>

              <div className="p-6 lg:p-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Permanently delete your account and all associated data.{" "}
                      <br />
                      This action cannot be undone and will remove all your
                      packages, and account information.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full lg:w-1/5">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-medium shadow-sm w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Logout
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Sign out of your account on this device. You can log
                        back in anytime with your credentials.
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-full lg:w-1/5">
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-medium shadow-sm w-full"
                      >
                        <LogOut className="mr-2 size-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <AvatarUploadDialog />

      <DeleteAccountDialog />
    </div>
  )
}
