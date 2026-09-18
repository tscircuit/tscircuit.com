import { getTestServer } from "bun-tests/fake-snippets-api/fixtures/get-test-server"
import { test, expect } from "bun:test"

test("datasheet index only lists fully populated records", async () => {
  const { axios, db } = await getTestServer()
  const complete = {
    ai_description: "Microcontroller",
    datasheet_pdf_urls: ["https://example.com/chip.pdf"],
    pin_information: [
      {
        pin_number: "1",
        name: "GND",
        description: "Ground",
        capabilities: [],
      },
    ],
  }
  const variants = [
    complete,
    { ...complete, ai_description: " " },
    { ...complete, datasheet_pdf_urls: [] },
    { ...complete, pin_information: [] },
    {
      ...complete,
      pin_information: [{ ...complete.pin_information[0], description: "" }],
    },
  ]
  for (let i = 0; i < variants.length; i++) {
    const { data } = await axios.post("/api/datasheets/create", {
      chip_name: `CHIP${i}`,
    })
    db.updateDatasheet(data.datasheet.datasheet_id, variants[i])
  }
  const listed = (await axios.get("/api/datasheets/list")).data.datasheets
  expect(listed.map((d: any) => d.chip_name)).toEqual(["CHIP0"])
  expect(
    (
      await axios.get("/api/datasheets/list", {
        params: { chip_name: "CHIP1" },
      })
    ).data.datasheets,
  ).toEqual([])
})
