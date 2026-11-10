import { expect, test } from "bun:test"
import {
  loadReferenceDesignCatalog,
  referenceDesignsForPart,
} from "@/lib/reference-design-catalog"

test("adding names discovers parts from builds without a chip association table", async () => {
  const calls: string[] = []
  const get = async (path: string, { params }: any) => {
    calls.push(path)
    if (path === "/packages/get")
      return { data: { package: { last_built_release_id: params.name } } }
    if (path === "/package_files/list")
      return {
        data: {
          package_files:
            params.package_release_id === "maker/parametric"
              ? [
                  {
                    file_path: "dist/preview.json",
                    package_file_id: "metadata",
                  },
                ]
              : [],
        },
      }
    if (path === "/package_files/get")
      return {
        data: {
          package_file: {
            content_text: JSON.stringify({
              version: 2,
              propsSchemaPath: "dist/props.schema.json",
              componentPartNumbers: ["TOTALLY-DIFFERENT-123"],
              bundlePath: "dist/bundle.gz",
              variants: [
                {
                  values: {},
                  circuitJsonPath: "dist/index/circuit.json",
                  glbPath: "dist/index/3d.glb",
                },
              ],
            }),
          },
        },
      }
    return {
      data: {
        preview_circuit_json_response: {
          circuit_json: [
            { type: "source_component", manufacturer_part_number: "OTHER456" },
          ],
        },
      },
    }
  }
  const names = ["maker/parametric", "maker/static"]
  const { entries, failed } = await loadReferenceDesignCatalog(names, get)
  expect(failed).toEqual([])
  expect(
    referenceDesignsForPart(entries, names, "totally-different-123"),
  ).toEqual(["maker/parametric"])
  expect(referenceDesignsForPart(entries, names, "OTHER456")).toEqual([
    "maker/static",
  ])
  expect(
    referenceDesignsForPart(entries, names, "TOTALLYDIFFERENT123"),
  ).toEqual([])
  expect(
    calls.filter(
      (path) => path === "/package_releases/get_preview_circuit_json",
    ),
  ).toHaveLength(1)
})
test("a failed package does not hide other packages, ordering follows the name list, and work is bounded", async () => {
  let active = 0,
    maximum = 0
  const names = [
    "maker/one",
    "maker/broken",
    "maker/two",
    "maker/three",
    "maker/four",
  ]
  const get = async (path: string, { params }: any) => {
    active++
    maximum = Math.max(active, maximum)
    await new Promise((resolve) => setTimeout(resolve, 2))
    active--
    if (params.name === "maker/broken") throw new Error("unavailable")
    if (path === "/packages/get")
      return { data: { package: { last_built_release_id: params.name } } }
    if (path === "/package_files/list") return { data: { package_files: [] } }
    return {
      data: {
        preview_circuit_json_response: {
          circuit_json: [
            { type: "source_component", manufacturer_part_number: "NEW789" },
          ],
        },
      },
    }
  }
  const { entries, failed } = await loadReferenceDesignCatalog(names, get)
  expect(failed).toEqual(["maker/broken"])
  expect(referenceDesignsForPart(entries, names, "NEW789")).toEqual(
    names.filter((name) => !name.endsWith("broken")),
  )
  expect(maximum).toBeLessThanOrEqual(3)
})
