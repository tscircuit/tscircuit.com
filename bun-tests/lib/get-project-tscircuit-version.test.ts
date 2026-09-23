import { expect, test } from "bun:test"
import { getProjectTscircuitVersion } from "@/lib/get-project-tscircuit-version"

const manifest = (version: string) =>
  JSON.stringify({ devDependencies: { tscircuit: version } })
const npmLock = (version: string) =>
  JSON.stringify({ packages: { "node_modules/tscircuit": { version } } })

test("projects without a runtime dependency keep the default runtime", () => {
  expect(getProjectTscircuitVersion({})).toBeUndefined()
  expect(getProjectTscircuitVersion({ "package.json": "{}" })).toBeUndefined()
})

test("uses exact pins in dependencies or devDependencies", () => {
  expect(
    getProjectTscircuitVersion({ "package.json": manifest("0.0.2617") }),
  ).toBe("0.0.2617")
  expect(
    getProjectTscircuitVersion({
      "package.json": JSON.stringify({
        dependencies: { tscircuit: "0.0.2616" },
        devDependencies: { tscircuit: "0.0.2617" },
      }),
    }),
  ).toBe("0.0.2616")
})

test("uses the installed version from npm rather than the range minimum", () => {
  expect(
    getProjectTscircuitVersion({
      "package.json": manifest("^0.0.2617"),
      "package-lock.json": npmLock("0.0.2617"),
    }),
  ).toBe("0.0.2617")
  expect(
    getProjectTscircuitVersion({
      "package.json": manifest("~0.0.2600"),
      "package-lock.json": npmLock("0.0.2617"),
    }),
  ).toBe("0.0.2617")
})

test("reads Bun's JSONC lockfile with comments and trailing commas", () => {
  expect(
    getProjectTscircuitVersion({
      "package.json": manifest("~0.0.2600"),
      "bun.lock": `{
      // Installed version, not the minimum in package.json
      "packages": { "tscircuit": ["tscircuit@0.0.2617", "", {}, "hash"], },
    }`,
    }),
  ).toBe("0.0.2617")
})

test("rejects conflicting lockfiles and stale versions", () => {
  expect(() =>
    getProjectTscircuitVersion({
      "package.json": manifest("~0.0.2600"),
      "bun.lock": '{"packages":{"tscircuit":["tscircuit@0.0.2616"]}}',
      "package-lock.json": npmLock("0.0.2617"),
    }),
  ).toThrow("lockfiles disagree")
  expect(() =>
    getProjectTscircuitVersion({
      "package.json": manifest("0.0.2617"),
      "package-lock.json": npmLock("0.0.2616"),
    }),
  ).toThrow("up-to-date")
})

test("never silently substitutes latest for an unresolved dependency", () => {
  for (const version of [
    "^0.0.2617",
    "latest",
    "file:../tscircuit",
    "https://example.com/runtime.tgz",
  ]) {
    expect(() =>
      getProjectTscircuitVersion({ "package.json": manifest(version) }),
    ).toThrow("Pin an exact")
  }
  expect(() => getProjectTscircuitVersion({ "package.json": "{" })).toThrow()
})

test("supports prereleases and npm v1 lockfiles", () => {
  expect(
    getProjectTscircuitVersion({ "package.json": manifest("0.0.2617-beta.1") }),
  ).toBe("0.0.2617-beta.1")
  expect(
    getProjectTscircuitVersion({
      "package.json": manifest("~0.0.2600"),
      "package-lock.json": JSON.stringify({
        dependencies: { tscircuit: { version: "0.0.2617" } },
      }),
    }),
  ).toBe("0.0.2617")
})
