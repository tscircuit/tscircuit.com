import * as React from 'react';
import { getImportsFromCode } from "@tscircuit/prompt-benchmarks/code-runner-utils";
import * as tscircuitCore from "@tscircuit/core";
import * as jscadFiber from "jscad-fiber";
import type { AnyCircuitElement } from "circuit-json";
import { safeCompileTsx } from '@/hooks/use-compiled-tsx';
import { evalCompiledJs } from '@/hooks/use-run-tsx/eval-compiled-js';
import { constructCircuit } from '@/hooks/use-run-tsx/construct-circuit';

type GenerateCircuitJson = {
    code: string;
    type: "board" | "footprint" | "package" | "model";
    compiled_js: string;
}

// Keeping track of processed imports to avoid circular dependencies
const processedImports = new Set<string>();

async function processImport(
    importName: string, 
    preSuppliedImports: Record<string, any>, 
    depth = 0,
    code: string,
    compiled_js: string
): Promise<void> {
    if (!importName.startsWith("@tsci/")) return;
    if (preSuppliedImports[importName]) return;
    if (processedImports.has(importName)) return;
    if (depth > 5) {
        throw new Error(`Max depth for imports reached when processing ${importName}`);
    }

    processedImports.add(importName);

    try {
        // Process nested imports first
        const nestedImports = getImportsFromCode(code);
        
        // Filter out already processed imports and non-@tsci imports
        const validNestedImports = nestedImports.filter(imp => 
            imp.startsWith("@tsci/") && 
            !processedImports.has(imp) && 
            !preSuppliedImports[imp]
        );

        // Process each valid nested import
        for (const nestedImport of validNestedImports) {
            await processImport(nestedImport, preSuppliedImports, depth + 1, code, compiled_js);
        }

        // Set React in the global scope before evaluation
        (globalThis as any).React = React;
        const exports = evalCompiledJs(compiled_js).exports;
        
        // Only set the import if we successfully evaluated it
        if (exports) {
            preSuppliedImports[importName] = exports;
        }
    } catch (e) {
        processedImports.delete(importName); // Clean up on error
    }
}

export const generateCircuitJson = async ({ code, type, compiled_js }: GenerateCircuitJson): Promise<AnyCircuitElement[]> => {
    // Clear the processed imports set at the start of each generation
    processedImports.clear();
    
    // Set up pre-supplied imports
    const preSuppliedImports: Record<string, any> = {
        "@tscircuit/core": tscircuitCore,
        "react": React,
        "jscad-fiber": jscadFiber
    };

    (globalThis as any).React = React;
    (globalThis as any).createElement = React.createElement;
    
    try {
        // Process all @tsci imports
        const tsciImports = getImportsFromCode(code).filter(imp => imp.startsWith("@tsci/"));
        for (const importName of tsciImports) {
            await processImport(importName, preSuppliedImports, 0, code, compiled_js);
        }
        
        // Create require function for imports
        const __tscircuit_require = (name: string) => {
            if (!preSuppliedImports[name]) {
                throw new Error(
                    `Import "${name}" not found (available imports: ${Object.keys(preSuppliedImports).join(", ")})`
                );
            }
            return preSuppliedImports[name];
        };
        (globalThis as any).__tscircuit_require = __tscircuit_require;

        // Add a custom JSX runtime
        (globalThis as any).jsx = React.createElement;
        (globalThis as any).jsxs = React.createElement;
        
        const { success, compiledTsx, error } = safeCompileTsx(code);
        if (!success || !compiledTsx) {
            throw new Error(`Compile Error: ${error?.message || 'Unknown compilation error'}`);
        }

        const module = evalCompiledJs(compiledTsx);
        const componentExportKeys = Object.keys(module.exports).filter(
            (key) => !key.startsWith("use")
        );

        if (componentExportKeys.length > 1) {
            throw new Error(
                `Too many exports, only export one component. Exports: ${JSON.stringify(componentExportKeys)}`
            );
        }

        const primaryKey = componentExportKeys[0];
        
        // Create the user element with explicit React scope
        const UserElm = function(props: any) {
            return React.createElement(module.exports[primaryKey], props);
        };

        // Construct and render the circuit
        const circuit = constructCircuit(UserElm, type);
        
        // Wait for the circuit to settle
        await circuit.renderUntilSettled();
        
        return circuit.getCircuitJson() as AnyCircuitElement[];
    } catch (e) {
        throw new Error("Circuit generation failed!");
    }
};