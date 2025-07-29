import { DbClient } from "./db-client"
import { loadAutoloadPackages } from "./autoload-dev-packages"

export const seed = (db: DbClient) => {
  const { account_id } = db.addAccount({
    account_id: "account-1234",
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
  db.addAccount({
    github_username: "seveibar",
  })

  if (process.env.AUTOLOAD_PACKAGES === "true") {
    loadAutoloadPackages(db)
  }

  db.addSnippet({
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

  // Define the @tsci/seveibar.a555timer package
  db.addSnippet({
    name: "seveibar/a555timer",
    unscoped_name: "a555timer",
    owner_name: "seveibar",
    code: `
export const A555Timer = ({ name }: { name: string }) => (
  <chip name={name} footprint="dip8" />
)
`.trim(),
    dts: `
declare module "@tsci/seveibar.a555timer" {
  export const A555Timer: ({ name }: {
    name: string;
  }) => any;
}
`.trim(),
    compiled_js: `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.A555Timer = void 0;
const A555Timer = ({
  name
}) => /*#__PURE__*/React.createElement("chip", {
  name: name,
  footprint: "dip8"
});
exports.A555Timer = A555Timer;
    `.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type: "package",
    description: "A simple package with an A555 Timer component",
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
        width: 50,
        height: 50,
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

  // Add a snippet that outputs a square waveform using the a555timer

  db.addSnippet({
    name: "testuser/a555timer-square-wave",
    unscoped_name: "a555timer-square-wave",
    owner_name: "testuser",
    code: `
import { A555Timer } from "@tsci/seveibar.a555timer"

export const SquareWaveModule = () => (
  <A555Timer name="U1" />
)
`.trim(),
    dts: 'export declare const SquareWaveModule: () => import("react/jsx-runtime").JSX.Element;\n',
    compiled_js:
      '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.SquareWaveModule = void 0;\nvar _seveibar = require("@tsci/seveibar.a555timer");\nconst SquareWaveModule = () => /*#__PURE__*/React.createElement(_seveibar.A555Timer, {\n  name: "U1"\n});\nexports.SquareWaveModule = SquareWaveModule;',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type: "package",
    description:
      "A simple package that outputs a square waveform using the a555timer",
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
        width: 50,
        height: 50,
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

  db.addOrder({
    account_id,
    is_running: false,
    is_started: false,
    is_finished: false,
    error: null,
    has_error: false,
    circuit_json: [
      {
        type: "source_component",
        ftype: "simple_resistor",
        source_component_id: "source_component_1",
        name: "R1",
        resistane: "1k",
      },
    ],
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
  })

  // Add sample datasheets for common electronic components
  db.addDatasheet({
    chip_name: "NE555",
  })
  db.updateDatasheet(db.getDatasheetByChipName("NE555")!.datasheet_id, {
    chip_name: "NE555",
    datasheet_pdf_urls: [
      "https://www.ti.com/lit/ds/symlink/ne555.pdf",
      "https://www.st.com/resource/en/datasheet/cd00000479.pdf"
    ],
    pin_information: [
      {
        pin_number: "1",
        name: "GND",
        description: "Ground reference",
        capabilities: ["ground", "power"]
      },
      {
        pin_number: "2",
        name: "TRIG",
        description: "Trigger input - initiates timing cycle when voltage falls below 1/3 VCC",
        capabilities: ["input", "analog", "digital"]
      },
      {
        pin_number: "3",
        name: "OUT",
        description: "Output - goes high during timing cycle",
        capabilities: ["output", "digital"]
      },
      {
        pin_number: "4",
        name: "RESET",
        description: "Reset input - active low, forces output low when asserted",
        capabilities: ["input", "digital"]
      },
      {
        pin_number: "5",
        name: "CTRL",
        description: "Control voltage - allows access to internal voltage divider",
        capabilities: ["input", "analog"]
      },
      {
        pin_number: "6",
        name: "THRES",
        description: "Threshold input - ends timing cycle when voltage exceeds 2/3 VCC",
        capabilities: ["input", "analog", "digital"]
      },
      {
        pin_number: "7",
        name: "DISCH",
        description: "Discharge - open collector output for timing capacitor",
        capabilities: ["output", "open_collector"]
      },
      {
        pin_number: "8",
        name: "VCC",
        description: "Positive power supply",
        capabilities: ["power", "input"]
      }
    ],
    footprint_information: {
      package_type: "DIP",
      dimensions: {
        length_mm: 9.81,
        width_mm: 6.35,
        height_mm: 3.3
      },
      pin_count: 8,
      pin_spacing_mm: 2.54,
      package_material: "plastic",
      mounting_type: "through_hole"
    },
    chip_type: "timer",
    summary: "Precision timing circuit with 8-pin DIP package",
    description: "The NE555 is a highly stable device for generating accurate time delays or oscillation. Additional terminals are provided for triggering or resetting if desired. In the time delay mode of operation, the time is precisely controlled by one external resistor and capacitor. For astable operation as an oscillator, the free running frequency and duty cycle are both accurately controlled with two external resistors and one capacitor.",
    metadata: {
      manufacturer: "Texas Instruments",
      part_number: "NE555",
      package_family: "DIP-8",
      operating_voltage: "4.5V to 16V",
      operating_temperature: "-40°C to +85°C",
      datasheet_revision: "Rev. F",
      release_date: "2015-01-01",
      lifecycle_status: "Active"
    },
    extracted_information: {
      chip_type: "timer",
      footprint_information: {
        package_type: "DIP",
        dimensions: {
          length_mm: 9.81,
          width_mm: 6.35,
          height_mm: 3.3
        },
        pin_count: 8,
        pin_spacing_mm: 2.54,
        package_material: "plastic",
        mounting_type: "through_hole"
      },
      pin_information: [
        {
          pin_number: "1",
          name: "GND",
          description: "Ground reference",
          capabilities: ["ground", "power"]
        },
        {
          pin_number: "2",
          name: "TRIG",
          description: "Trigger input - initiates timing cycle when voltage falls below 1/3 VCC",
          capabilities: ["input", "analog", "digital"]
        },
        {
          pin_number: "3",
          name: "OUT",
          description: "Output - goes high during timing cycle",
          capabilities: ["output", "digital"]
        },
        {
          pin_number: "4",
          name: "RESET",
          description: "Reset input - active low, forces output low when asserted",
          capabilities: ["input", "digital"]
        },
        {
          pin_number: "5",
          name: "CTRL",
          description: "Control voltage - allows access to internal voltage divider",
          capabilities: ["input", "analog"]
        },
        {
          pin_number: "6",
          name: "THRES",
          description: "Threshold input - ends timing cycle when voltage exceeds 2/3 VCC",
          capabilities: ["input", "analog", "digital"]
        },
        {
          pin_number: "7",
          name: "DISCH",
          description: "Discharge - open collector output for timing capacitor",
          capabilities: ["output", "open_collector"]
        },
        {
          pin_number: "8",
          name: "VCC",
          description: "Positive power supply",
          capabilities: ["power", "input"]
        }
      ],
      summary: "Precision timing circuit with 8-pin DIP package",
      description: "The NE555 is a highly stable device for generating accurate time delays or oscillation. Additional terminals are provided for triggering or resetting if desired. In the time delay mode of operation, the time is precisely controlled by one external resistor and capacitor. For astable operation as an oscillator, the free running frequency and duty cycle are both accurately controlled with two external resistors and one capacitor.",
      metadata: {
        manufacturer: "Texas Instruments",
        part_number: "NE555",
        package_family: "DIP-8",
        operating_voltage: "4.5V to 16V",
        operating_temperature: "-40°C to +85°C",
        datasheet_revision: "Rev. F",
        release_date: "2015-01-01",
        lifecycle_status: "Active"
      },
      extraction_metadata: {
        chip_type_confidence_score: 0.95,
        raw_detected_chip_type: "timer"
      }
    }
  })

  db.addDatasheet({
    chip_name: "LM358",
  })
  db.updateDatasheet(db.getDatasheetByChipName("LM358")!.datasheet_id, {
    chip_name: "LM358",
    datasheet_pdf_urls: [
      "https://www.ti.com/lit/ds/symlink/lm358.pdf",
      "https://www.st.com/resource/en/datasheet/lm358.pdf"
    ],
    pin_information: [
      {
        pin_number: "1",
        name: "OUT1",
        description: "Output of operational amplifier 1",
        capabilities: ["output", "analog"]
      },
      {
        pin_number: "2",
        name: "IN1-",
        description: "Inverting input of operational amplifier 1",
        capabilities: ["input", "analog"]
      },
      {
        pin_number: "3",
        name: "IN1+",
        description: "Non-inverting input of operational amplifier 1",
        capabilities: ["input", "analog"]
      },
      {
        pin_number: "4",
        name: "VCC-",
        description: "Negative power supply",
        capabilities: ["power", "input"]
      },
      {
        pin_number: "5",
        name: "IN2+",
        description: "Non-inverting input of operational amplifier 2",
        capabilities: ["input", "analog"]
      },
      {
        pin_number: "6",
        name: "IN2-",
        description: "Inverting input of operational amplifier 2",
        capabilities: ["input", "analog"]
      },
      {
        pin_number: "7",
        name: "OUT2",
        description: "Output of operational amplifier 2",
        capabilities: ["output", "analog"]
      },
      {
        pin_number: "8",
        name: "VCC+",
        description: "Positive power supply",
        capabilities: ["power", "input"]
      }
    ],
    footprint_information: {
      package_type: "DIP",
      dimensions: {
        length_mm: 9.81,
        width_mm: 6.35,
        height_mm: 3.3
      },
      pin_count: 8,
      pin_spacing_mm: 2.54,
      package_material: "plastic",
      mounting_type: "through_hole"
    },
    chip_type: "operational_amplifier",
    summary: "Dual operational amplifier with low power consumption",
    description: "The LM358 consists of two independent, high gain, internally frequency compensated operational amplifiers which were designed specifically to operate from a single power supply over a wide range of voltages. Operation from split power supplies is also possible and the low power supply current drain is independent of the magnitude of the power supply voltage.",
    metadata: {
      manufacturer: "Texas Instruments",
      part_number: "LM358",
      package_family: "DIP-8",
      operating_voltage: "3V to 32V",
      operating_temperature: "0°C to +70°C",
      datasheet_revision: "Rev. H",
      release_date: "2015-01-01",
      lifecycle_status: "Active"
    },
    extracted_information: {
      chip_type: "operational_amplifier",
      footprint_information: {
        package_type: "DIP",
        dimensions: {
          length_mm: 9.81,
          width_mm: 6.35,
          height_mm: 3.3
        },
        pin_count: 8,
        pin_spacing_mm: 2.54,
        package_material: "plastic",
        mounting_type: "through_hole"
      },
      pin_information: [
        {
          pin_number: "1",
          name: "OUT1",
          description: "Output of operational amplifier 1",
          capabilities: ["output", "analog"]
        },
        {
          pin_number: "2",
          name: "IN1-",
          description: "Inverting input of operational amplifier 1",
          capabilities: ["input", "analog"]
        },
        {
          pin_number: "3",
          name: "IN1+",
          description: "Non-inverting input of operational amplifier 1",
          capabilities: ["input", "analog"]
        },
        {
          pin_number: "4",
          name: "VCC-",
          description: "Negative power supply",
          capabilities: ["power", "input"]
        },
        {
          pin_number: "5",
          name: "IN2+",
          description: "Non-inverting input of operational amplifier 2",
          capabilities: ["input", "analog"]
        },
        {
          pin_number: "6",
          name: "IN2-",
          description: "Inverting input of operational amplifier 2",
          capabilities: ["input", "analog"]
        },
        {
          pin_number: "7",
          name: "OUT2",
          description: "Output of operational amplifier 2",
          capabilities: ["output", "analog"]
        },
        {
          pin_number: "8",
          name: "VCC+",
          description: "Positive power supply",
          capabilities: ["power", "input"]
        }
      ],
      summary: "Dual operational amplifier with low power consumption",
      description: "The LM358 consists of two independent, high gain, internally frequency compensated operational amplifiers which were designed specifically to operate from a single power supply over a wide range of voltages. Operation from split power supplies is also possible and the low power supply current drain is independent of the magnitude of the power supply voltage.",
      metadata: {
        manufacturer: "Texas Instruments",
        part_number: "LM358",
        package_family: "DIP-8",
        operating_voltage: "3V to 32V",
        operating_temperature: "0°C to +70°C",
        datasheet_revision: "Rev. H",
        release_date: "2015-01-01",
        lifecycle_status: "Active"
      },
      extraction_metadata: {
        chip_type_confidence_score: 0.92,
        raw_detected_chip_type: "operational_amplifier"
      }
    }
  })

  db.addDatasheet({
    chip_name: "ATmega328P",
  })
  db.updateDatasheet(db.getDatasheetByChipName("ATmega328P")!.datasheet_id, {
    chip_name: "ATmega328P",
    datasheet_pdf_urls: [
      "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf"
    ],
    pin_information: [
      {
        pin_number: "1",
        name: "PC6/RESET",
        description: "Reset input or PC6 digital I/O",
        capabilities: ["input", "digital", "reset"]
      },
      {
        pin_number: "2",
        name: "PD0/RXD",
        description: "USART receive data or PD0 digital I/O",
        capabilities: ["input", "output", "digital", "uart"]
      },
      {
        pin_number: "3",
        name: "PD1/TXD",
        description: "USART transmit data or PD1 digital I/O",
        capabilities: ["input", "output", "digital", "uart"]
      },
      {
        pin_number: "4",
        name: "PD2/INT0",
        description: "External interrupt 0 or PD2 digital I/O",
        capabilities: ["input", "digital", "interrupt"]
      },
      {
        pin_number: "5",
        name: "PD3/INT1",
        description: "External interrupt 1 or PD3 digital I/O",
        capabilities: ["input", "digital", "interrupt"]
      },
      {
        pin_number: "6",
        name: "PD4/T0",
        description: "Timer0 external counter input or PD4 digital I/O",
        capabilities: ["input", "digital", "timer"]
      },
      {
        pin_number: "7",
        name: "VCC",
        description: "Digital supply voltage",
        capabilities: ["power", "input"]
      },
      {
        pin_number: "8",
        name: "GND",
        description: "Ground",
        capabilities: ["ground", "power"]
      },
      {
        pin_number: "9",
        name: "PB6/XTAL1",
        description: "Crystal oscillator input or PB6 digital I/O",
        capabilities: ["input", "digital", "oscillator"]
      },
      {
        pin_number: "10",
        name: "PB7/XTAL2",
        description: "Crystal oscillator output or PB7 digital I/O",
        capabilities: ["output", "digital", "oscillator"]
      },
      {
        pin_number: "11",
        name: "PD5/T1",
        description: "Timer1 external counter input or PD5 digital I/O",
        capabilities: ["input", "digital", "timer"]
      },
      {
        pin_number: "12",
        name: "PD6/AIN0",
        description: "Analog comparator positive input or PD6 digital I/O",
        capabilities: ["input", "digital", "analog", "comparator"]
      },
      {
        pin_number: "13",
        name: "PD7/AIN1",
        description: "Analog comparator negative input or PD7 digital I/O",
        capabilities: ["input", "digital", "analog", "comparator"]
      },
      {
        pin_number: "14",
        name: "PB0/ICP",
        description: "Timer1 input capture or PB0 digital I/O",
        capabilities: ["input", "digital", "timer"]
      },
      {
        pin_number: "15",
        name: "PB1/OC1A",
        description: "Timer1 output compare A or PB1 digital I/O",
        capabilities: ["output", "digital", "timer"]
      },
      {
        pin_number: "16",
        name: "PB2/SS/OC1B",
        description: "SPI slave select or Timer1 output compare B or PB2 digital I/O",
        capabilities: ["input", "output", "digital", "spi", "timer"]
      },
      {
        pin_number: "17",
        name: "PB3/MOSI/OC2",
        description: "SPI master out slave in or Timer2 output compare or PB3 digital I/O",
        capabilities: ["input", "output", "digital", "spi", "timer"]
      },
      {
        pin_number: "18",
        name: "PB4/MISO",
        description: "SPI master in slave out or PB4 digital I/O",
        capabilities: ["input", "output", "digital", "spi"]
      },
      {
        pin_number: "19",
        name: "PB5/SCK",
        description: "SPI serial clock or PB5 digital I/O",
        capabilities: ["input", "output", "digital", "spi"]
      },
      {
        pin_number: "20",
        name: "AVCC",
        description: "Analog supply voltage",
        capabilities: ["power", "input"]
      },
      {
        pin_number: "21",
        name: "AREF",
        description: "Analog reference voltage",
        capabilities: ["input", "analog"]
      },
      {
        pin_number: "22",
        name: "GND",
        description: "Ground",
        capabilities: ["ground", "power"]
      },
      {
        pin_number: "23",
        name: "PC0/ADC0",
        description: "ADC input channel 0 or PC0 digital I/O",
        capabilities: ["input", "digital", "analog", "adc"]
      },
      {
        pin_number: "24",
        name: "PC1/ADC1",
        description: "ADC input channel 1 or PC1 digital I/O",
        capabilities: ["input", "digital", "analog", "adc"]
      },
      {
        pin_number: "25",
        name: "PC2/ADC2",
        description: "ADC input channel 2 or PC2 digital I/O",
        capabilities: ["input", "digital", "analog", "adc"]
      },
      {
        pin_number: "26",
        name: "PC3/ADC3",
        description: "ADC input channel 3 or PC3 digital I/O",
        capabilities: ["input", "digital", "analog", "adc"]
      },
      {
        pin_number: "27",
        name: "PC4/ADC4/SDA",
        description: "ADC input channel 4 or I2C data or PC4 digital I/O",
        capabilities: ["input", "output", "digital", "analog", "adc", "i2c"]
      },
      {
        pin_number: "28",
        name: "PC5/ADC5/SCL",
        description: "ADC input channel 5 or I2C clock or PC5 digital I/O",
        capabilities: ["input", "output", "digital", "analog", "adc", "i2c"]
      }
    ],
    footprint_information: {
      package_type: "DIP",
      dimensions: {
        length_mm: 34.29,
        width_mm: 7.62,
        height_mm: 3.3
      },
      pin_count: 28,
      pin_spacing_mm: 2.54,
      package_material: "plastic",
      mounting_type: "through_hole"
    },
    chip_type: "microcontroller",
    summary: "8-bit AVR microcontroller with 32KB flash memory",
    description: "The ATmega328P is a low-power CMOS 8-bit microcontroller based on the AVR enhanced RISC architecture. By executing powerful instructions in a single clock cycle, the ATmega328P achieves throughputs approaching 1 MIPS per MHz allowing the system designer to optimize power consumption versus processing speed.",
    metadata: {
      manufacturer: "Microchip Technology",
      part_number: "ATmega328P",
      package_family: "DIP-28",
      operating_voltage: "1.8V to 5.5V",
      operating_temperature: "-40°C to +85°C",
      datasheet_revision: "Rev. 7810D",
      release_date: "2015-01-01",
      lifecycle_status: "Active"
    },
    extracted_information: {
      chip_type: "microcontroller",
      footprint_information: {
        package_type: "DIP",
        dimensions: {
          length_mm: 34.29,
          width_mm: 7.62,
          height_mm: 3.3
        },
        pin_count: 28,
        pin_spacing_mm: 2.54,
        package_material: "plastic",
        mounting_type: "through_hole"
      },
      pin_information: [
        {
          pin_number: "1",
          name: "PC6/RESET",
          description: "Reset input or PC6 digital I/O",
          capabilities: ["input", "digital", "reset"]
        },
        {
          pin_number: "2",
          name: "PD0/RXD",
          description: "USART receive data or PD0 digital I/O",
          capabilities: ["input", "output", "digital", "uart"]
        },
        {
          pin_number: "3",
          name: "PD1/TXD",
          description: "USART transmit data or PD1 digital I/O",
          capabilities: ["input", "output", "digital", "uart"]
        },
        {
          pin_number: "4",
          name: "PD2/INT0",
          description: "External interrupt 0 or PD2 digital I/O",
          capabilities: ["input", "digital", "interrupt"]
        },
        {
          pin_number: "5",
          name: "PD3/INT1",
          description: "External interrupt 1 or PD3 digital I/O",
          capabilities: ["input", "digital", "interrupt"]
        },
        {
          pin_number: "6",
          name: "PD4/T0",
          description: "Timer0 external counter input or PD4 digital I/O",
          capabilities: ["input", "digital", "timer"]
        },
        {
          pin_number: "7",
          name: "VCC",
          description: "Digital supply voltage",
          capabilities: ["power", "input"]
        },
        {
          pin_number: "8",
          name: "GND",
          description: "Ground",
          capabilities: ["ground", "power"]
        },
        {
          pin_number: "9",
          name: "PB6/XTAL1",
          description: "Crystal oscillator input or PB6 digital I/O",
          capabilities: ["input", "digital", "oscillator"]
        },
        {
          pin_number: "10",
          name: "PB7/XTAL2",
          description: "Crystal oscillator output or PB7 digital I/O",
          capabilities: ["output", "digital", "oscillator"]
        },
        {
          pin_number: "11",
          name: "PD5/T1",
          description: "Timer1 external counter input or PD5 digital I/O",
          capabilities: ["input", "digital", "timer"]
        },
        {
          pin_number: "12",
          name: "PD6/AIN0",
          description: "Analog comparator positive input or PD6 digital I/O",
          capabilities: ["input", "digital", "analog", "comparator"]
        },
        {
          pin_number: "13",
          name: "PD7/AIN1",
          description: "Analog comparator negative input or PD7 digital I/O",
          capabilities: ["input", "digital", "analog", "comparator"]
        },
        {
          pin_number: "14",
          name: "PB0/ICP",
          description: "Timer1 input capture or PB0 digital I/O",
          capabilities: ["input", "digital", "timer"]
        },
        {
          pin_number: "15",
          name: "PB1/OC1A",
          description: "Timer1 output compare A or PB1 digital I/O",
          capabilities: ["output", "digital", "timer"]
        },
        {
          pin_number: "16",
          name: "PB2/SS/OC1B",
          description: "SPI slave select or Timer1 output compare B or PB2 digital I/O",
          capabilities: ["input", "output", "digital", "spi", "timer"]
        },
        {
          pin_number: "17",
          name: "PB3/MOSI/OC2",
          description: "SPI master out slave in or Timer2 output compare or PB3 digital I/O",
          capabilities: ["input", "output", "digital", "spi", "timer"]
        },
        {
          pin_number: "18",
          name: "PB4/MISO",
          description: "SPI master in slave out or PB4 digital I/O",
          capabilities: ["input", "output", "digital", "spi"]
        },
        {
          pin_number: "19",
          name: "PB5/SCK",
          description: "SPI serial clock or PB5 digital I/O",
          capabilities: ["input", "output", "digital", "spi"]
        },
        {
          pin_number: "20",
          name: "AVCC",
          description: "Analog supply voltage",
          capabilities: ["power", "input"]
        },
        {
          pin_number: "21",
          name: "AREF",
          description: "Analog reference voltage",
          capabilities: ["input", "analog"]
        },
        {
          pin_number: "22",
          name: "GND",
          description: "Ground",
          capabilities: ["ground", "power"]
        },
        {
          pin_number: "23",
          name: "PC0/ADC0",
          description: "ADC input channel 0 or PC0 digital I/O",
          capabilities: ["input", "digital", "analog", "adc"]
        },
        {
          pin_number: "24",
          name: "PC1/ADC1",
          description: "ADC input channel 1 or PC1 digital I/O",
          capabilities: ["input", "digital", "analog", "adc"]
        },
        {
          pin_number: "25",
          name: "PC2/ADC2",
          description: "ADC input channel 2 or PC2 digital I/O",
          capabilities: ["input", "digital", "analog", "adc"]
        },
        {
          pin_number: "26",
          name: "PC3/ADC3",
          description: "ADC input channel 3 or PC3 digital I/O",
          capabilities: ["input", "digital", "analog", "adc"]
        },
        {
          pin_number: "27",
          name: "PC4/ADC4/SDA",
          description: "ADC input channel 4 or I2C data or PC4 digital I/O",
          capabilities: ["input", "output", "digital", "analog", "adc", "i2c"]
        },
        {
          pin_number: "28",
          name: "PC5/ADC5/SCL",
          description: "ADC input channel 5 or I2C clock or PC5 digital I/O",
          capabilities: ["input", "output", "digital", "analog", "adc", "i2c"]
        }
      ],
      summary: "8-bit AVR microcontroller with 32KB flash memory",
      description: "The ATmega328P is a low-power CMOS 8-bit microcontroller based on the AVR enhanced RISC architecture. By executing powerful instructions in a single clock cycle, the ATmega328P achieves throughputs approaching 1 MIPS per MHz allowing the system designer to optimize power consumption versus processing speed.",
      metadata: {
        manufacturer: "Microchip Technology",
        part_number: "ATmega328P",
        package_family: "DIP-28",
        operating_voltage: "1.8V to 5.5V",
        operating_temperature: "-40°C to +85°C",
        datasheet_revision: "Rev. 7810D",
        release_date: "2015-01-01",
        lifecycle_status: "Active"
      },
      extraction_metadata: {
        chip_type_confidence_score: 0.98,
        raw_detected_chip_type: "microcontroller"
      }
    }
  })

  db.addDatasheet({
    chip_name: "LM7805",
  })
  db.updateDatasheet(db.getDatasheetByChipName("LM7805")!.datasheet_id, {
    chip_name: "LM7805",
    datasheet_pdf_urls: [
      "https://www.ti.com/lit/ds/symlink/lm7805.pdf",
      "https://www.st.com/resource/en/datasheet/l7805.pdf"
    ],
    pin_information: [
      {
        pin_number: "1",
        name: "IN",
        description: "Input voltage (7V to 35V)",
        capabilities: ["input", "power"]
      },
      {
        pin_number: "2",
        name: "GND",
        description: "Ground reference",
        capabilities: ["ground", "power"]
      },
      {
        pin_number: "3",
        name: "OUT",
        description: "Output voltage (5V ±2%)",
        capabilities: ["output", "power"]
      }
    ],
    footprint_information: {
      package_type: "TO-220",
      dimensions: {
        length_mm: 10.16,
        width_mm: 4.57,
        height_mm: 9.15
      },
      pin_count: 3,
      pin_spacing_mm: 2.54,
      package_material: "plastic",
      mounting_type: "through_hole"
    },
    chip_type: "voltage_regulator",
    summary: "5V positive voltage regulator with 1A output current",
    description: "The LM7805 is a three-terminal positive voltage regulator that employs internal current limiting, thermal shutdown and safe area compensation, making them essentially indestructible. If adequate heat sinking is provided, they can deliver over 1A output current.",
    metadata: {
      manufacturer: "Texas Instruments",
      part_number: "LM7805",
      package_family: "TO-220",
      operating_voltage: "7V to 35V input",
      operating_temperature: "0°C to +125°C",
      datasheet_revision: "Rev. G",
      release_date: "2015-01-01",
      lifecycle_status: "Active"
    },
    extracted_information: {
      chip_type: "voltage_regulator",
      footprint_information: {
        package_type: "TO-220",
        dimensions: {
          length_mm: 10.16,
          width_mm: 4.57,
          height_mm: 9.15
        },
        pin_count: 3,
        pin_spacing_mm: 2.54,
        package_material: "plastic",
        mounting_type: "through_hole"
      },
      pin_information: [
        {
          pin_number: "1",
          name: "IN",
          description: "Input voltage (7V to 35V)",
          capabilities: ["input", "power"]
        },
        {
          pin_number: "2",
          name: "GND",
          description: "Ground reference",
          capabilities: ["ground", "power"]
        },
        {
          pin_number: "3",
          name: "OUT",
          description: "Output voltage (5V ±2%)",
          capabilities: ["output", "power"]
        }
      ],
      summary: "5V positive voltage regulator with 1A output current",
      description: "The LM7805 is a three-terminal positive voltage regulator that employs internal current limiting, thermal shutdown and safe area compensation, making them essentially indestructible. If adequate heat sinking is provided, they can deliver over 1A output current.",
      metadata: {
        manufacturer: "Texas Instruments",
        part_number: "LM7805",
        package_family: "TO-220",
        operating_voltage: "7V to 35V input",
        operating_temperature: "0°C to +125°C",
        datasheet_revision: "Rev. G",
        release_date: "2015-01-01",
        lifecycle_status: "Active"
      },
      extraction_metadata: {
        chip_type_confidence_score: 0.94,
        raw_detected_chip_type: "voltage_regulator"
      }
    }
  })
}
