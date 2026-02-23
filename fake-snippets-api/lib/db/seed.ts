import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { DbClient } from "./db-client"
import { loadAutoloadPackages } from "./autoload-dev-packages"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const seed = (db: DbClient) => {
  const { account_id } = db.addAccount({
    account_id: "account-1234",
    personal_org_id: "org-1234",
    github_username: "testuser",
    tscircuit_handle: "testuser",
    email: "testuser@tscircuit.com",
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
  const seveibarAcc = db.addAccount({
    github_username: "seveibar",
    tscircuit_handle: "seveibar",
    email: "example@tscircuit.com",
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
    package_build_website_url: null,
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

  // Test Package addition
  const test2Package = db.addPackage({
    name: "testuser/test2-package",
    unscoped_name: "test2-package",
    creator_account_id: account_id,
    org_owner_tscircuit_handle: "testuser",
    owner_org_id: "org-1234",
    owner_github_username: "testuser",
    description: "A test package for development",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_source_from_github: false,
    snippet_type: "package",
    latest_package_release_id: "0.0.5",
    latest_version: "0.0.5",
    license: "MIT",
    website: "https://tscircuit.com",
    star_count: 10,
    ai_description:
      "A comprehensive test package designed for development and testing purposes. This package includes various components and utilities commonly used in circuit design and simulation workflows.",
    ai_usage_instructions:
      "Import the package using `import { TestComponent } from '@tsci/testuser.test2-package'`. Use the TestComponent in your circuit designs by providing the required props. Example: `<TestComponent name='my-test' value={42} />`",
    default_view: "files",
    latest_pcb_preview_image_url: `/api/packages/images/testuser/test2-package/pcb.png`,
    latest_cad_preview_image_url: `/api/packages/images/testuser/test2-package/3d.png`,
    latest_sch_preview_image_url: `/api/packages/images/testuser/test2-package/schematic.png`,
  })
  db.updatePackage(test2Package.package_id, {
    github_repo_full_name: "testuser/test2-package",
    github_installation_id: "1234567890",
  })
  const { package_release_id: test2PackageReleaseId } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.1",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
    pcb_preview_image_url: `/api/packages/images/testuser/test2-package/pcb.png`,
    cad_preview_image_url: `/api/packages/images/testuser/test2-package/3d.png`,
    sch_preview_image_url: `/api/packages/images/testuser/test2-package/schematic.png`,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId,
    file_path: "index.tsx",
    content_text: `
export const TestComponent = ({ name }: { name: string }) => (
  <resistor name={name} resistance="10k" />
)
`.trim(),
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId,
    file_path: "/dist/circuit.json",
    content_text: `[
  {
    "type": "source_project_metadata",
    "source_project_metadata_id": "source_project_metadata_0",
    "software_used_string": "@tscircuit/core@0.0.813"
  },
  {
    "type": "source_group",
    "source_group_id": "source_group_0",
    "is_subcircuit": true,
    "was_automatically_named": true,
    "subcircuit_id": "subcircuit_source_group_0"
  },
  {
    "type": "source_board",
    "source_board_id": "source_board_0",
    "source_group_id": "source_group_0"
  },
  {
    "type": "schematic_group",
    "schematic_group_id": "schematic_group_0",
    "is_subcircuit": true,
    "subcircuit_id": "subcircuit_source_group_0",
    "name": "unnamed_board1",
    "center": {
      "x": 0,
      "y": 0
    },
    "width": 0,
    "height": 0,
    "schematic_component_ids": [],
    "source_group_id": "source_group_0"
  },
  {
    "type": "pcb_board",
    "pcb_board_id": "pcb_board_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "thickness": 1.4,
    "num_layers": 2,
    "width": 10,
    "height": 10,
    "material": "fr4"
  }
]`.trim(),
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageBuild({
    package_release_id: test2PackageReleaseId,
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
    build_logs:
      "Build process:\n" +
      "1. Environment setup - OK\n" +
      "2. Dependency resolution - OK\n" +
      "3. Code compilation - OK\n" +
      "4. Circuit validation - OK\n" +
      "5. Package assembly - OK\n" +
      "Build completed successfully",
  })

  const { package_release_id: test2PackageReleaseId2 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.2",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId2,
    file_path: "index.tsx",
    content_text: `export const TestComponent = ({ name }: { name: string }) => (
  <resistor name={name} resistance="20k" />
)`,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId2,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\``,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_text: true,
  })

  const { package_release_id: test2PackageReleaseId3 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.3",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId3,
    file_path: "index.tsx",
    content_text: `import { formatResistance } from "./utils"

export const TestComponent = ({ name, value = 30 }: { name: string; value?: number }) => (
  <resistor name={name} resistance={formatResistance(value)} />
)`,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId3,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 30`,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId3,
    file_path: "README.md",
    content_text: `# Test2 Package v0.0.3

Added value prop support.`,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_text: true,
  })
  const { package_release_id: test2PackageReleaseIdPr1, ...d } =
    db.addPackageRelease({
      package_id: test2Package.package_id,
      version: "0.0.4-pr1-ead7df70",
      created_at: new Date().toISOString(),
      is_latest: false,
      is_locked: false,
      has_transpiled: true,
      transpilation_error: null,
      is_pr_preview: true,
      pr_number: 1,
      pr_title: "feat: add new resistor values",
      branch_name: "feature/new-resistor-values",
      commit_sha: "259fbcd1f9e41cbe769c6f0b01cb2d86a9294668",
    })
  const { package_release_id: test2PackageReleaseId4 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.5",
    created_at: new Date().toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
    pcb_preview_image_url: `/api/packages/images/testuser/test2-package/pcb.png`,
    cad_preview_image_url: `/api/packages/images/testuser/test2-package/3d.png`,
    sch_preview_image_url: `/api/packages/images/testuser/test2-package/schematic.png`,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "index.tsx",
    content_text: `import { formatResistance, DEFAULT_RESISTANCE } from "./utils"
import type { ComponentProps } from "./types"

export const TestComponent = ({ name, value = DEFAULT_RESISTANCE }: ComponentProps) => (
  <resistor name={name} resistance={formatResistance(value)} />
)`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 40`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "types.ts",
    content_text: `export interface ComponentProps {
  name: string
  value?: number
}`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId4,
    file_path: "README.md",
    content_text: `# Test2 Package v0.0.4

Latest version with TypeScript types.

## Usage
\`\`\`tsx
import { TestComponent } from "@tsci/testuser.test2-package"

<TestComponent name="R1" value={40} />
\`\`\``,
    created_at: new Date().toISOString(),
    is_text: true,
  })

  db.addPackageFile({
    package_release_id: test2PackageReleaseIdPr1,
    file_path: "index.tsx",
    content_text: `import { formatResistance, DEFAULT_RESISTANCE } from "./utils"
import type { ComponentProps } from "./types"

export const TestComponent = ({ name, value = DEFAULT_RESISTANCE }: ComponentProps) => (
  <resistor name={name} resistance={formatResistance(value)} />
)`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseIdPr1,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 50`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseIdPr1,
    file_path: "types.ts",
    content_text: `export interface ComponentProps {
  name: string
  value?: number
}`,
    created_at: new Date().toISOString(),
    is_text: true,
  })

  const { package_release_id: test2PackageReleaseId5 } = db.addPackageRelease({
    package_id: test2Package.package_id,
    version: "0.0.6",
    created_at: new Date().toISOString(),
    is_latest: false,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "index.tsx",
    content_text: `import { formatResistance, DEFAULT_RESISTANCE } from "./utils"
import type { ComponentProps } from "./types"

export const TestComponent = ({ name, value = DEFAULT_RESISTANCE }: ComponentProps) => (
  <resistor name={name} resistance={formatResistance(value)} />
)`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "utils.ts",
    content_text: `export const formatResistance = (value: number) => \`\${value}k\`
export const DEFAULT_RESISTANCE = 50`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "types.ts",
    content_text: `export interface ComponentProps {
  name: string
  value?: number
}`,
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: test2PackageReleaseId5,
    file_path: "README.md",
    content_text: `# Test2 Package v0.0.6

Unreleased version - not marked as latest.

## Usage
\`\`\`tsx
import { TestComponent } from "@tsci/testuser.test2-package"

<TestComponent name="R1" value={50} />
\`\`\``,
    created_at: new Date().toISOString(),
    is_text: true,
  })

  db.updatePackage(test2Package.package_id, {
    latest_package_release_id: test2PackageReleaseId4,
  })

  // Add package domains for test2-package
  db.addPackageDomain({
    points_to: "package_release",
    package_release_id: test2PackageReleaseId4,
    package_id: test2Package.package_id,
    fully_qualified_domain_name: "test2-package.tscircuit.app",
  })
  db.addPackageDomain({
    points_to: "package_release",
    package_release_id: test2PackageReleaseId4,
    package_id: test2Package.package_id,
    fully_qualified_domain_name: "my-board-preview.tscircuit.app",
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
    package_build_website_url: null,
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
    package_build_website_url: "http://localhost:3000/preview/package_build_1",
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
    org_display_name: "Test Organization",
    tscircuit_handle: "test-organization",
    github_handle: "tscircuit",
    owner_account_id: account_id,
    org_id: "org-test-1234",
  })

  // Add org member
  db.addOrganizationAccount({
    org_id: testOrg.org_id,
    account_id: account_id,
    is_owner: true,
  })

  // Test  Org Package addition
  const testOrgPackage = db.addPackage({
    name: "test-organization/test-org-package",
    unscoped_name: "test-org-package",
    creator_account_id: account_id,
    owner_org_id: testOrg.org_id,
    owner_github_username: testOrg.github_handle,
    description: "A test package for development",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_source_from_github: false,
    snippet_type: "package",
    latest_package_release_id: null,
    latest_version: "0.0.1",
    license: "MIT",
    website: "https://tscircuit.com",
    star_count: 10,
    ai_description:
      "A comprehensive test package designed for development and testing purposes. This package includes various components and utilities commonly used in circuit design and simulation workflows.",
    ai_usage_instructions:
      "Import the package using `import { TestComponent } from '@tsci/test-organization.test-org-package'`. Use the TestComponent in your circuit designs by providing the required props. Example: `<TestComponent name='my-test' value={42} />`",
    default_view: "files",
    latest_pcb_preview_image_url: `/api/packages/images/test-organization/test-org-package/pcb.png`,
    latest_cad_preview_image_url: `/api/packages/images/test-organization/test-org-package/3d.png`,
    latest_sch_preview_image_url: `/api/packages/images/test-organization/test-org-package/schematic.png`,
  })
  const { package_release_id: testOrgPackageReleaseId } = db.addPackageRelease({
    package_id: testOrgPackage.package_id,
    version: "0.0.1",
    created_at: new Date().toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,

    pcb_preview_image_url: `/api/packages/images/test-organization/test-org-package/pcb.png`,
    cad_preview_image_url: `/api/packages/images/test-organization/test-org-package/3d.png`,
    sch_preview_image_url: `/api/packages/images/test-organization/test-org-package/schematic.png`,
  })
  db.addPackageFile({
    package_release_id: testOrgPackageReleaseId,
    file_path: "index.tsx",
    content_text: `
    export const TestComponent = ({ name }: { name: string }) => (
      <resistor name={name} resistance="10k" />
    )
    `.trim(),
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageFile({
    package_release_id: testOrgPackageReleaseId,
    file_path: "/dist/circuit.json",
    content_text: `[
      {
        "type": "source_project_metadata",
        "source_project_metadata_id": "source_project_metadata_0",
        "software_used_string": "@tscircuit/core@0.0.813"
      },
      {
        "type": "source_group",
        "source_group_id": "source_group_0",
        "is_subcircuit": true,
        "was_automatically_named": true,
        "subcircuit_id": "subcircuit_source_group_0"
      },
      {
        "type": "source_board",
        "source_board_id": "source_board_0",
        "source_group_id": "source_group_0"
      },
      {
        "type": "schematic_group",
        "schematic_group_id": "schematic_group_0",
        "is_subcircuit": true,
        "subcircuit_id": "subcircuit_source_group_0",
        "name": "unnamed_board1",
        "center": {
          "x": 0,
          "y": 0
        },
        "width": 0,
        "height": 0,
        "schematic_component_ids": [],
        "source_group_id": "source_group_0"
      },
      {
        "type": "pcb_board",
        "pcb_board_id": "pcb_board_0",
        "center": {
          "x": 0,
          "y": 0
        },
        "thickness": 1.4,
        "num_layers": 2,
        "width": 10,
        "height": 10,
        "material": "fr4"
      }
    ]`.trim(),
    created_at: new Date().toISOString(),
    is_text: true,
  })
  db.addPackageBuild({
    package_release_id: testOrgPackageReleaseId,
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
    build_logs:
      "Build process:\n" +
      "1. Environment setup - OK\n" +
      "2. Dependency resolution - OK\n" +
      "3. Code compilation - OK\n" +
      "4. Circuit validation - OK\n" +
      "5. Package assembly - OK\n" +
      "Build completed successfully",
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
    package_build_website_url:
      "http://localhost:3000/preview/org_package_build",
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
    github_handle: "tscircuit",
    is_personal_org: true,
    org_id: "org-1234",
  })

  db.addOrganizationAccount({
    org_id: "org-1234",
    account_id: account_id,
    is_owner: true,
  })

  db.addOrganization({
    name: "seveibar",
    owner_account_id: seveibarAcc.account_id,
    github_handle: "seveibar",
    is_personal_org: true,
    org_id: "org-1235",
    avatar_url: "https://github.com/seveibar.png",
  })

  db.addOrganizationAccount({
    org_id: testOrg.org_id,
    account_id: seveibarAcc.account_id,
  })

  // Add a package with a custom 3D model (GLB file)
  const glbModelPackage = db.addPackage({
    name: "testuser/custom-3d-model",
    unscoped_name: "custom-3d-model",
    creator_account_id: account_id,
    owner_org_id: "org-1234",
    owner_github_username: "testuser",
    description: "A package demonstrating custom 3D CAD model usage",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_source_from_github: false,
    snippet_type: "package",
    latest_package_release_id: null,
    latest_version: "0.0.1",
    license: "MIT",
    website: "https://tscircuit.com",
    star_count: 5,
    ai_description:
      "A package that demonstrates how to use custom 3D CAD models (GLB files) with tscircuit components.",
    ai_usage_instructions:
      "Import the default component and use it in your circuit design. The component includes a custom 3D model for visualization.",
    default_view: "3d",
  })

  const { package_release_id: glbModelReleaseId } = db.addPackageRelease({
    package_id: glbModelPackage.package_id,
    version: "0.0.1",
    created_at: new Date().toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
  })

  db.addPackageDomain({
    points_to: "package_release_with_tag",
    package_id: glbModelPackage.package_id,
    tag: "latest",
    fully_qualified_domain_name: "custom-3d-model.tscircuit.app",
  })

  // Update the package to link to the release
  db.updatePackage(glbModelPackage.package_id, {
    latest_package_release_id: glbModelReleaseId,
  })

  // Add the index.tsx file
  db.addPackageFile({
    package_release_id: glbModelReleaseId,
    file_path: "index.tsx",
    content_text: `import glbUrl from "./test.glb"
export default () => (
  <board>
    <chip
      name="U1"
      cadModel={
        <cadassembly>
          <cadmodel
            modelUrl={glbUrl}
            modelUnitToMmScale={1000}
            positionOffset={{ x: 0, y: 0, z: 0.2 }}
          />
        </cadassembly>
      }
    />
  </board>
)`,
    created_at: new Date().toISOString(),
    is_text: true,
  })

  try {
    const glbFilePath = join(__dirname, "assets", "test.glb")
    const glbFileContent = readFileSync(glbFilePath)
    db.addPackageFile({
      package_release_id: glbModelReleaseId,
      file_path: "test.glb",
      content_bytes: glbFileContent,
      content_mimetype: "model/gltf-binary",
      created_at: new Date().toISOString(),
      is_text: false,
    })
  } catch {}

  db.addPackageFile({
    package_release_id: glbModelReleaseId,
    file_path: "dist/index/circuit.json",
    content_text: `[
  {
    "type": "source_project_metadata",
    "source_project_metadata_id": "source_project_metadata_0",
    "software_used_string": "@tscircuit/core@0.0.1013"
  },
  {
    "type": "source_group",
    "source_group_id": "source_group_0",
    "is_subcircuit": true,
    "was_automatically_named": true,
    "subcircuit_id": "subcircuit_source_group_0"
  },
  {
    "type": "source_component",
    "source_component_id": "source_component_0",
    "ftype": "simple_chip",
    "name": "U1",
    "supplier_part_numbers": {},
    "source_group_id": "source_group_0"
  },
  {
    "type": "source_board",
    "source_board_id": "source_board_0",
    "source_group_id": "source_group_0"
  },
  {
    "type": "schematic_component",
    "schematic_component_id": "schematic_component_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "rotation": 0,
    "size": {
      "width": 0.4,
      "height": 0.4
    },
    "pin_spacing": 0.2,
    "port_labels": {},
    "source_component_id": "source_component_0",
    "schematic_group_id": "schematic_group_0"
  },
  {
    "type": "schematic_text",
    "schematic_text_id": "schematic_text_0",
    "text": "",
    "schematic_component_id": "schematic_component_0",
    "anchor": "left",
    "rotation": 0,
    "position": {
      "x": -0.2,
      "y": -0.33
    },
    "color": "#006464",
    "font_size": 0.18
  },
  {
    "type": "schematic_text",
    "schematic_text_id": "schematic_text_1",
    "text": "U1",
    "schematic_component_id": "schematic_component_0",
    "anchor": "left",
    "rotation": 0,
    "position": {
      "x": -0.2,
      "y": 0.33
    },
    "color": "#006464",
    "font_size": 0.18
  },
  {
    "type": "schematic_group",
    "schematic_group_id": "schematic_group_0",
    "is_subcircuit": true,
    "subcircuit_id": "subcircuit_source_group_0",
    "name": "unnamed_board1",
    "center": {
      "x": 0,
      "y": 0
    },
    "width": 0,
    "height": 0,
    "schematic_component_ids": [],
    "source_group_id": "source_group_0"
  },
  {
    "type": "pcb_component",
    "pcb_component_id": "pcb_component_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "width": 2,
    "height": 3,
    "layer": "top",
    "rotation": 0,
    "source_component_id": "source_component_0",
    "subcircuit_id": "subcircuit_source_group_0",
    "do_not_place": false,
    "obstructs_within_bounds": true
  },
  {
    "type": "pcb_board",
    "pcb_board_id": "pcb_board_0",
    "source_board_id": "source_board_0",
    "center": {
      "x": 0,
      "y": 0
    },
    "thickness": 1.4,
    "num_layers": 2,
    "width": 6,
    "height": 7,
    "material": "fr4"
  },
  {
    "type": "cad_component",
    "cad_component_id": "cad_component_0",
    "position": {
      "x": 0,
      "y": 0,
      "z": 0.8999999999999999
    },
    "rotation": {
      "x": 0,
      "y": 0,
      "z": 0
    },
    "pcb_component_id": "pcb_component_0",
    "source_component_id": "source_component_0",
    "model_unit_to_mm_scale_factor": 1000,
    "model_glb_url": "./test.glb"
  }
]`,
    created_at: new Date().toISOString(),
    is_text: true,
  })

  // Add a successful build for the GLB model package
  db.addPackageBuild({
    package_release_id: glbModelReleaseId,
    created_at: new Date().toISOString(),
    transpilation_in_progress: false,
    transpilation_started_at: new Date(Date.now() - 5000).toISOString(),
    transpilation_completed_at: new Date(Date.now() - 3000).toISOString(),
    transpilation_logs: [
      "[INFO] Starting transpilation...",
      "[INFO] Parsing package code",
      "[INFO] Processing GLB asset file",
      "[INFO] Generating TypeScript definitions",
      "[SUCCESS] Transpilation completed successfully",
    ],
    transpilation_error: null,
    circuit_json_build_in_progress: false,
    circuit_json_build_started_at: new Date(Date.now() - 3000).toISOString(),
    circuit_json_build_completed_at: new Date(Date.now() - 1000).toISOString(),
    circuit_json_build_logs: [
      "[INFO] Starting circuit JSON build...",
      "[INFO] Loading custom 3D model",
      "[INFO] Validating CAD assembly structure",
      "[SUCCESS] Circuit JSON build completed",
    ],
    circuit_json_build_error: null,
    build_in_progress: false,
    build_started_at: new Date(Date.now() - 10000).toISOString(),
    build_completed_at: new Date().toISOString(),
    build_error: null,
    build_error_last_updated_at: new Date().toISOString(),
    build_logs:
      "Build process:\n" +
      "1. Environment setup - OK\n" +
      "2. Asset processing - OK\n" +
      "3. Code compilation - OK\n" +
      "4. 3D model validation - OK\n" +
      "Build completed successfully",
  })

  // Create a new release for the GLB model package
  const { package_release_id: glbModelReleaseId2 } = db.addPackageRelease({
    package_id: glbModelPackage.package_id,
    version: "0.0.2",
    created_at: new Date().toISOString(),
    is_latest: true,
    is_locked: false,
    has_transpiled: true,
    transpilation_error: null,
  })
}
