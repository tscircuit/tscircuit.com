import type { DbClient } from "./db-client"

export const seed = (db: DbClient) => {
  const { account_id } = db.addAccount({
    account_id: "account-1234",
    github_username: "testuser",
    shippingInfo: {
      fullName: "Test User",
      address: "123 Test St",
      city: "Testville",
      state: "NY",
      zipCode: "10001",
      country: "Ukraine",
    },
  })
  db.addAccount({
    github_username: "seveibar",
  })
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
  })

  db.addOrder({
    account_id,
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
    circuit_json: {
      type: "source_component",
      ftype: "simple_resistor",
      source_component_id: "source_component_1",
      name: "R1",
      resistane: "1k",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}
