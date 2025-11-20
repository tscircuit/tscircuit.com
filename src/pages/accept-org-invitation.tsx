import { useLocation, useSearch } from "wouter"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { useOrgInvitation } from "@/hooks/use-org-invitation"
import { useAcceptOrgInvitationMutation } from "@/hooks/use-accept-org-invitation-mutation"
import { useGlobalStore } from "@/hooks/use-global-store"
import { OrgAuthProviderButtons } from "@/components/org-auth/OrgAuthProviderButtons"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Mail,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

export default function AcceptOrgInvitationPage() {
  const searchParams = new URLSearchParams(useSearch())
  const token = searchParams.get("token")
  const session = useGlobalStore((s) => s.session)
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const { data, isLoading, error } = useOrgInvitation({
    token: token || undefined,
  })
  const acceptMutation = useAcceptOrgInvitationMutation({
    onSuccess: (data) => {
      toast({
        title: "Successfully joined organization",
        description: `You've joined ${data.org.org_display_name || data.org.org_name || "the organization"}!`,
      })
      setLocation(`/${data.org.org_name || "dashboard"}`)
    },
    onError: (error: any) => {
      const errorMessage =
        error?.data?.error?.message || "Failed to accept invitation"
      toast({
        title: "Failed to accept invitation",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Invitation Link
            </h1>
            <p className="text-gray-600">
              This invitation link is missing required information.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
            <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading invitation...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Not Found
            </h1>
            <p className="text-gray-600">
              This invitation link is invalid or has expired.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const { invitation } = data

  // Show status messages for non-pending invitations
  if (invitation.is_revoked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Cancelled
            </h1>
            <p className="text-gray-600">
              This invitation was cancelled by an organization manager.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (invitation.is_accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Already Accepted
            </h1>
            <p className="text-gray-600 mb-6">
              You've already joined this organization.
            </p>
            <Button
              onClick={() =>
                setLocation(`/${invitation.org.org_name || "dashboard"}`)
              }
            >
              Go to{" "}
              {invitation.org.org_display_name ||
                invitation.org.org_name ||
                "Organization"}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (invitation.is_expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Expired
            </h1>
            <p className="text-gray-600">
              This invitation expired on{" "}
              {new Date(invitation.expires_at).toLocaleDateString()}.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const inviterName =
    invitation.inviter.tscircuit_handle ||
    invitation.inviter.github_username ||
    "Someone"

  // If not authenticated, show login UI
  if (!session) {
    const redirectPath = window.location.pathname + window.location.search

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-6">
              <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Sign in to Accept Invitation
              </h1>
              <p className="text-gray-600">
                {inviterName} invited you to join{" "}
                <span className="font-semibold">
                  {invitation.org.org_display_name || invitation.org.org_name}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <OrgAuthProviderButtons redirectPath={redirectPath} />
            </div>

            <p className="text-xs text-gray-500 text-center">
              Sign in to view invitation details and accept
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-6">
            <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Organization Invitation
            </h1>
            <p className="text-gray-600">
              You've been invited to join an organization
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">
                  Organization
                </p>
                <p className="text-sm text-gray-900 font-semibold">
                  {invitation.org.org_display_name || invitation.org.org_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Invited by</p>
                <p className="text-sm text-gray-900">{inviterName}</p>
              </div>
            </div>

            {invitation.invitee_email && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    Invited email
                  </p>
                  <p className="text-sm text-gray-900">
                    {invitation.invitee_email}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700">Expires</p>
                <p className="text-sm text-gray-900">
                  {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => acceptMutation.mutate({ invitationToken: token })}
            disabled={acceptMutation.isLoading}
            className="w-full"
          >
            {acceptMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By accepting, you'll become a member of this organization
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
