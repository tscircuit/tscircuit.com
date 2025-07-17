export const useIsUsingFakeApi = () => {
  return import.meta.env.VITE_USE_FAKE_API === "true"
}
