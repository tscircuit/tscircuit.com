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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useHydration } from "@/hooks/use-hydration"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FullPageLoader } from "@/App"
import { useAxios } from "@/hooks/use-axios"
import { useQuery } from "react-query"
import { useToast } from "@/hooks/use-toast"
import { useUpdateAccountMutation } from "@/hooks/use-update-account-mutation"

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

  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)

  const form = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      tscircuit_handle: "",
    },
  })

  if (!hasHydrated) {
    return <FullPageLoader />
  }

  if (!session) {
    return <Redirect to="/" />
  }

  const pageTitle = "User Settings - tscircuit"
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
      const errorMessage = error?.response?.data?.error?.message
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
      value: account?.github_username || "Not available",
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
    setShowDeleteAccountDialog(true)
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
              <Avatar className="h-16 w-16 border-2 border-gray-200 shadow-sm">
                <AvatarImage
                  src={`https://github.com/${session.github_username}.png`}
                  alt={`${session.github_username} avatar`}
                />
                <AvatarFallback className="text-lg font-medium">
                  {(session.github_username || session.account_id || "")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Account Settings
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

            <div className="bg-white border border-red-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-red-200 bg-red-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-red-900">
                  Danger Zone
                </h2>
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Permanently delete your account and all associated data.
                      This action cannot be undone and will remove all your
                      packages, snippets, and account information.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-sm font-medium shadow-sm w-full lg:w-auto"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <AlertDialog
        open={showDeleteAccountDialog}
        onOpenChange={setShowDeleteAccountDialog}
      >
        <AlertDialogContent className="w-[90vw] md:w-auto rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              To delete your account, please contact us at support@tscircuit.com
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
