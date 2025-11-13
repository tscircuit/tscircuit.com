import { useCallback, useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import { Redirect, useLocation, useSearchParams } from "wouter"
import { Helmet } from "react-helmet-async"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { AlertTriangle, Trash2 } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FullPageLoader } from "@/App"
import { useAxios } from "@/hooks/use-axios"
import { useQuery } from "react-query"
import toast from "react-hot-toast"

export default function UserSettingsPage() {
  const session = useGlobalStore((s) => s.session)
  const hasHydrated = useHydration()
  const axios = useAxios()
  const [searchParams, setSearchParams] = useSearchParams()
  const [, setLocation] = useLocation()
  const isHandleRequired = searchParams.get("handleRequired") === "1"
  const postHandleRedirectTarget = searchParams.get("redirect")

  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [handleInput, setHandleInput] = useState("")
  const [isUpdatingHandle, setIsUpdatingHandle] = useState(false)
  const [handleError, setHandleError] = useState<string | null>(null)
  const hasShownHandleToastRef = useRef(false)

  const clearHandleRequirementParams = useCallback(() => {
    const params =
      typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search)
    params.delete("handleRequired")
    params.delete("redirect")
    setSearchParams(params)
  }, [setSearchParams])

  if (!hasHydrated) {
    return <FullPageLoader />
  }

  if (!session) {
    return <Redirect to="/" />
  }

  const pageTitle = "User Settings - tscircuit"
  const {
    data: accountResponse,
    isLoading: isLoadingAccount,
    refetch: refetchAccount,
  } = useQuery(
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

  useEffect(() => {
    const nextHandle =
      account?.tscircuit_handle ?? session?.github_username ?? ""
    setHandleInput(nextHandle)
    setHandleError(null)
  }, [account?.tscircuit_handle, session?.github_username])

  useEffect(() => {
    if (
      isHandleRequired &&
      !account?.tscircuit_handle &&
      !hasShownHandleToastRef.current
    ) {
      toast("Pick a tscircuit handle to finish setting up your account.", {
        icon: "⚠️",
      })
      hasShownHandleToastRef.current = true
    }
  }, [isHandleRequired, account?.tscircuit_handle])

  useEffect(() => {
    if (isHandleRequired && account?.tscircuit_handle) {
      const target = postHandleRedirectTarget
      clearHandleRequirementParams()
      if (target) {
        setLocation(target)
      }
    }
  }, [
    isHandleRequired,
    account?.tscircuit_handle,
    postHandleRedirectTarget,
    clearHandleRequirementParams,
    setLocation,
  ])

  const formattedCreatedAt =
    isLoadingAccount && account?.created_at === undefined
      ? "Loading..."
      : account?.created_at &&
          !Number.isNaN(new Date(account.created_at).getTime())
        ? new Date(account.created_at).toLocaleString()
        : "Not available"
  const normalizedHandleInput = handleInput.trim()
  const currentHandle = account?.tscircuit_handle ?? ""
  const hasHandleChanged = normalizedHandleInput !== currentHandle
  const handlePreview =
    normalizedHandleInput ||
    account?.github_username ||
    session?.github_username ||
    "handle"

  const validateHandleInput = () => {
    if (!normalizedHandleInput) {
      setHandleError("Handle is required")
      return false
    }
    return true
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHandleInput(event.target.value)
    if (handleError) {
      setHandleError(null)
    }
  }

  const handleHandleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isUpdatingHandle || isLoadingAccount || !account) {
      return
    }
    setHandleError(null)
    if (!validateHandleInput()) {
      return
    }
    if (!hasHandleChanged) {
      return
    }

    setIsUpdatingHandle(true)
    try {
      await axios.post("/accounts/update", {
        tscircuit_handle: normalizedHandleInput,
      })
      toast.success("tscircuit handle updated")
      await refetchAccount()
      if (isHandleRequired) {
        if (postHandleRedirectTarget) {
          setTimeout(() => {
            setLocation(postHandleRedirectTarget)
          }, 500)
        } else {
          clearHandleRequirementParams()
        }
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error?.message ??
        error?.data?.error?.message ??
        "Failed to update handle"
      setHandleError(message)
      toast.error(message)
    } finally {
      setIsUpdatingHandle(false)
    }
  }

  const userInfo = [
    {
      label: "GitHub Username",
      value: account?.github_username || "Not available",
    },
    {
      label: "tscircuit Handle",
      value: isLoadingAccount
        ? "Loading..."
        : account?.tscircuit_handle || "Not set",
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
                  Public profile
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Update your tscircuit handle used across your profile.
                </p>
              </div>
              {isHandleRequired && !account?.tscircuit_handle && (
                <div className="px-6 lg:px-8 pt-4">
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                    Finish authentication by selecting a handle below. You’ll be
                    redirected once it’s saved.
                  </div>
                </div>
              )}
              <form
                onSubmit={handleHandleSubmit}
                className="p-6 lg:p-8 space-y-4"
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="tscircuit-handle"
                    className="text-sm font-semibold text-gray-900"
                  >
                    tscircuit handle
                  </Label>
                  <Input
                    id="tscircuit-handle"
                    spellCheck={false}
                    autoComplete="off"
                    value={handleInput}
                    onChange={handleInputChange}
                    disabled={isUpdatingHandle || isLoadingAccount || !account}
                    className={`h-11 ${
                      handleError
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus-border-blue-500 focus:ring-blue-500"
                    }`}
                  />
                  {handleError && (
                    <p className="text-sm text-red-600">{handleError}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      isUpdatingHandle ||
                      isLoadingAccount ||
                      !account ||
                      !hasHandleChanged
                    }
                  >
                    {isUpdatingHandle ? "Saving..." : "Save handle"}
                  </Button>
                </div>
              </form>
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
