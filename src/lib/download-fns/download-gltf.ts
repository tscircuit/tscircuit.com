import { saveAs } from "file-saver"

export const downloadGLTFFileFromUrl = async (blobUrl: string, fileName:string) => {
  await fetch(blobUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch Blob. Status: ${response.status}`);
      }
      return response.blob();
    })
    .then((blob) => {
      saveAs(blob, `${fileName}.gltf`);
    })
}