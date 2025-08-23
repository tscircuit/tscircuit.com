export const isComponentExported = (code: string) => {
  return (
    /export function\s+\w+/.test(code) ||
    /export const\s+\w+\s*=/.test(code) ||
    /export default\s+\w+/.test(code) ||
    /export default\s+function\s*(\w*)\s*\(/.test(code) ||
    /export default\s*\(\s*\)\s*=>/.test(code) ||
    /export default\s*\(.*?\)\s*=>/.test(code)
  )
}
