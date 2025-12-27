import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Link, Redirect } from "wouter"
import { useGlobalStore } from "@/hooks/use-global-store"
import { AuthProviderButtons } from "@/components/auth/AuthProviderButtons"
import { useLogout } from "@/hooks/use-logout"

const LoginContent = () => {
  const session = useGlobalStore((s) => s.session)
  // const { handleLogout: handleSignOut, isSigningOut } = useLogout()

  if (session) {
    return <Redirect to={`/settings`} />
    // return (
    //   <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50">
    //     <div className="w-full max-w-2xl">
    //       <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
    //         <div>
    //           <h1 className="text-3xl font-bold text-gray-900 mt-2">
    //             You're signed in as @{session.github_username}
    //           </h1>
    //         </div>
    //         <div className="flex flex-col sm:flex-row gap-3">
    //           <Link
    //             href={`/${session.github_username}`}
    //             className="flex-1 inline-flex justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
    //           >
    //             View Profile
    //           </Link>
    //           <button
    //             type="button"
    //             onClick={handleSignOut}
    //             disabled={isSigningOut}
    //             className="flex-1 inline-flex justify-center rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-70"
    //           >
    //             {isSigningOut ? "Signing out..." : "Sign out"}
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   </main>
    // )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-3xl">
        <div className="grid gap-8">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                Sign in to get started
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Choose your preferred sign-in method to continue.
              </p>
            </div>
            <AuthProviderButtons />
            <p className="text-xs text-gray-400">
              By continuing you agree to our{" "}
              <a
                target="_blank"
                href="https://tscircuit.com/legal/terms-of-service"
                className="underline hover:no-underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                target="_blank"
                href="https://tscircuit.com/legal/privacy-policy"
                className="underline hover:no-underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <LoginContent />
      <Footer />
    </div>
  )
}

export default LoginPage
