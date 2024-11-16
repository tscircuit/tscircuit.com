import { afterEach } from "bun:test"
import { tmpdir } from "node:os"
import defaultAxios from "redaxios"
import { startServer } from "./start-server"
import { DbClient } from "fake-snippets-api/lib/db/db-client"

interface TestFixture {
  url: string
  server: any
  axios: typeof defaultAxios
  db: DbClient
  seed: ReturnType<typeof seedDatabase>
}

export const getTestServer = async (): Promise<TestFixture> => {
  const port = 3001 + Math.floor(Math.random() * 999)
  const testInstanceId = Math.random().toString(36).substring(2, 15)
  const testDbName = `testdb${testInstanceId}`

  const { server, db } = await startServer({
    port,
    testDbName,
  })

  const url = `http://127.0.0.1:${port}`
  const seed = seedDatabase(db)
  const axios = defaultAxios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${seed.account.account_id}`,
    },
  })

  afterEach(async () => {
    if (server && typeof server.stop === "function") {
      await server.stop()
    }
    // Here you might want to add logic to drop the test database
  })

  return {
    url,
    server,
    axios,
    db,
    seed,
  }
}

const seedDatabase = (db: DbClient) => {
  const account = db.addAccount({
    github_username: "testuser",
    shippingInfo: {
      firstName: "Test",
      lastName: "User",
      companyName: "Test Company",
      address: "123 Test St",
      apartment: "Apt 4B",
      city: "Testville",
      state: "NY",
      zipCode: "10001",
      country: "United States of America",
      phone: "555-123-4567",
    },
  })
  const order = db.addOrder({
    account_id: account.account_id,
    is_draft: true,
    is_pending_validation_by_fab: false,
    is_pending_review_by_fab: false,
    is_validated_by_fab: false,
    is_approved_by_fab_review: false,
    is_approved_by_orderer: false,
    is_in_production: false,
    is_shipped: false,
    is_cancelled: false,
    should_be_blank_pcb: false,
    should_include_stencil: false,
    jlcpcb_order_params: {},
    circuit_json: [
      {
        type: "source_component",
        ftype: "simple_resistor",
        source_component_id: "source_component_1",
        name: "R1",
        resistance: "1k",
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  const snippet = db.addSnippet({
    name: "testuser/my-test-board",
    unscoped_name: "my-test-board",
    owner_name: "testuser",
    code: `
        import { A555Timer } from "@tsci/seveibar.a555timer"
        
        export default () => (
          <board width="10mm" height="10mm">
            <A555Timer name="U1" />
          </board>
        )`.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type: "board",
    description: "A simple board with an A555 Timer component",
    circuit_json: [
      {
        type: "source_port",
        source_port_id: "source_port_0",
        name: "pin1",
        pin_number: 1,
        port_hints: ["pin1", "1"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_port",
        source_port_id: "source_port_1",
        name: "pin2",
        pin_number: 2,
        port_hints: ["pin2", "2"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_port",
        source_port_id: "source_port_2",
        name: "pin3",
        pin_number: 3,
        port_hints: ["pin3", "3"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_port",
        source_port_id: "source_port_3",
        name: "pin4",
        pin_number: 4,
        port_hints: ["pin4", "4"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_port",
        source_port_id: "source_port_4",
        name: "pin5",
        pin_number: 5,
        port_hints: ["pin5", "5"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_port",
        source_port_id: "source_port_5",
        name: "pin6",
        pin_number: 6,
        port_hints: ["pin6", "6"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_port",
        source_port_id: "source_port_6",
        name: "pin7",
        pin_number: 7,
        port_hints: ["pin7", "7"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_port",
        source_port_id: "source_port_7",
        name: "pin8",
        pin_number: 8,
        port_hints: ["pin8", "8"],
        source_component_id: "source_component_0",
      },
      {
        type: "source_component",
        source_component_id: "source_component_0",
        ftype: "simple_chip",
        name: "U1",
        supplier_part_numbers: {},
      },
      {
        type: "schematic_component",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0,
          y: 0,
        },
        rotation: 0,
        size: {
          width: 1.1,
          height: 1,
        },
        pin_spacing: 0.2,
        port_labels: {},
        source_component_id: "source_component_0",
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_0",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.30000000000000004,
        },
        source_port_id: "source_port_0",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 1,
        true_ccw_index: 0,
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_1",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: 0.10000000000000003,
        },
        source_port_id: "source_port_1",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 2,
        true_ccw_index: 1,
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_2",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.09999999999999998,
        },
        source_port_id: "source_port_2",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 3,
        true_ccw_index: 2,
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_3",
        schematic_component_id: "schematic_component_0",
        center: {
          x: -0.9500000000000001,
          y: -0.30000000000000004,
        },
        source_port_id: "source_port_3",
        facing_direction: "left",
        distance_from_component_edge: 0.4,
        side_of_component: "left",
        pin_number: 4,
        true_ccw_index: 3,
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_4",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.30000000000000004,
        },
        source_port_id: "source_port_4",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 5,
        true_ccw_index: 4,
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_5",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: -0.10000000000000003,
        },
        source_port_id: "source_port_5",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 6,
        true_ccw_index: 5,
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_6",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.09999999999999998,
        },
        source_port_id: "source_port_6",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 7,
        true_ccw_index: 6,
      },
      {
        type: "schematic_port",
        schematic_port_id: "schematic_port_7",
        schematic_component_id: "schematic_component_0",
        center: {
          x: 0.9500000000000001,
          y: 0.30000000000000004,
        },
        source_port_id: "source_port_7",
        facing_direction: "right",
        distance_from_component_edge: 0.4,
        side_of_component: "right",
        pin_number: 8,
        true_ccw_index: 7,
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb_component_0",
        center: {
          x: 0,
          y: 0,
        },
        width: 8.82,
        height: 8.82,
        layer: "top",
        rotation: 0,
        source_component_id: "source_component_0",
      },
      {
        type: "pcb_board",
        pcb_board_id: "pcb_board_0",
        center: {
          x: 0,
          y: 0,
        },
        thickness: 1.4,
        num_layers: 4,
        width: 10,
        height: 10,
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_0",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_0",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["1"],
        x: -3.81,
        y: 3.81,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_1",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_1",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["2"],
        x: -3.81,
        y: 1.27,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_2",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_2",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["3"],
        x: -3.81,
        y: -1.27,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_3",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_3",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["4"],
        x: -3.81,
        y: -3.81,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_4",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_4",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["5"],
        x: 3.81,
        y: -3.81,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_5",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_5",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["6"],
        x: 3.81,
        y: -1.27,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_6",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_6",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["7"],
        x: 3.81,
        y: 1.27,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "pcb_plated_hole_7",
        pcb_component_id: "pcb_component_0",
        pcb_port_id: "pcb_port_7",
        outer_diameter: 1.2,
        hole_diameter: 1,
        shape: "circle",
        port_hints: ["8"],
        x: 3.81,
        y: 3.81,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_silkscreen_path",
        pcb_silkscreen_path_id: "pcb_silkscreen_path_0",
        pcb_component_id: "pcb_component_0",
        layer: "top",
        route: [
          {
            x: -3.01,
            y: -4.61,
          },
          {
            x: -3.01,
            y: 4.61,
          },
          {
            x: -1.0033333333333332,
            y: 4.61,
          },
          {
            x: -0.9269591309529909,
            y: 4.226040956193693,
          },
          {
            x: -0.7094638037905026,
            y: 3.9005361962094978,
          },
          {
            x: -0.3839590438063067,
            y: 3.6830408690470096,
          },
          {
            x: 6.143644775722556e-17,
            y: 3.6066666666666674,
          },
          {
            x: 0.38395904380630674,
            y: 3.6830408690470096,
          },
          {
            x: 0.7094638037905027,
            y: 3.9005361962094978,
          },
          {
            x: 0.9269591309529909,
            y: 4.226040956193693,
          },
          {
            x: 1.0033333333333332,
            y: 4.61,
          },
          {
            x: 3.01,
            y: 4.61,
          },
          {
            x: 3.01,
            y: -4.61,
          },
          {
            x: -3.01,
            y: -4.61,
          },
        ],
        stroke_width: 0.1,
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_0",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 3.81,
        source_port_id: "source_port_0",
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_1",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: 1.27,
        source_port_id: "source_port_1",
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_2",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -1.27,
        source_port_id: "source_port_2",
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_3",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: -3.81,
        y: -3.81,
        source_port_id: "source_port_3",
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_4",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -3.81,
        source_port_id: "source_port_4",
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_5",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: -1.27,
        source_port_id: "source_port_5",
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_6",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 1.27,
        source_port_id: "source_port_6",
      },
      {
        type: "pcb_port",
        pcb_port_id: "pcb_port_7",
        pcb_component_id: "pcb_component_0",
        layers: ["top", "inner1", "inner2", "bottom"],
        x: 3.81,
        y: 3.81,
        source_port_id: "source_port_7",
      },
      {
        type: "cad_component",
        cad_component_id: "cad_component_0",
        position: {
          x: 0,
          y: 0,
          z: 0.7,
        },
        rotation: {
          x: 0,
          y: 0,
          z: 0,
        },
        pcb_component_id: "pcb_component_0",
        source_component_id: "source_component_0",
        footprinter_string: "dip8",
      },
    ],
  })

  return { account, order, snippet }
}
