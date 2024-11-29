import { useGlobalStore } from "@/hooks/use-global-store"
import { useSnippetsBaseApiUrl } from "@/hooks/use-snippets-base-api-url"
import { useState } from "react"
import { useLocation } from "wouter"

export const DevLoginPage = () => {
  const snippetsBaseApiUrl = useSnippetsBaseApiUrl()
  const [username, setUsername] = useState("")
  const setSession = useGlobalStore((s) => s.setSession)
  const [, setLocation] = useLocation()

  const handleDevLogin = async () => {
    try {
      // Call passwordless login endpoint
      const response = await fetch(
        `${snippetsBaseApiUrl}/sessions/create_passwordless`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            github_username: username,
          }),
        },
      )

      const data = await response.json()
      const token = data.session.token

      if (!token) {
        throw new Error("No token received from server")
      }

      // Set session in global store
      setSession({
        token,
        account_id: data.session.account_id,
        session_id: data.session.session_id,
        github_username: username,
      })

      // Redirect to home page
      setLocation("/")
    } catch (error) {
      console.error("Dev login failed:", error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Development Login</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter GitHub username"
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handleDevLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Login
      </button>
    </div>
  )
}
