export const formatLogTimestamp = (timestamp?: string) => {
  if (timestamp === undefined) return null

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp

  const millis = String(date.getMilliseconds()).padStart(3, "0")
  return `${date.toLocaleTimeString("en-US", { hour12: false })}.${millis}`
}
