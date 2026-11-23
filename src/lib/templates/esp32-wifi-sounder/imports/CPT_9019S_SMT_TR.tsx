import type { ResonatorProps } from "@tscircuit/props"

export const CPT_9019S_SMT_TR = (
  props: Omit<ResonatorProps, "frequency" | "loadCapacitance">,
) => (
  <resonator
    manufacturerPartNumber="CPT-9019S-SMT-TR"
    supplierPartNumbers={{ jlcpcb: ["C95163"] }}
    frequency="4kHz"
    pinVariant="no_ground"
    loadCapacitance="12nF"
    displayName="4 kHz piezo"
    footprint="smdpads2_p8mm_pw1.6mm_ph3.8mm_cyw10.1mm_cyh9.5mm"
    cadModel={{
      objUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C95163.obj?uuid=d00722379e0c4827877668a7a84ec15f",
      stepUrl:
        "https://modelcdn.tscircuit.com/easyeda_models/assets/C95163.step?uuid=d00722379e0c4827877668a7a84ec15f",
      pcbRotationOffset: 180,
      modelOriginPosition: { x: 0, y: 0, z: 0 },
    }}
    symbol={
      <symbol>
        <port
          pinNumber={1}
          name="pin1"
          direction="left"
          schX={-0.55}
          schY={0.3}
          schStemLength={0.35}
        />
        <port
          pinNumber={2}
          name="pin2"
          direction="left"
          schX={-0.55}
          schY={-0.3}
          schStemLength={0.35}
        />
        <schematicpath
          points={[
            { x: -0.2, y: -0.35 },
            { x: -0.2, y: 0.35 },
            { x: 0.1, y: 0.35 },
            { x: 0.4, y: 0.45 },
            { x: 0.4, y: -0.45 },
            { x: 0.1, y: -0.35 },
            { x: -0.2, y: -0.35 },
          ]}
        />
        <schematictext
          text="{NAME}"
          schX={0}
          schY={0.6}
          anchor="bottom_center"
          fontSize={0.18}
        />
        <schematictext
          text="4 kHz piezo"
          schX={0}
          schY={-0.65}
          anchor="top_center"
          fontSize={0.18}
        />
      </symbol>
    }
    {...props}
  />
)
