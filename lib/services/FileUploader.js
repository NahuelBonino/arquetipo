import { apiFileClient } from "@/lib/apiClient";
import { readFileAsync } from "@/lib/utils/fileUtils";

/**
 *
 * @param {ArrayBuffer | File} content El contenido del archivo
 * @param {SgArchivo} archivo Entidad con los datos del archivo puede ser null
 * @param {String} name Nombre del archivo
 * @param {String} contentType  Tipo del contenido
 */

const uploadTmpFile = async (content, archivo, name, contentType) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (archivo == null) {
        archivo = {};
      }

      if (!archivo.filUploaded) {
        if (isFile(content)) {
          content = await readFileAsync(content);
        }
        if (!contentType) {
          contentType = "application/octet-stream";
        }

        let path = await apiFileClient.post(
          "/v1/archivos/tmp/upload",
          content,
          {
            params: {
              contentType: contentType,
              name: name,
            },
          }
        );
        archivo.nombre = name;
        archivo.contentType = contentType;
        archivo.tmpUuid = path;
        archivo.filUploaded = true;
      }

      resolve(archivo);
    } catch (error) {
      reject(error);
    }
  });
};

const isFile = (input) => "File" in window && input instanceof File;

export { uploadTmpFile };
