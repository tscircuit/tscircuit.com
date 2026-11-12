import type { PreviewParameterValues } from "./package-preview-parameters"

export type PackageComponentExport = {
  name: string
  isDefault: boolean
}

// Inspect the published declarations rather than guessing an export from the
// package slug. In particular, packages may export schemas alongside a circuit.
export async function findPackageComponentExport(
  declarations: string,
): Promise<PackageComponentExport | null> {
  const ts = await import("typescript")
  const source = ts.createSourceFile(
    "index.d.ts",
    declarations,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const candidates: PackageComponentExport[] = []
  for (const statement of source.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
      return { name: "Component", isDefault: true }
    }
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const specifier of statement.exportClause.elements) {
          if (specifier.isTypeOnly) continue
          const name = specifier.name.text
          if (name === "default") {
            return { name: "Component", isDefault: true }
          }
          if (/^[A-Z][A-Za-z0-9_$]*$/.test(name)) {
            candidates.push({ name, isDefault: false })
          }
        }
      }
    }
    const modifiers = ts.canHaveModifiers(statement)
      ? ts.getModifiers(statement)
      : undefined
    if (!modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
      continue
    if (modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      return { name: "Component", isDefault: true }
    }
    const names = ts.isFunctionDeclaration(statement)
      ? [statement.name?.text]
      : ts.isVariableStatement(statement)
        ? statement.declarationList.declarations.map((d) =>
            ts.isIdentifier(d.name) ? d.name.text : undefined,
          )
        : []
    for (const name of names) {
      if (name && /^[A-Z][A-Za-z0-9_$]*$/.test(name)) {
        candidates.push({ name, isDefault: false })
      }
    }
  }
  return candidates.length === 1 ? candidates[0] : null
}

export function getPackageUsage({
  packageName,
  component,
  values,
}: {
  packageName: string
  component: PackageComponentExport
  values: PreviewParameterValues
}) {
  const moduleName = `@tsci/${packageName.replace("/", ".")}`
  const importClause = component.isDefault
    ? "Component"
    : `{ ${component.name} as Component }`
  // JS expression attributes preserve strings containing quotes, braces, and
  // newlines, as well as false and numeric values (including zero).
  const props = Object.entries(values).map(([key, value]) =>
    /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
      ? `    ${key}={${JSON.stringify(value)}}`
      : `    {...{[${JSON.stringify(key)}]: ${JSON.stringify(value)}}}`,
  )
  return [
    `import ${importClause} from ${JSON.stringify(moduleName)}`,
    "",
    "export default () => (",
    props.length ? "  <Component" : "  <Component />",
    ...props,
    ...(props.length ? ["  />"] : []),
    ")",
  ].join("\n")
}
