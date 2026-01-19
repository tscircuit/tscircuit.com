export const useApiBaseUrl = () => {
  return import.meta.env.VITE_SNIPPETS_API_URL ?? "/api"
}
