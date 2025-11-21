import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useState } from "react"
import { Link } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAxios } from "@/hooks/use-axios"
import { OrgAuthProviderButtons } from "@/components/org-auth/OrgAuthProviderButtons"

const OrgLoginContent = () => {
  const session = useGlobalStore((s) => s.session)
  const setSession = useGlobalStore((s) => s.setSession)
  const axios = useAxios()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await axios.post("/sessions/delete")
    } catch (error) {
      console.error("Failed to sign out", error)
    } finally {
      setSession(null)
      setIsSigningOut(false)
    }
  }

  if (session) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
            <div>
              <p className="text-sm uppercase text-blue-500 font-semibold">
                Already signed in
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                You're signed in as @{session.github_username}
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/${session.github_username}`}
                className="flex-1 inline-flex justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
              >
                View Profile
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 inline-flex justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-70"
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-3xl">
        <div className="grid gap-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
            <div>
              <p className="text-sm uppercase text-blue-500 font-semibold">
                Organization Access
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                Sign in with your company identity
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Pick the provider that matches your company's setup and we'll
                sign you in.
              </p>
            </div>
            <OrgAuthProviderButtons />
            <p className="text-xs text-gray-400">
              By continuing you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export const OrgLoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <OrgLoginContent />
      <Footer />
    </div>
  )
}

export default OrgLoginPage
