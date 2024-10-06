import { useQuery } from "react-query"
import { useAxios } from "./use-axios"

interface AccountBalance {
  monthly_ai_budget_used_usd: number
}

export const useAccountBalance = () => {
  const axios = useAxios()

  return useQuery<AccountBalance, Error>(
    "accountBalance",
    async () => {
      const { data } = await axios.get("/accounts/get_account_balance")
      return data.account_balance
    },
    {
      refetchInterval: 60000, // Refetch every minute
    },
  )
}
