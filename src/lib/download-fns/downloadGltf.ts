import { saveAs } from "file-saver"
import type * as THREE from "three"
import { GLTFExporter, type GLTFExporterOptions } from "three-stdlib"

export const downloadGltf = async (fileName: string) => {
  const threeJsObject = window.TSCIRCUIT_3D_OBJECT_REF as THREE.Object3D
  if (!threeJsObject) {
    throw new Error(
      "To download the 3D model, please open the 3D view first and run the package",
    )
  }

  const exporter = new GLTFExporter()

  const options: GLTFExporterOptions = {
    binary: true,
  }

  const {
    promise: gltfPromise,
    resolve: resolveGltf,
    reject: rejectGltf,
  } = Promise.withResolvers<Blob>()

  exporter.parse(
    threeJsObject,
    (gltf) => {
      const type = options.binary ? "gltf-binary" : "gltf+json"
      const blob = new Blob(
        [gltf instanceof ArrayBuffer ? gltf : JSON.stringify(gltf)],
        { type: `model/${type}` },
      )
      resolveGltf(blob)
    },
    rejectGltf,
    options,
  )

  const gltfBlob = await gltfPromise

  const extension = options.binary ? ".glb" : ".gltf"
  saveAs(gltfBlob, fileName + extension)
}
