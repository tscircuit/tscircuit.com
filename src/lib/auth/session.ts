import { decodeJwt, type JWTPayload } from "jose"
import type { Store } from "@/hooks/use-global-store"

type TscircuitSessionJwtPayload = JWTPayload &
  Partial<Omit<NonNullable<Store["session"]>, "token">>

const isTruthyStaffClaim = (value: boolean | string | undefined) =>
  value === true || value === "true"

export const decodeTscircuitSessionJwt = (
  token: string,
): TscircuitSessionJwtPayload | null => {
  try {
    return decodeJwt(token) as TscircuitSessionJwtPayload
  } catch {
    return null
  }
}

export const getSessionFromJwt = (
  token: string,
  overrides: Partial<NonNullable<Store["session"]>> = {},
): Store["session"] | null => {
  const decodedToken = decodeTscircuitSessionJwt(token)
  if (!decodedToken) return null

  return {
    ...(decodedToken as any),
    ...overrides,
    token,
    github_username:
      overrides.github_username ??
      decodedToken.github_username ??
      decodedToken.tscircuit_handle ??
      null,
    tscircuit_handle:
      overrides.tscircuit_handle ?? decodedToken.tscircuit_handle,
    is_tscircuit_staff: isTruthyStaffClaim(
      overrides.is_tscircuit_staff ?? decodedToken.is_tscircuit_staff,
    ),
  }
}
