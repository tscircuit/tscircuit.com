export function getTsciAddCommand(
  packageName: string,
  version?: string | null,
) {
  if (!version) return `tsci add ${packageName}`
  const npmName =
    packageName.startsWith("@") || !packageName.includes("/")
      ? packageName
      : `@tsci/${packageName.replace("/", ".")}`
  return `tsci add ${npmName}@${version}`
}
