import { describe, expect, test } from "bun:test"
import { findPriorityFilePath } from "@/lib/utils/findPriorityFilePath"
import { findTargetFile } from "@/lib/utils/findTargetFile"

const metadata = (...paths: string[]) =>
  paths.map((file_path) => ({ file_path }))

const packageFiles = (...paths: string[]) =>
  paths.map((path) => ({ path, content: "" }))

const lockfiles = [
  "bun.lock",
  "bun.lockb",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]

describe("findPriorityFilePath", () => {
  test("opens the circuit entrypoint for the reported package file order", () => {
    expect(
      findPriorityFilePath(
        metadata(
          "bun.lock",
          "dist/index.js",
          "imports/AP2112K_3_3TRG1.tsx",
          "index.circuit.tsx",
          "package.json",
          "tscircuit.config.json",
          "tsconfig.json",
        ),
      ),
    ).toBe("index.circuit.tsx")
  })

  test.each([
    "index.tsx",
    "index.ts",
    "index.circuit.tsx",
    "src/board.circuit.tsx",
    "main.tsx",
    "main.ts",
    "Board.tsx",
  ])("prefers %s over lockfiles and package metadata", (entrypoint) => {
    expect(
      findPriorityFilePath(metadata(...lockfiles, "package.json", entrypoint)),
    ).toBe(entrypoint)
  })

  test("uses the same entrypoint precedence as the editor", () => {
    const paths = [
      "bun.lock",
      "Board.tsx",
      "main.ts",
      "board.circuit.tsx",
      "index.tsx",
    ]

    while (paths.length > 1) {
      expect(findPriorityFilePath(metadata(...paths))).toBe(
        findTargetFile({
          files: packageFiles(...paths),
          filePathFromUrl: null,
        })?.path ?? null,
      )
      paths.pop()
    }
  })

  test.each(lockfiles)("does not fall back to %s", (lockfile) => {
    expect(findPriorityFilePath(metadata(lockfile, "README.md"))).toBe(
      "README.md",
    )
  })

  test("skips generated and hidden files, including nested lockfiles", () => {
    expect(
      findPriorityFilePath(
        metadata(
          "dist/index.tsx",
          ".github/workflows/build.yml",
          "nested/bun.lock",
          "README.md",
        ),
      ),
    ).toBe("README.md")
  })

  test.each([
    { paths: [] },
    { paths: lockfiles },
    { paths: ["dist/index.tsx", "nested/bun.lock"] },
  ])("returns null when no default file is eligible: %j", ({ paths }) => {
    expect(findPriorityFilePath(metadata(...paths))).toBeNull()
  })

  test("keeps an explicitly requested lockfile accessible", () => {
    expect(
      findPriorityFilePath(
        metadata("index.circuit.tsx", "bun.lock"),
        "bun.lock",
      ),
    ).toBe("bun.lock")
  })

  test("preserves exact and partial URL file selection", () => {
    const files = metadata("bun.lock", "index.tsx", "src/helper.ts")

    expect(findPriorityFilePath(files, "src/helper.ts")).toBe("src/helper.ts")
    expect(findPriorityFilePath(files, "helper.ts")).toBe("src/helper.ts")
  })

  test("uses a safe default when the requested file does not exist", () => {
    expect(
      findPriorityFilePath(
        metadata("bun.lock", "index.circuit.tsx"),
        "missing.tsx",
      ),
    ).toBe("index.circuit.tsx")
  })
})

describe("findTargetFile default fallback", () => {
  test("does not select a lockfile when the URL file is missing", () => {
    expect(
      findTargetFile({
        files: packageFiles("bun.lock", "README.md"),
        filePathFromUrl: "missing.tsx",
      })?.path,
    ).toBe("README.md")
  })

  test("returns null for a lockfile-only package with a missing URL file", () => {
    expect(
      findTargetFile({
        files: packageFiles(...lockfiles),
        filePathFromUrl: "missing.tsx",
      }),
    ).toBeNull()
  })

  test("allows opening a lockfile explicitly", () => {
    expect(
      findTargetFile({
        files: packageFiles("bun.lock", "index.circuit.tsx"),
        filePathFromUrl: "bun.lock",
      })?.path,
    ).toBe("bun.lock")
  })

  test("still honors a configured entrypoint when content is loaded", () => {
    expect(
      findTargetFile({
        files: [
          ...packageFiles("bun.lock", "index.tsx", "src/board.tsx"),
          {
            path: "tscircuit.config.json",
            content: JSON.stringify({ mainEntrypoint: "./src/board.tsx" }),
          },
        ],
        filePathFromUrl: null,
      })?.path,
    ).toBe("src/board.tsx")
  })
})
