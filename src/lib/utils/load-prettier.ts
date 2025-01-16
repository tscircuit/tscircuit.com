export async function loadPrettier() {
  if (window.prettier) return

  await Promise.all([
    loadScript("https://unpkg.com/prettier@2.8.8/standalone.js"),
    loadScript("https://unpkg.com/prettier@2.8.8/parser-typescript.js"),
  ])
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}
