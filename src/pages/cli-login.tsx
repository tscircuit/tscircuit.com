import { useState } from "react"
import { Redirect, useSearch } from "wouter"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useGlobalStore } from "@/hooks/use-global-store"
import { useAxios } from "@/hooks/use-axios"
import { useToast } from "@/hooks/use-toast"
import { useSignIn } from "@/hooks/use-sign-in"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function CliLoginPage() {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [expired, setExpired] = useState(false)
  const session = useGlobalStore((s) => s.session)
  const axios = useAxios()
  const { toast } = useToast()
  const signIn = useSignIn()
  const searchParams = new URLSearchParams(useSearch())
  const login_page_id = searchParams.get("login_page_id")
  const login_page_auth_token = searchParams.get("login_page_auth_token")

  const handleLogin = async () => {
    setLoading(true)
    try {
      await axios.post("/sessions/login_page/login_with_session", {
        login_page_id,
        login_page_auth_token,
      })
      toast({
        title: "Logged in!",
        description: "You can now return to your terminal.",
      })
      setComplete(true)
    } catch (error: any) {
      if (error?.status == 400) {
        setExpired(true)
      } else {
        const message =
          error?.data?.error?.message ||
          "An error occurred while logging in. Please try again."
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!login_page_id || !login_page_auth_token) {
    return <Redirect to="/" />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          {!complete && !expired && (
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">CLI Login</CardTitle>
                </div>
                {session ? (
                  <CardDescription className="text-base">
                    Authorize terminal access for{" "}
                    <span className="font-semibold">
                      {session.github_username}
                    </span>
                  </CardDescription>
                ) : (
                  <CardDescription className="text-base">
                    Sign in to authorize your terminal
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {session ? (
                  <Button
                    disabled={loading}
                    onClick={handleLogin}
                    className="w-full"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <span>Authorize CLI Access</span>
                  </Button>
                ) : (
                  <Button onClick={signIn} className="w-full">
<<<<<<< HEAD
                    <span>Sign In with GitHub</span>
=======
                    <span>Sign In</span>
>>>>>>> origin/main
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          {complete && (
            <Card className="w-full max-w-md">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-blue-100">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Login Successful!</CardTitle>
                <CardDescription className="text-base">
                  Return to your terminal to continue
                </CardDescription>
              </CardHeader>
            </Card>
          )}
          {expired && (
            <Card className="w-full max-w-md">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-red-100">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-xl">Login Page Expired</CardTitle>
                <CardDescription className="text-base">
                  This login link has expired. Please request a new one from
                  your terminal
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
