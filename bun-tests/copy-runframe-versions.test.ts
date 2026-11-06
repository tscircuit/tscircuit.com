import { expect, test } from "bun:test"
import { mkdtemp, mkdir, copyFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

test("runframe updates synchronize the viewers and their core/props runtime dependencies", async () => {
  const directory = await mkdtemp(join(tmpdir(), "runframe-versions-"))
  try {
    await mkdir(join(directory, "scripts"))
    await mkdir(join(directory, "node_modules/@tscircuit/runframe"), {
      recursive: true,
    })
    await copyFile(
      join(import.meta.dir, "../scripts/copy-runframe-versions.ts"),
      join(directory, "scripts/copy-runframe-versions.ts"),
    )
    await Bun.write(
      join(directory, "package.json"),
      JSON.stringify({
        dependencies: { "@tscircuit/3d-viewer": "^0.0.636" },
        devDependencies: {
          "@tscircuit/props": "^0.0.698",
          unrelated: "1.0.0",
        },
      }),
    )
    await Bun.write(
      join(directory, "node_modules/@tscircuit/runframe/package.json"),
      JSON.stringify({
        dependencies: { "@tscircuit/core": "^0.0.2234" },
        devDependencies: {
          "@tscircuit/3d-viewer": "^0.0.643",
          "@tscircuit/props": "^0.0.714",
        },
      }),
    )
    const run = () =>
      Bun.spawnSync([process.execPath, "scripts/copy-runframe-versions.ts"], {
        cwd: directory,
        env: process.env,
      })
    const firstRun = run()
    expect(firstRun.stderr.toString()).toBe("")
    expect(firstRun.exitCode).toBe(0)
    const packageFile = Bun.file(join(directory, "package.json"))
    expect(await packageFile.json()).toEqual({
      dependencies: { "@tscircuit/3d-viewer": "^0.0.643" },
      devDependencies: {
        "@tscircuit/core": "^0.0.2234",
        "@tscircuit/props": "^0.0.714",
        unrelated: "1.0.0",
      },
    })
    const text = await packageFile.text()
    expect(run().exitCode).toBe(0)
    expect(await packageFile.text()).toBe(text)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
