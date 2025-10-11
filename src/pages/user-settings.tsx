import { useState } from "react"
import { useLocation, Redirect } from "wouter"
import { Helmet } from "react-helmet-async"
import { Button } from "@/components/ui/button"
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
import { useGlobalStore } from "@/hooks/use-global-store"
import { useHydration } from "@/hooks/use-hydration"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FullPageLoader } from "@/App"

export default function UserSettingsPage() {
  const [, navigate] = useLocation()
  const { toast } = useToast()
  const session = useGlobalStore((s) => s.session)
  const hasHydrated = useHydration()

  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)

  if (!hasHydrated) {
    return <FullPageLoader />
  }

  if (!session) {
    return <Redirect to="/" />
  }

  const pageTitle = "User Settings - tscircuit"

  const handleDeleteAccount = () => {
    setShowDeleteAccountDialog(true)
  }

  const confirmDeleteAccount = () => {
    // TODO: Implement delete account functionality
    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted.",
    })
    navigate("/")
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
                <AvatarFallback className="text-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-medium">
                  {(session.github_username || session.account_id || "")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Account Settings
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your account preferences and settings
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-red-200 rounded-xl shadow-sm">
              <div className="px-6 py-5 border-b border-red-200 bg-red-50 rounded-t-xl">
                <h2 className="text-xl font-semibold text-red-900">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-600 mt-2">
                  Irreversible and destructive actions for your account.
                </p>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete your account? This
              action is permanent and cannot be undone. All your packages,
              snippets, and account data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
              disabled={true}
              className="bg-red-600 hover:bg-red-700"
            >
              {false && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
