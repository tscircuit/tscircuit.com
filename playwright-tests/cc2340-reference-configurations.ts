// Published package contract: each option has a distinct purpose and real values.
export const cc2340Configurations = [
  {
    preset: "",
    label: "Default",
    count: 27,
    lf: true,
    header: true,
    voltage: 2.5,
    bulk: 10e-6,
    reset: 100e3,
  },
  {
    preset: "internal_lf_clock",
    label: "Internal LF clock",
    count: 24,
    lf: false,
    header: true,
    voltage: 2.5,
    bulk: 10e-6,
    reset: 100e3,
  },
  {
    preset: "supply_1v8",
    label: "Supply 1.8 V",
    count: 27,
    lf: true,
    header: true,
    voltage: 1.8,
    bulk: 10e-6,
    reset: 100e3,
  },
  {
    preset: "supply_3v3",
    label: "Supply 3.3 V",
    count: 27,
    lf: true,
    header: true,
    voltage: 3.3,
    bulk: 10e-6,
    reset: 100e3,
  },
  {
    preset: "input_bulk_22uf",
    label: "Input bulk 22 µF",
    count: 27,
    lf: true,
    header: true,
    voltage: 2.5,
    bulk: 22e-6,
    reset: 100e3,
  },
  {
    preset: "reset_pullup_10k",
    label: "Reset pull-up 10 kΩ",
    count: 27,
    lf: true,
    header: true,
    voltage: 2.5,
    bulk: 10e-6,
    reset: 10e3,
  },
  {
    preset: "coin_cell_3v0",
    label: "Coin cell 3.0 V",
    count: 26,
    lf: true,
    header: false,
    voltage: 3,
    bulk: 22e-6,
    reset: 100e3,
  },
  {
    preset: "minimal",
    label: "Minimal",
    count: 23,
    lf: false,
    header: false,
    voltage: 2.5,
    bulk: 10e-6,
    reset: 100e3,
  },
] as const

export const cc2340Release =
  process.env.TSCIRCUIT_REFERENCE_RELEASE ||
  "25f8c0bb-22d0-47cc-8524-4132119d387c"
export const cc2340Path = (preset: string) =>
  `dist/index/${preset ? preset + "/" : ""}circuit.json`
