import { expect, test } from "bun:test"
import {
  readReferenceDesignSelection,
  referenceDesignReducer,
  referenceDesignUrlParams,
  type ReferenceDesignState,
} from "@/lib/reference-design-selection"

test("switching and collapsing designs retain independent release, configuration, sheet and view", () => {
  const first = {
    release: "release-a",
    file: "dist/a/circuit.json",
    sheet: "power",
    view: "pcb",
  }
  const second = {
    release: "release-b",
    file: "dist/b/circuit.json.gz",
    view: "schematic",
  }
  let state: ReferenceDesignState = {
    open: "owner/a",
    selections: { "owner/a": first },
  }
  state = referenceDesignReducer(state, { type: "open", name: "owner/b" })
  expect(state.selections["owner/b"]).toEqual({})
  expect(
    referenceDesignUrlParams("owner/b", state.selections["owner/b"]!),
  ).toEqual({
    reference_design: "owner/b",
    reference_release: undefined,
    reference_file: undefined,
    reference_sheet: undefined,
    reference_view: undefined,
  })
  state = referenceDesignReducer(state, {
    type: "selection",
    name: "owner/b",
    selection: second,
  })
  state = referenceDesignReducer(state, { type: "open", name: "" })
  expect(state.open).toBe("")
  expect(state.selections).toEqual({ "owner/a": first, "owner/b": second })
  state = referenceDesignReducer(state, { type: "open", name: "owner/a" })
  expect(
    referenceDesignUrlParams("owner/a", state.selections["owner/a"]!),
  ).toEqual({
    reference_design: "owner/a",
    reference_release: "release-a",
    reference_file: "dist/a/circuit.json",
    reference_sheet: "power",
    reference_view: "pcb",
  })
})

test("browser navigation updates only the named design", () => {
  const second = {
    release: "release-b",
    file: "dist/b/circuit.json.gz",
    view: "3d",
  }
  const state: ReferenceDesignState = {
    open: "owner/b",
    selections: { "owner/a": {}, "owner/b": second },
  }
  const restored = readReferenceDesignSelection({
    reference_release: "previous-a",
    reference_file: "dist/a/old.json",
    reference_view: "schematic",
  })
  const next = referenceDesignReducer(state, {
    type: "navigate",
    name: "owner/a",
    selection: restored,
  })
  expect(next.open).toBe("owner/a")
  expect(next.selections["owner/b"]).toBe(second)
  expect(next.selections["owner/a"]).toEqual(restored)
})
