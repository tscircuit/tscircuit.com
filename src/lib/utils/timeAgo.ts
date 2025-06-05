import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en"

TimeAgo.addDefaultLocale(en)

export const timeAgo = (
  date: Date | string | null | undefined,
  fallback = "???",
) => {
  if (!date) return fallback
  if (typeof date === "string") {
    date = new Date(date)
  }
  try {
    const timeAgo = new TimeAgo("en-US")
    return timeAgo.format(date)
  } catch (error) {
    return fallback
  }
}
