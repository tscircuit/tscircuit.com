/**
 * Some relevant code from another project
import { AppContext } from "../util/app-context"
import { z } from "zod"
import * as Path from "path"
import { unlink } from "node:fs/promises"
import * as fs from "fs"
import {
  stringifyGerberCommandLayers,
  convertSoupToGerberCommands,
  convertSoupToExcellonDrillCommands,
  stringifyExcellonDrill,
} from "circuit-json-to-gerber"
import kleur from "kleur"
import archiver from "archiver"
import { AnyCircuitElement } from "circuit-json"

export const exportGerbersToFile = async (
  params: {
    circuitJson: AnyCircuitElement[]
    example_file_path: string
    export_name?: string
    output_zip_path: string
  },
  ctx: AppContext,
) => {
  console.log(kleur.gray("[soupifying]..."))

  console.log(kleur.gray("[soup to gerber json]..."))
  const gerber_layer_cmds = convertSoupToGerberCommands(circuitJson, {
    flip_y_axis: false,
  })

  console.log(kleur.gray("[soup to drl json]..."))
  const drill_cmds = convertSoupToExcellonDrillCommands({
    soup: circuitJson,
    is_plated: true,
    flip_y_axis: false,
  })

  console.log(kleur.gray("[stringify gerber json]..."))
  const gerber_file_contents = stringifyGerberCommandLayers(gerber_layer_cmds)
  console.log(kleur.gray("[stringify drl json]..."))
  const drill_file_contents = {
    plated: stringifyExcellonDrill(drill_cmds),
  }

  console.log(kleur.gray("[writing gerbers to tmp dir]..."))
  const tempDir = Path.join(".tscircuit", "tmp-gerber-export")
  fs.rmSync(tempDir, { recursive: true, force: true })
  fs.mkdirSync(tempDir, { recursive: true })
  for (const [fileName, fileContents] of Object.entries(gerber_file_contents)) {
    const filePath = Path.join(tempDir, fileName)
    await fs.writeFileSync(`${filePath}.gbr`, fileContents)
  }
  for (const [fileName, fileContents] of Object.entries(drill_file_contents)) {
    const filePath = Path.join(tempDir, fileName)
    await fs.writeFileSync(`${filePath}.drl`, fileContents)
  }

  console.log(kleur.gray("[zipping tmp dir]..."))
  console.log(kleur.gray("  writing to " + params.output_zip_path))
  const output = fs.createWriteStream(params.output_zip_path)

  const archive = archiver("zip", {
    zlib: { level: 9 },
  })

  archive.pipe(output)
  archive.directory(tempDir, false)

  await new Promise((resolve, reject) => {
    output.on("close", resolve)
    output.on("finish", resolve)
    output.on("end", resolve)
    output.on("error", reject)
    archive.finalize()
  })
}

export const exportGerbersToZipBuffer = async (
  params: {
    example_file_path: string
    export_name?: string
  },
  ctx: AppContext,
) => {
  const tempDir = Path.join(".tscircuit", "tmp-gerber-zip")
  fs.mkdirSync(tempDir, { recursive: true })

  await exportGerbersToFile(
    {
      example_file_path: params.example_file_path,
      export_name: params.export_name,
      output_zip_path: Path.join(tempDir, "gerbers.zip"),
    },
    ctx,
  )

  const buffer = fs.readFileSync(Path.join(tempDir, "gerbers.zip"))

  fs.rmSync(tempDir, { recursive: true })

  return buffer
}


import { AppContext } from "../util/app-context"
import { soupify } from "cli/lib/soupify"
import kleur from "kleur"
import {
  convertCircuitJsonToBomRows,
  convertBomRowsToCsv,
} from "circuit-json-to-bom-csv"

export const exportBomCsvToBuffer = async (
  params: {
    example_file_path: string
    export_name?: string
  },
  ctx: AppContext,
) => {
  console.log(kleur.gray("[soupifying]..."))
  const circuitJson = await circuitJsonify(
    {
      filePath: params.example_file_path,
      exportName: params.export_name,
    },
    ctx,
  )

  console.log(kleur.gray("[circuitJson to bom rows]..."))
  const bom_rows = await convertCircuitJsonToBomRows({ circuitJson: circuitJson })

  console.log(kleur.gray("[bom rows to csv]..."))
  const bom_csv = await convertBomRowsToCsv(bom_rows)

  return Buffer.from(bom_csv, "utf-8")
}


import { AppContext } from "../util/app-context"
import { z } from "zod"
import * as Path from "path"
import { unlink } from "node:fs/promises"
import { soupify } from "cli/lib/soupify"
import { convertCircuitJsonToPickAndPlaceCsv } from "circuit-json-to-pnp-csv"
import * as fs from "fs"
import kleur from "kleur"
import archiver from "archiver"

export const exportPnpCsvToBuffer = async (
  params: {
    example_file_path: string
    export_name?: string
  },
  ctx: AppContext,
) => {
  console.log(kleur.gray("[soupifying]..."))
  const circuitJson = await soupify(
    {
      filePath: params.example_file_path,
      exportName: params.export_name,
    },
    ctx,
  )

  console.log(kleur.gray("[circuitJson to pnp csv string]..."))
  const pnp_csv = await convertCircuitJsonToPickAndPlaceCsv(circuitJson)

  return Buffer.from(pnp_csv, "utf-8")
}



*/

import { AnyCircuitElement } from "circuit-json"
import { saveAs } from "file-saver"

export const downloadFabricationFiles = async ({
  circuitJson,
  snippetUnscopedName,
}: {
  circuitJson: AnyCircuitElement[]
  snippetUnscopedName: string
}) => {
  // TODO
}
