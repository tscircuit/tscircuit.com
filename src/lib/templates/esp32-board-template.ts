import board from "./esp32-wifi-sounder/index.tsx?raw" with { type: "text" }
import UsbC from "./esp32-wifi-sounder/imports/TYPE_C_31_M_12.tsx?raw" with {
  type: "text",
}
import AP2112K from "./esp32-wifi-sounder/imports/AP2112K_3_3TRG1.tsx?raw" with {
  type: "text",
}
import ESP32C6 from "./esp32-wifi-sounder/imports/ESP32_C6_WROOM_1_N8.tsx?raw" with {
  type: "text",
}
import BootSwitch from "./esp32-wifi-sounder/imports/HX_3x4x2_2P_1_6N_TACTILE_SWITCH.tsx?raw" with {
  type: "text",
}
import LM4861 from "./esp32-wifi-sounder/imports/LM4861MX_NOPB.tsx?raw" with {
  type: "text",
}
import Piezo from "./esp32-wifi-sounder/imports/CPT_9019S_SMT_TR.tsx?raw" with {
  type: "text",
}

export const esp32BoardTemplate = {
  type: "board",
  fsMap: {
    "index.tsx": board,
    "imports/TYPE_C_31_M_12.tsx": UsbC,
    "imports/AP2112K_3_3TRG1.tsx": AP2112K,
    "imports/ESP32_C6_WROOM_1_N8.tsx": ESP32C6,
    "imports/HX_3x4x2_2P_1_6N_TACTILE_SWITCH.tsx": BootSwitch,
    "imports/LM4861MX_NOPB.tsx": LM4861,
    "imports/CPT_9019S_SMT_TR.tsx": Piezo,
  },
}
