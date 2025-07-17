export const useSnippetsBaseApiUrl = () => {
  return import.meta.env.VITE_SNIPPETS_API_URL ?? "/api"
}
