import type { Middleware } from "winterspec/middleware"
import type { CtxErrorFn } from "./with-ctx-error"
import type { DbClient } from "../db/db-client"

export const withSessionAuth: Middleware<
  {
    error: CtxErrorFn
    db: DbClient
  },
  {
    auth: {
      type: "session"
      account_id: string
      personal_org_id: string
      github_username: string
      session_id: string
      orgs: Array<{
        org_id: string
        name: string
        user_permissions: {
          can_manage_packages: boolean
        }
      }>
    }
  },
  {}
> = async (req, ctx, next) => {
  if (req.method === "OPTIONS") return next(req, ctx)

  const token = req.headers.get("authorization")?.split("Bearer ")?.[1]

  // Only check database accounts when we're in a Bun test environment
  if (process.env.BUN_TEST === "true" && ctx.db?.getState) {
    const state = ctx.db.getState()
    const account = state.accounts.find((acc: any) => acc.account_id === token)
    if (account) {
      // Fetch orgs for this account
      const orgAccounts = state.orgAccounts.filter(
        (oa: any) => oa.account_id === account.account_id,
      )

      const orgs = orgAccounts.map((oa: any) => {
        const org = state.organizations.find((o: any) => o.org_id === oa.org_id)
        return {
          org_id: oa.org_id,
          name:
            org?.org_display_name ||
            org?.org_name ||
            org?.github_handle ||
            oa.org_id,
          user_permissions: { can_manage_packages: true },
        }
      })

      ctx.auth = {
        type: "session",
        account_id: account.account_id,
        personal_org_id: account.personal_org_id || `org-${account.account_id}`,
        github_username: account.github_username,
        session_id: `session-${account.account_id}`,
        orgs:
          orgs.length > 0
            ? orgs
            : [
                {
                  org_id:
                    account.personal_org_id || `org-${account.account_id}`,
                  name:
                    account.github_username ||
                    account.personal_org_id ||
                    `org-${account.account_id}`,
                  user_permissions: { can_manage_packages: true },
                },
              ],
      }
      return next(req, ctx)
    }
  }

  // Fallback auth for non-test environments or when no token is found
  const fallbackAccountId = "account-1234"
  const fallbackOrgId = "org-1234"

  const fallbackOrgs = [
    {
      org_id: fallbackOrgId,
      name: "org-1234",
      user_permissions: { can_manage_packages: true },
    },
  ]

  ctx.auth = {
    type: "session",
    account_id: fallbackAccountId,
    personal_org_id: fallbackOrgId,
    github_username: "testuser",
    session_id: "session-1234",
    orgs: fallbackOrgs,
  }

  return next(req, ctx)
}
