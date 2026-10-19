import { ChipProps, PinAttributeMap, SchematicPinArrangement, SupplierPartNumbers } from '@tscircuit/props';
import { D as Datasheet } from '../schema-BScZniUB.js';
import 'zod';

type DatasheetPin = Omit<NonNullable<Datasheet["pin_information"]>[number], "name"> & {
    name: string | string[];
};
type DatasheetWithPinAttributes = Omit<Datasheet, "pin_information"> & {
    pin_information: DatasheetPin[] | null;
    internally_connected_pins?: ChipProps["internallyConnectedPins"] | null;
    pin_attributes?: Record<string, PinAttributeMap> | null;
    footprinter_string?: string | null;
    generated_tsx?: string | null;
    sch_pin_arrangement?: SchematicPinArrangement | null;
    symbol_tsx?: string | null;
    builtin_symbol_name?: string | null;
    supplier_part_numbers?: SupplierPartNumbers | null;
};

/** Merge current datasheet metadata into its published component, without evaluating it. */
declare const getDatasheetComponentTsx: (datasheet: DatasheetWithPinAttributes) => string | null;

export { getDatasheetComponentTsx };
