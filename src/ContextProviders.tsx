import { QueryClient, QueryClientProvider } from "react-query"
import { HelmetProvider } from "react-helmet-async"
import { useEffect, useState } from "react"

const queryClient = new QueryClient()

// Create a context object for server-side rendering
const helmetContext = {}

export const ContextProviders = ({ children }: any) => {
  const [isClient, setIsClient] = useState(false)
  
  // Detect if we're running on the client
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider context={helmetContext}>{children}</HelmetProvider>
    </QueryClientProvider>
  )
}
