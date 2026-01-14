import { useQuery } from "react-query"

export interface ServiceCheck {
  service: string
  status: "ok" | "error"
  error?: string
}

export interface StatusLog {
  timestamp: string
  checks: ServiceCheck[]
}

export const useUsercodeApiStatus = () => {
  return useQuery<StatusLog | null>(
    ["usercode-status"],
    async () => {
      const response = await fetch(
        "https://raw.githubusercontent.com/tscircuit/status/refs/heads/main/latest_statuses.jsonl",
      )
      if (!response.ok) {
        throw new Error("Failed to fetch status")
      }
      const text = await response.text()
      const lines = text.split("\n").filter((line) => line.trim() !== "")
      if (lines.length === 0) return null

      // Parse the last line as it contains the latest status
      try {
        return JSON.parse(lines[lines.length - 1])
      } catch (e) {
        console.error("Failed to parse status log", e)
        return null
      }
    },
    {
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  )
}
