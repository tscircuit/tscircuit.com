import { saveAs } from "file-saver"

export const downloadGLTFFileFromUrl = async (
  blobUrl: string,
  fileName: string,
) => {
  return saveAs(blobUrl, `${fileName}.gltf`)
}
