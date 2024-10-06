import type { Middleware } from "winterspec/middleware"
import { CtxErrorFn } from "./with-ctx-error"

export const withSessionAuth: Middleware<
  {
    error: CtxErrorFn
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

  ctx.auth = {
    type: "session",
    account_id: "account-1234",
    personal_org_id: "org-1234",
    github_username: "testuser",
    session_id: "session-1234",
  }

  return next(req, ctx)
}
