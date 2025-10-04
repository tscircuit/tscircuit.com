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

  const { package_release_id: packageReleaseId1 } = db.addSnippet({
    name: "testuser/my-test-board",
    unscoped_name: "my-test-board",
    github_repo_full_name: "testuser/my-test-board",
    owner_name: "testuser",
    branch_name: "main",
    commit_message: "Attempted build of a555timer-square-wave package",
    commit_author: "testuser",
    creator_account_id: account_id,
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

  const firstBuild = db.addPackageBuild({
    package_release_id: packageReleaseId1,
    created_at: new Date(Date.now() - 15000).toISOString(), // 15 seconds ago
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 15000).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 14000).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[ERROR] Failed to parse TypeScript definitions",
      "[ERROR] Invalid syntax in component declaration",
    ],
    transpilation_error:
      "TypeScript compilation failed: Syntax error in component declaration",
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: "Build cancelled due to transpilation failure",
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 15000).toISOString(),
    build_completed_at: new Date(Date.now() - 14000).toISOString(),
    build_error: "Build failed: Unable to complete transpilation step",
    build_error_last_updated_at: new Date(Date.now() - 14000).toISOString(),
    preview_url: null,
    build_logs:
      "Build process:\n" +
      "1. Environment setup - OK\n" +
      "2. Dependency resolution - OK\n" +
      "3. Code compilation - FAILED\n" +
      "Error: Invalid syntax in component declaration\n" +
      "Build terminated with errors",
  })

  // Update the package release with the latest build ID
  const release1 = db.getPackageReleaseById(packageReleaseId1)!
  db.updatePackageRelease({
    ...release1,
    latest_package_build_id: firstBuild.package_build_id,
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

  const { package_release_id: packageReleaseId2 } = db.addSnippet({
    name: "testuser/a555timer-square-wave",
    unscoped_name: "a555timer-square-wave",
    owner_name: "testuser",
    branch_name: "main",
    commit_message: "Attempted build of a555timer-square-wave package",
    commit_author: "testuser",
    creator_account_id: account_id,
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
    github_repo_full_name: "testuser/test",
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

  // Add failed build first
  const failedBuild = db.addPackageBuild({
    package_release_id: packageReleaseId2,
    created_at: new Date(Date.now() - 15000).toISOString(), // 15 seconds ago
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 15000).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 14000).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[ERROR] Failed to parse TypeScript definitions",
      "[ERROR] Invalid syntax in component declaration",
    ],
    transpilation_error:
      "TypeScript compilation failed: Syntax error in component declaration",
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: null,
    circuit_json_build_completed_at: null,
    circuit_json_build_logs: [],
    circuit_json_build_error: "Build cancelled due to transpilation failure",
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 15000).toISOString(),
    build_completed_at: new Date(Date.now() - 14000).toISOString(),
    build_error: "Build failed: Unable to complete transpilation step",
    build_error_last_updated_at: new Date(Date.now() - 14000).toISOString(),
    preview_url: null,
    build_logs:
      "Build process:\n" +
      "1. Environment setup - OK\n" +
      "2. Dependency resolution - OK\n" +
      "3. Code compilation - FAILED\n" +
      "Error: Invalid syntax in component declaration\n" +
      "Build terminated with errors",
  })

  // Add successful build
  const successfulBuild = db.addPackageBuild({
    package_release_id: packageReleaseId2,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5000).toISOString(), // Started 5 seconds ago
    transpilation_completed_at: new Date(Date.now() - 3000).toISOString(), // Completed 3 seconds ago
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[INFO] Generating TypeScript definitions",
      "[INFO] Compiling to JavaScript",
      "[SUCCESS] Transpilation completed successfully",
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3000).toISOString(), // Started after transpilation
    circuit_json_build_completed_at: new Date(Date.now() - 1000).toISOString(), // Completed 1 second ago
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[INFO] Analyzing component structure",
      "[INFO] Generating port configurations",
      "[INFO] Validating circuit connections",
      "[SUCCESS] Circuit JSON build completed",
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 10000).toISOString(), // Started 10 seconds ago
    build_completed_at: new Date().toISOString(), // Just completed
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    preview_url: "http://localhost:3000/preview/package_build_1",
    build_logs:
      "Build process:\n" +
      "1. Environment setup - OK\n" +
      "2. Dependency resolution - OK\n" +
      "3. Code compilation - OK\n" +
      "4. Circuit validation - OK\n" +
      "5. Package assembly - OK\n" +
      "Build completed successfully",
  })

  // Update the package release with the latest (successful) build ID
  const release2 = db.getPackageReleaseById(packageReleaseId2)!
  db.updatePackageRelease({
    ...release2,
    latest_package_build_id: successfulBuild.package_build_id,
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

  const testOrg = db.addOrganization({
    name: "test-organization",
    owner_account_id: account_id,
  })

  // Add org member
  db.addOrganizationAccount({
    org_id: testOrg.org_id,
    account_id: account_id,
    is_owner: true,
  })

  const { package_release_id: orgPackageReleaseId } = db.addSnippet({
    name: "test-organization/test-package",
    unscoped_name: "test-package",
    owner_name: "test-organization",
    code: `
export const TestComponent = ({ name }: { name: string }) => (
  <resistor name={name} resistance="10k" />
)
`.trim(),
    dts: `
declare module "@tsci/test-organization.test-package" {
  export const TestComponent: ({ name }: {
    name: string;
  }) => any;
}
`.trim(),
    compiled_js: `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestComponent = void 0;
const TestComponent = ({
  name
}) => /*#__PURE__*/React.createElement("resistor", {
  name: name,
  resistance: "10k"
});
exports.TestComponent = TestComponent;
    `.trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    snippet_type: "package",
    description: "Test package for organization",
    circuit_json: [
      {
        type: "source_component",
        source_component_id: "source_component_0",
        ftype: "simple_resistor",
        name: "R1",
        resistance: "10k",
      },
    ],
  })

  // Add successful build for org package
  const orgPackageBuild = db.addPackageBuild({
    package_release_id: orgPackageReleaseId,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5000).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 3000).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[SUCCESS] Transpilation completed successfully",
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3000).toISOString(),
    circuit_json_build_completed_at: new Date(Date.now() - 1000).toISOString(),
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[SUCCESS] Circuit JSON build completed",
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 10000).toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    preview_url: "http://localhost:3000/preview/org_package_build",
    build_logs: "Build completed successfully",
  })

  // Update the org package release with the build ID
  const orgRelease = db.getPackageReleaseById(orgPackageReleaseId)!
  db.updatePackageRelease({
    ...orgRelease,
    latest_package_build_id: orgPackageBuild.package_build_id,
  })

  db.addOrganization({
    name: "testuser",
    owner_account_id: account_id,
    is_personal_org: true,
  })
}
