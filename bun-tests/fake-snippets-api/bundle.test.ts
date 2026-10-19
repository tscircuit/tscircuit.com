import { expect, test } from "bun:test"
import { resolve } from "node:path"

test("the published registry bundle includes MIME lookup and its database", async () => {
  const root = resolve(import.meta.dir, "../..")
  const result = Bun.spawnSync(["bun", "run", "build:fake-api:bundle"], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  })
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString())
  }

  const source = await Bun.file(resolve(root, "dist/bundle.js")).text()
  const imports = new Bun.Transpiler({ loader: "js" })
    .scanImports(source)
    .map((entry) => entry.path)

  expect(imports).not.toContain("mime-types")
  expect(imports).not.toContain("mime-db")
}, 30_000)
