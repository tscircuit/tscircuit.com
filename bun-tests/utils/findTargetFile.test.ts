import { expect, test } from "bun:test"
import { findTargetFile } from "@/lib/utils/findTargetFile"
import type { PackageFile } from "@/types/package"

test("findTargetFile selects index.tsx from provided file list", () => {
  const files: PackageFile[] = [
    { path: "Integrated-circuit.tsx", content: "export const IC = () => ()" },
    { path: "README.md", content: "# Readme" },
    { path: "index.tsx", content: `
        import { IC } from "./Integrated-circuit"
        export default () => (
            <board></board>
        )
    ` },
  ]

  const target = findTargetFile({ files, filePathFromUrl: null })

  expect(target?.path).toBe("index.tsx")
})


