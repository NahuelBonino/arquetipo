import { Fragment, useEffect, useState } from "react"
import { ConnectedFocusError } from "focus-formik-error"
import { Formik } from "formik"
import { DropzoneAreaBase } from "mui-file-dropzone"
import Loader from "@/components/Loader/loader"
import { uploadTmpFile } from "@/lib/services/FileUploader"
import { convertBytesToMbsOrKbs } from "@/lib/utils/fileUtils"
import useMensaje from "@/hooks/useMensaje";
import {
  CloseOutlined as CloseOutlinedIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import DownloadIcon from "@mui/icons-material/Download"
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material"

const ABMDocuments = (props) => {
  
  const {
    t,
    showEmptyTable,
    filesLimit,
    readOnly,
    documentos,
    loadDocumentos,
    saveDocumentos,
    deleteDocumentos,
    acceptedFiles,
    maxFileSize,
    downloadApi,
    uploadApi,
    downloadPostUrl,
    showOnInit = false,
    customLabels = {},
    includeFiles = false,
    lng
  } = props

  const { addMessage } = useMensaje(lng);

  //Images
  const [loadingDocuments, setLoadingDocuments] = useState(
    documentos == null
  )
  const [openAddDocument, setOpenAddDocument] = useState(showOnInit)
  const [dropzoneDocuments, setDropzoneDocuments] = useState([])

  useEffect(() => {
    if (loadDocumentos && documentos == null) {
      handleLoadDocuments()
    }
  }, [])

  const handleLoadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      await loadDocumentos()
      setLoadingDocuments(false)
    } catch (error) {
      addMessage(error, "error")
      setLoadingDocuments(false)
    }
  }

  const dropZoneHandleAddDocumento = (newFiles) => {
    newFiles = newFiles.filter(
      (file) => !dropzoneDocuments.find((f) => f.data === file.data)
    )
    if (filesLimit == 1) {
      setDropzoneDocuments([...newFiles])
    } else {
      setDropzoneDocuments([...dropzoneDocuments, ...newFiles])
    }
  }

  const dropZoneHandleDeleteDocument = (deleted) => {
    setDropzoneDocuments(dropzoneDocuments.filter((f) => f !== deleted))
  }

  const handleSaveDocuments = async () => {
    //levanta los documentos de forma temporal  al server
    let promises = []
    let files = []

    dropzoneDocuments.forEach((im) => {
      promises.push(
        uploadTmpFile(im.file, null, im.file.name, im.file.type, im.file.size, uploadApi)
      )
      if (includeFiles) {
        files.push(im.file)
      }
    })

    let values = await Promise.all(promises)
    await saveDocumentos(values, files)
    setOpenAddDocument(false)
    handleLoadDocuments()
  }

  const handleDownloadDocument = async (indexToDownload) => {
    const ssFile = documentos.filter((_, index) => index == indexToDownload)

    const file = await downloadApi.post(downloadPostUrl, ssFile[0], {
      responseType: "blob", // Indicamos que esperamos un blob como respuesta
    })

    let link = document.createElement("a")
    const blob = new Blob([file], { type: "application/octet-stream" })
    const url = window.URL.createObjectURL(blob)
    link.href = url
    link.download = ssFile[0].nombre
    link.click();
  }

  const handleDeleteDocument = async (indexToDelete) => {
    try {
      const docToDelete = documentos[indexToDelete]
      await deleteDocumentos(docToDelete, indexToDelete)
      handleLoadDocuments()
      addMessage("SUCCESSFUL_DELETE", "success")
    } catch (error) {
      addMessage(error, "error")
    }
  }

  function contentTypeToHumanReadable(contentType) {
    const contentTypeMapping = {
      "application/pdf": "Documento PDF",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "Presentación de PowerPoint",
      "application/msword": "Documento de Word",
      "application/vnd.ms-excel": "Hoja de cálculo de Excel",
      "text/plain": "Texto sin formato",
      "image/jpeg": "Imagen JPEG",
      "image/png": "Imagen PNG",
      "audio/mpeg": "Audio MP3",
      "video/mp4": "Video MP4",
      "application/zip": "Archivo ZIP (.zip)",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Documento de Word",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "Hoja de cálculo de Excel",
      "application/vnd.openxmlformats-officedocument.presentationml.slideshow":
        "Presentación de PowerPoint",
      // Agrega más mapeos según sea necesario para otros tipos de contenido
    }

    return contentTypeMapping[contentType] || "Desconocido"
  }

  const labels = {
    modalTitle: t("documents"),
    addDocument: t("addDocument"),
    modalAddDocument: t("saveDocument"),
    dropZoneText: t("abm_documents_upload_text"),
    ...customLabels,
  }

  return (
    <Fragment>
      {!showOnInit && (
        <Button
          color='primary'
          className='button-child'
          variant='contained'
          onClick={() => {
            setDropzoneDocuments([])
            setOpenAddDocument(true)
          }}
        >
          {labels.addDocument}
        </Button>
      )}

      {loadingDocuments && <Loader />}

      {!loadingDocuments &&
        documentos &&
        (documentos.length > 0 ||
          (documentos.length == 0 && showEmptyTable)) && (
          <TableContainer>
            <Table stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow>
                  <TableCell>{t("documentName")}</TableCell>
                  <TableCell>{t("documentType")}</TableCell>
                  <TableCell>{t("actions")}</TableCell>
                  <TableCell>{t("")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.length > 0 ? (
                  documentos.map((document, index) => (
                    <TableRow key={index}>
                      <TableCell>{document.nombre}</TableCell>
                      <TableCell>
                        {contentTypeToHumanReadable(document.contentType)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='outlined'
                          color='secondary'
                          onClick={() => handleDeleteDocument(index)}
                        >
                          <DeleteIcon></DeleteIcon>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='outlined'
                          color='secondary'
                          onClick={() => handleDownloadDocument(index)}
                        >
                          <DownloadIcon></DownloadIcon>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableCell colSpan={4}>{t("empty_documentos")}</TableCell>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

      {/* Add image */}
      <Dialog
        fullWidth
        maxWidth='md'
        open={openAddDocument}
        onClose={() => setOpenAddDocument(false)}
        aria-labelledby='form-dialog-title'
      >
        <Formik initialValues={{}} onSubmit={handleSaveDocuments}>
          {(props) => {
            const { isSubmitting, handleSubmit } = props

            return (
              <form onSubmit={handleSubmit}>
                <ConnectedFocusError></ConnectedFocusError>
                <AppBar>
                  <Toolbar>
                    <IconButton
                      onClick={() => setOpenAddDocument(false)}
                      color='primary'
                      aria-label='upload picture'
                      component='span'
                    >
                      <CloseOutlinedIcon />
                    </IconButton>
                    <Typography variant='h6'>{labels.modalTitle}</Typography>
                  </Toolbar>
                </AppBar>
                <DialogContent>
                  {isSubmitting && <Loader />}

                  {!isSubmitting && (
                    <DropzoneAreaBase
                      filesLimit={filesLimit}
                      fileObjects={dropzoneDocuments}
                      onAdd={dropZoneHandleAddDocumento}
                      onDelete={dropZoneHandleDeleteDocument}
                      maxFileSize={maxFileSize}
                      showPreviews={false}
                      showFileNames={true}
                      showPreviewsInDropzone={true}
                      dropzoneText={labels.dropZoneText}
                      acceptedFiles={acceptedFiles}
                      getFileAddedMessage={(fileName) =>
                        t("dropzone_file_added").replace(
                          "${fileName}",
                          fileName
                        )
                      }
                      getFileRemovedMessage={(fileName) =>
                        t("dropzone_file_removed").replace(
                          "${fileName}",
                          fileName
                        )
                      }
                      getFileLimitExceedMessage={(filesLimit) =>
                        t("dropzone_file_limit_exceed").replace(
                          "${filesLimit}",
                          filesLimit
                        )
                      }
                      alertSnackbarProps={{
                        autoHideDuration: 4500,
                        anchorOrigin: { vertical: "top", horizontal: "center" },
                      }}
                      getDropRejectMessage={(
                        rejectedFile,
                        acceptedFiles,
                        maxFileSize
                      ) => {
                        let message = t("file_rejected").replace(
                          "${fileName}",
                          rejectedFile.name
                        )
                        if (rejectedFile.size > maxFileSize) {
                          message += t("file_too_big").replace(
                            "${maxFileSize}",
                            convertBytesToMbsOrKbs(maxFileSize)
                          )
                        } else if (!acceptedFiles.includes(rejectedFile.type)) {
                          message += t("dropzone_filetype_not_suported")
                        }
                        return message
                      }}
                    />
                  )}
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={() => setOpenAddDocument(false)}
                    color='primary'
                  >
                    {readOnly ? t("close") : t("cancel")}
                  </Button>

                  {!readOnly && (
                    <Button
                      type='submit'
                      disabled={isSubmitting}
                      color='primary'
                      variant='contained'
                    >
                      {labels.modalAddDocument}
                    </Button>
                  )}
                </DialogActions>
              </form>
            )
          }}
        </Formik>
      </Dialog>
    </Fragment>
  )
}

export default ABMDocuments
