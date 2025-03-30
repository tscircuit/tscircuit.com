import { QueryClient, QueryClientProvider } from "react-query"
import { HelmetProvider } from "react-helmet-async"

const queryClient = new QueryClient()

export const ContextProviders = ({ children }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>{children}</HelmetProvider>
    </QueryClientProvider>
  )
}
