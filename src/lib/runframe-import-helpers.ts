import type { useAxios } from "@/hooks/use-axios"

type SessionLike = { token?: string } | null | undefined

export const buildProxyRequestHeaders = (
  session?: SessionLike,
): Record<string, string> => {
  const headers: Record<string, string> = {}
  if (session?.token) headers["Authorization"] = `Bearer ${session.token}`
  return headers
}

type UseAxiosInstance = ReturnType<typeof useAxios>

export const importJlcpcbAndNavigate = async (
  axios: UseAxiosInstance,
  component: any,
) => {
  if (!component || component.source !== "jlcpcb") return false
  const partNumber = component.partNumber || component.name
  const response = await axios.post("/packages/generate_from_jlcpcb", {
    jlcpcb_part_number: partNumber,
  })
  const pkgId = response?.data?.package?.package_id
  if (pkgId) {
    window.location.href = `/editor?package_id=${pkgId}`
  }
  return true
}
