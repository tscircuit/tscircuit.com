import type { Middleware } from "winterspec/middleware"
import type { CtxErrorFn } from "./with-ctx-error"

export const withSessionAuth: Middleware<
  {
    error: CtxErrorFn
    db: any
  },
  {
    auth: {
      type: "session"
      account_id: string
      personal_org_id: string
      github_username: string
      session_id: string
    }
  },
  {}
> = async (req, ctx, next) => {
  if (req.method === "OPTIONS") return next(req, ctx)

  const token = req.headers.get("authorization")?.split("Bearer ")?.[1]

  if (!token) {
    return ctx.error(401, {
      error_code: "no_token",
      message: "No token provided",
    })
  }

  // In testing mode, the token is the account_id
  const account = ctx.db.accounts.find((acc: any) => acc.account_id === token)

  if (!account) {
    return ctx.error(401, {
      error_code: "invalid_token",
      message: "Invalid token provided",
    })
  }

  ctx.auth = {
    type: "session",
    account_id: account.account_id,
    personal_org_id: `org-${account.account_id}`,
    github_username: account.github_username,
    session_id: `session-${account.account_id}`,
  }

  return next(req, ctx)
}
