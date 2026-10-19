// src/lib/datasheet-component-tsx.ts
import ts from "typescript";

// src/lib/datasheet-schematic-symbol.ts
import { createSvgUrl } from "@tscircuit/create-snippet-url";

// src/lib/datasheet-pin-display.ts
var getPinNames = (pin) => [...new Set(Array.isArray(pin.name) ? pin.name : [pin.name])].filter(Boolean);

// src/lib/datasheet-schematic-symbol.ts
var jsxJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
var getPinLabels = (datasheet) => {
  const pins = datasheet.pin_information ?? [];
  const reserved = new Set(
    pins.flatMap((pin) => [`pin${pin.pin_number}`, pin.pin_number])
  );
  const aliases = /* @__PURE__ */ new Map();
  const rawByAlias = /* @__PURE__ */ new Map();
  const uniquePinAliases = /* @__PURE__ */ new Map();
  for (const pin of pins) {
    const physical = `pin${pin.pin_number}`;
    for (const name of getPinNames(pin)) {
      for (const alias of /* @__PURE__ */ new Set([name, name.trim()])) {
        if (!alias) continue;
        if (!uniquePinAliases.has(alias)) uniquePinAliases.set(alias, physical);
        else if (uniquePinAliases.get(alias) !== physical)
          uniquePinAliases.set(alias, null);
      }
    }
  }
  const primaryNames = pins.map(
    (pin) => getPinNames(pin).map((name) => name.trim()).find(Boolean) ?? ""
  );
  for (const name of primaryNames) {
    if (/^[A-Za-z0-9_]+$/.test(name) && !reserved.has(name)) {
      aliases.set(name, name);
      rawByAlias.set(name, name);
    }
  }
  const label = (raw, physical) => {
    if (!raw || raw === physical) return physical;
    const known = aliases.get(raw);
    if (known) return known;
    let alias = raw.replaceAll("+", "_PLUS").replace(/[-−]/g, "_MINUS").replace(
      /[^A-Za-z0-9_]/gu,
      (char) => `_u${char.codePointAt(0).toString(16)}_`
    );
    if (reserved.has(alias)) alias = `label_${alias}`;
    while (rawByAlias.has(alias) && rawByAlias.get(alias) !== raw)
      alias += "_alias";
    aliases.set(raw, alias);
    rawByAlias.set(alias, raw);
    return alias;
  };
  const pinLabels = Object.fromEntries(
    pins.map((pin, index) => {
      const physical = `pin${pin.pin_number}`;
      return [physical, [label(primaryNames[index], physical)]];
    })
  );
  return { pinLabels, aliases, uniquePinAliases };
};
var getBoxDimensions = (arrangement, labels) => {
  const sides = ["left", "right", "top", "bottom"];
  const allLabels = Object.values(labels).map(([label]) => label.length);
  const labelLengths = {};
  const counts = {};
  for (const side of sides) {
    const definition = arrangement[`${side}Side`];
    const pins = Array.isArray(definition) ? definition : definition?.pins;
    counts[side] = pins?.length ?? arrangement[`${side}PinCount`] ?? arrangement[`${side}Size`] ?? 0;
    labelLengths[side] = Math.max(
      0,
      ...pins ? pins.map((pin) => {
        const key = String(pin).startsWith("pin") ? String(pin) : `pin${pin}`;
        return labels[key]?.[0]?.length ?? String(pin).length;
      }) : counts[side] > 0 ? allLabels : []
    );
  }
  const width = 2 * Math.max(labelLengths.left, labelLengths.right) * 0.18 + Math.max(1.2, (Math.max(counts.top, counts.bottom) - 1) * 0.2 + 0.8);
  const height = Math.max(
    1.2,
    (labelLengths.top + labelLengths.bottom) * 0.18 + 0.8,
    (Math.max(counts.left, counts.right) - 1) * 0.2 + 0.8
  );
  return { width: Number(width.toFixed(3)), height: Number(height.toFixed(3)) };
};
var getDatasheetSchematicSource = (datasheet) => {
  const symbolTsx = datasheet.symbol_tsx?.trim();
  const builtinName = datasheet.builtin_symbol_name?.trim();
  const arrangement = datasheet.sch_pin_arrangement;
  if (!symbolTsx && !builtinName && !arrangement) return null;
  if (!symbolTsx && builtinName) {
    return `export default () => <schematicsymbol name="U1" displayName={${jsxJson(datasheet.chip_name ?? "U1")}} symbolName={${jsxJson(builtinName)}} />`;
  }
  const { pinLabels, aliases, uniquePinAliases } = getPinLabels(datasheet);
  const props = [
    'name="U1"',
    `displayName={${jsxJson(datasheet.chip_name ?? "U1")}}`,
    `pinLabels={${jsxJson(pinLabels)}}`
  ];
  if (symbolTsx) {
    props.push(`symbol={${symbolTsx}}`);
  } else if (arrangement) {
    const normalizedArrangement = { ...arrangement };
    for (const side of [
      "leftSide",
      "rightSide",
      "topSide",
      "bottomSide"
    ]) {
      const definition = arrangement[side];
      if (!definition) continue;
      const pins = Array.isArray(definition) ? definition : definition.pins;
      const normalizedPins = pins.map(
        (pin) => typeof pin === "string" && !/^(?:pin)?\d+$/.test(pin) ? uniquePinAliases.get(pin) ?? aliases.get(pin) ?? pin : pin
      );
      normalizedArrangement[side] = Array.isArray(definition) ? normalizedPins : { ...definition, pins: normalizedPins };
    }
    const { width, height } = getBoxDimensions(normalizedArrangement, pinLabels);
    props.push(
      `schPinArrangement={${jsxJson(normalizedArrangement)}}`,
      `schWidth={${width}}`,
      `schHeight={${height}}`
    );
  }
  return `export default () => <chip ${props.join(" ")} />`;
};

// src/lib/datasheet-component-tsx.ts
var parse = (source) => ts.createSourceFile(
  "component.tsx",
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX
);
var findChip = (source) => {
  let chip;
  const visit = (node) => {
    if (chip) return;
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && ["chip", "pushbutton"].includes(node.tagName.getText(source)))
      chip = node;
    else ts.forEachChild(node, visit);
  };
  visit(source);
  return chip;
};
var editSource = (source, edits) => edits.sort((a, b) => b.start - a.start).reduce(
  (result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end),
  source
);
var literal = (value) => JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
var getDatasheetComponentTsx = (datasheet) => {
  const preview = getDatasheetSchematicSource(datasheet);
  let source = datasheet.generated_tsx?.trim() || preview;
  if (!source && !datasheet.footprinter_string?.trim() && !datasheet.pin_attributes && !datasheet.internally_connected_pins)
    return null;
  const builtin = !datasheet.symbol_tsx?.trim() && Boolean(datasheet.builtin_symbol_name?.trim());
  if (!source || !datasheet.generated_tsx?.trim() && builtin)
    source = 'export default () => <chip name="U1" />';
  const file = parse(source);
  const chip = findChip(file);
  if (!chip) return source;
  const updates = /* @__PURE__ */ new Map();
  const existing = new Map(
    chip.attributes.properties.filter(ts.isJsxAttribute).map((attr) => [attr.name.getText(file), attr])
  );
  if (datasheet.internally_connected_pins !== void 0) {
    updates.set(
      "internallyConnectedPins",
      `internallyConnectedPins={${literal(datasheet.internally_connected_pins ?? [])}}`
    );
  }
  if (datasheet.supplier_part_numbers !== void 0) {
    updates.set(
      "supplierPartNumbers",
      `supplierPartNumbers={${literal(datasheet.supplier_part_numbers ?? {})}}`
    );
  }
  if (preview && !builtin) {
    const previewFile = parse(preview);
    const previewChip = findChip(previewFile);
    for (const attr of previewChip?.attributes.properties ?? []) {
      if (!ts.isJsxAttribute(attr)) continue;
      const name = attr.name.getText(previewFile);
      if (["symbol", "schPinArrangement", "schWidth", "schHeight"].includes(
        name
      ) || name === "pinLabels" && !existing.has(name))
        updates.set(name, attr.getText(previewFile));
    }
  }
  if (datasheet.footprinter_string?.trim())
    updates.set(
      "footprint",
      `footprint={${literal(datasheet.footprinter_string)}}`
    );
  if (datasheet.pin_attributes) {
    const namedPins = new Set(
      (datasheet.pin_information ?? []).map((pin) => pin.pin_number).filter((pin) => !/^\d+$/.test(pin))
    );
    const attributes = Object.fromEntries(
      Object.entries(datasheet.pin_attributes).map(([name, value]) => [
        name.startsWith("pin") && namedPins.has(name.slice(3)) ? name.slice(3) : name,
        value
      ])
    );
    updates.set("pinAttributes", `pinAttributes={${literal(attributes)}}`);
  }
  if (builtin)
    updates.set("noSchematicRepresentation", "noSchematicRepresentation");
  const edits = [];
  const inactive = builtin ? ["symbol", "schPinArrangement", "schWidth", "schHeight"] : datasheet.symbol_tsx?.trim() ? ["schPinArrangement", "noSchematicRepresentation"] : datasheet.sch_pin_arrangement ? ["symbol", "noSchematicRepresentation"] : [];
  for (const name of inactive) {
    const previous = existing.get(name);
    if (previous)
      edits.push({
        start: previous.getStart(file),
        end: previous.end,
        text: ""
      });
  }
  const additions = [];
  for (const [name, text] of updates) {
    const previous = existing.get(name);
    if (previous)
      edits.push({ start: previous.getStart(file), end: previous.end, text });
    else additions.push(text);
  }
  if (additions.length) {
    const position = chip.attributes.properties.find(ts.isJsxSpreadAttribute)?.getStart(file) ?? chip.attributes.end;
    edits.push({
      start: position,
      end: position,
      text: `
    ${additions.join("\n    ")}
    `
    });
  }
  source = editSource(source, edits);
  if (builtin && preview) {
    const updated = parse(source);
    const updatedChip = findChip(updated);
    const element = ts.isJsxOpeningElement(updatedChip) ? updatedChip.parent : updatedChip;
    const symbolFile = parse(preview);
    let symbol;
    const visit = (node) => {
      if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(symbolFile) === "schematicsymbol")
        symbol = node;
      ts.forEachChild(node, visit);
    };
    visit(symbolFile);
    if (symbol)
      source = editSource(source, [
        {
          start: element.getStart(updated),
          end: element.end,
          text: `<group subcircuit>
${element.getText(updated)}
${symbol.getText(symbolFile).replace('name="U1"', 'name="A"')}
</group>`
        }
      ]);
  }
  return source;
};
export {
  getDatasheetComponentTsx
};
