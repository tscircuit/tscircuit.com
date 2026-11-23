import type { PushButtonProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
} as const

export const HX_3x4x2_2P_1_6N_TACTILE_SWITCH = (
  props: PushButtonProps<typeof pinLabels>,
) => {
  const { name = "SW1", ...restProps } = props

  return (
    <pushbutton
      name={name}
      pinLabels={pinLabels}
      supplierPartNumbers={{
        jlcpcb: ["C49234124"],
      }}
      manufacturerPartNumber="HX 3x4x2-2P-1.6N TACTILE SWITCH"
      footprint="smdpads2_p4.318mm_pw1.3mm_ph1.7mm_cyw6.118mm_cyh3.4mm"
      cadModel={{
        objUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C49234124.obj?uuid=167cb812923f4f7cbb49e982a3bb3b9d",
        stepUrl:
          "https://modelcdn.tscircuit.com/easyeda_models/assets/C49234124.step?uuid=167cb812923f4f7cbb49e982a3bb3b9d",
        pcbRotationOffset: 0,
        modelOriginPosition: { x: 0, y: 0.000012699999956566899, z: -0.01 },
      }}
      {...restProps}
    />
  )
}
