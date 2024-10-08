export const useIsUsingFakeApi = () => {
  return Boolean(import.meta.env.VITE_USE_FAKE_API)
}
