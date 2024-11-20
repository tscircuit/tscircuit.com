export default {
  cacheKey: "test",
  pcbTraces: [
    {
      type: "pcb_trace",
      pcb_trace_id: "pcb_trace_0",
      route: [
        {
          route_type: "wire",
          x: -1.5,
          y: 0,
          width: 0.16,
          layer: "top",
          start_pcb_port_id: "pcb_port_1",
        },
        {
          route_type: "wire",
          x: 1.5,
          y: 0,
          width: 0.16,
          layer: "top",
          end_pcb_port_id: "pcb_port_2",
        },
      ],
      source_trace_id: "source_trace_0",
    },
  ],
}
