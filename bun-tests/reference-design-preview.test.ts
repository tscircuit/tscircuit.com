import { expect, test } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { publishedReferenceDesignSchema } from "@tscircuit/runframe/reference-designs"
import {
  isReferenceDesignPreviewEnabled,
  type ReferenceDesignPreviewFixture,
} from "../scripts/reference-design-preview-plugin"

test("reference design samples remain disabled in production deployments", () => {
  expect(isReferenceDesignPreviewEnabled({ VERCEL_ENV: "preview" })).toBe(true)
  expect(
    isReferenceDesignPreviewEnabled({
      VERCEL: "1",
      VERCEL_ENV: "production",
      REFERENCE_DESIGN_PREVIEW: "true",
    }),
  ).toBe(false)
  expect(isReferenceDesignPreviewEnabled({})).toBe(false)
})

test("the CLI-built sample contains complete, matching configurations", () => {
  const fixture: ReferenceDesignPreviewFixture = JSON.parse(
    gunzipSync(
      readFileSync(
        new URL(
          "../playwright-tests/fixtures/ne555-reference-design.json.gz",
          import.meta.url,
        ),
      ),
    ).toString(),
  )
  const listing = JSON.parse(
    Buffer.from(
      fixture.files.find((file) => file.file_path === "list.json")!
        .content_base64,
      "base64",
    ).toString(),
  )
  const published = publishedReferenceDesignSchema.parse(
    listing.reference_designs[0],
  )
  expect(
    published.reference_design.configurations.map(({ name }) => name),
  ).toEqual(["full_board", "slow", "without_led"])
  for (const configuration of published.reference_design.configurations) {
    for (const [file_path, sha256] of [
      [configuration.circuit_json_path, configuration.circuit_json_sha256],
      [configuration.glb_path, configuration.glb_sha256],
    ]) {
      const file = fixture.files.find((file) => file.file_path === file_path)!
      expect(
        createHash("sha256")
          .update(Buffer.from(file.content_base64, "base64"))
          .digest("hex"),
      ).toBe(sha256)
    }
    const circuit = JSON.parse(
      Buffer.from(
        fixture.files.find(
          (file) => file.file_path === configuration.circuit_json_path,
        )!.content_base64,
        "base64",
      ).toString(),
    ) as { type: string; name?: string }[]
    expect(
      circuit.some(
        ({ type, name }) => type === "source_component" && name === "D1",
      ),
    ).toBe(configuration.name !== "without_led")
  }
})
