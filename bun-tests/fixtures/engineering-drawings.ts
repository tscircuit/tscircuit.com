import type { CircuitJson } from "circuit-json"

export const engineeringDrawingCircuitJson: CircuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "carrier",
    center: { x: 0, y: 0 },
    width: 30,
    height: 20,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  },
  ...[
    {
      name: "carrier-inspection",
      label: "Carrier inspection",
      title: "CARRIER INSPECTION",
    },
    {
      name: "carrier-section",
      label: "Mounting hole section",
      title: "CARRIER SECTION",
    },
  ].flatMap(
    ({ name, label, title }, index): CircuitJson => [
      {
        type: "drawing_page",
        drawing_page_id: name,
        name,
        display_name: label,
        width: 297,
        height: 210,
      },
      {
        type: "drawing_part_view",
        drawing_part_view_id: `${name}-view`,
        drawing_page_id: name,
        direction: index === 0 ? "z_positive" : "y_positive",
        section:
          index === 0
            ? undefined
            : {
                axis: "y",
                offset: 0,
                keep_side: "less",
                hatch_spacing: 1,
              },
        center: { x: 0, y: 0 },
        width: 40,
        height: 30,
      },
      {
        type: "drawing_page_title_block",
        drawing_page_title_block_id: `${name}-title`,
        drawing_page_id: name,
        title,
        sheet_number: index + 1,
        number_of_sheets: 2,
      },
    ],
  ),
]
