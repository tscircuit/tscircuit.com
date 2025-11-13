import { useMutation, useQueryClient } from "react-query"
import { useAxios } from "@/hooks/use-axios"
import { useGlobalStore } from "@/hooks/use-global-store"
import type { Account } from "fake-snippets-api/lib/db/schema"

export interface UpdateAccountParams {
  tscircuit_handle?: string
}

export const useUpdateAccountMutation = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (account: Account) => void
  onError?: (error: any) => void
} = {}) => {
  const axios = useAxios()
  const session = useGlobalStore((s) => s.session)
  const setSession = useGlobalStore((s) => s.setSession)
  const queryClient = useQueryClient()

  return useMutation<Account, any, UpdateAccountParams>(
    ["updateAccount"],
    async ({ tscircuit_handle }) => {
      if (!session) throw new Error("No session")

      const {
        data: { account: updatedAccount },
      } = await axios.post("/accounts/update", {
        tscircuit_handle,
      })

      if (!updatedAccount) {
        throw new Error("Failed to update account")
      }

      return updatedAccount
    },
    {
      onSuccess: (account: Account) => {
        queryClient.invalidateQueries(["current-account"])

        if (session && account.tscircuit_handle !== undefined) {
          setSession({
            ...session,
            tscircuit_handle: account.tscircuit_handle,
          })
        }

        onSuccess?.(account)
      },
      onError: (error: any) => {
        console.error("Error updating account:", error)
        onError?.(error)
      },
    },
  )
}
