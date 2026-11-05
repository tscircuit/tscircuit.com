export const getFabricationPartsEngine = async ({
  apiBaseUrl,
  token,
  platformFetch,
}: {
  apiBaseUrl: string
  token?: string
  platformFetch?: typeof fetch
}) => {
  const { JlcPcbPartsEngine } = await import("@tscircuit/parts-engine")
  return new JlcPcbPartsEngine({
    platformFetch,
    easyEdaProxyConfig: {
      proxyEndpointUrl: `${apiBaseUrl}/proxy`,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  })
}
