export const DEFAULT_CODE = `
export default () => (
  <board width="10mm" height="10mm">
    {/* write your code here! */}
  </board>
)
`.trim()

export const generateRandomPackageName = () =>
  `untitled-package-${Math.floor(Math.random() * 900) + 100}`
