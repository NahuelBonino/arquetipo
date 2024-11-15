import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { ConnectedFocusError } from "focus-formik-error";
import { Formik } from "formik";
import { DropzoneAreaBase } from "mui-file-dropzone";
import DeleteDialog from "./DeleteDialog";
import Loader from "@/components/Loader/loader";
import SimpleTable from "@/components/SimpleTable/SimpleTable";
import useMensaje from "@/hooks/useMensaje";
import { uploadTmpFile } from "@/lib/services/FileUploader";
import { convertBytesToMbsOrKbs } from "@/lib/utils/fileUtils";
import {
  CloseOutlined as CloseOutlinedIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

const ABMImages = (props) => {
  const {
    readOnly,
    t,
    images,
    setImages,
    loadImages,
    saveImages,
    deleteImage,
    lng
  } = props;
  const { addMessage, messageCleanUp } = useMensaje(lng);

  const staticColumnsImages = [
    { label: t("name"), format: (row) => row.file.nombre },
    {},
  ];

  const [isLoadingImages, setIsLoadingImages] = useState(images == null);
  const [editingImage, setEditingImage] = useState(null);
  const [isOpenAddImage, setIsOpenAddImage] = useState(false);
  const [isOpenDeleteImage, setIsOpenDeleteImage] = useState(false);
  const [imagesDropzone, setImagesDropzone] = useState([]);
  const [pageImage, setPageImage] = useState(0);
  const [rowsPerPageImage, setRowsPerPageImage] = useState(10);

  useEffect(() => {
    messageCleanUp();
    if (loadImages && images == null) {
      handleLoadImages();
    }
  }, []);

  const dropZoneHandleAddImage = (newFiles) => {
    newFiles = newFiles.filter(
      (file) => !imagesDropzone.find((f) => f.data === file.data)
    );
    setImagesDropzone([...imagesDropzone, ...newFiles]);
  };

  const dropZoneHandleDeleteImage = (deleted) => {
    setImagesDropzone(imagesDropzone.filter((f) => f !== deleted));
  };

  const selectImageForDelete = (row) => {
    setEditingImage(row);
    setIsOpenDeleteImage(true);
  };

  const handleLoadImages = async () => {
    try {
      setIsLoadingImages(true);
      let p = await loadImages();
      setImages(p);
      setIsLoadingImages(false);
    } catch (error) {
      addMessage(error, "error");
      setIsLoadingImages(false);
    }
  };

  const handleChangePageImage = (event, newPage) => {
    setPageImage(newPage);
  };

  const handleChangeRowsPerPageImage = (event) => {
    setRowsPerPageImage(event.target.value);
    setPageImage(0);
  };

  const handleDeleteImage = async () => {
    try {
      await deleteImage(editingImage.id);
      handleLoadImages();
      setIsOpenDeleteImage(false);
      addMessage("SUCCESSFUL_DELETE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const handleSaveImages = async () => {
    let promesas = [];
    let images = [];
    imagesDropzone.forEach((im) => {
      promesas.push(
        uploadTmpFile(im.file, null, im.file.name, im.file.type, im.file.size)
      );
    });

    let values = await Promise.all(promesas);
    images = values.map((archivo) => {
      return { file: archivo };
    });

    await saveImages(images);
    setIsOpenAddImage(false);
    handleLoadImages();
  };

  return (
    <Fragment>
      <Button
        color="primary"
        className="button-child"
        variant="contained"
        onClick={() => {
          setImagesDropzone([]);
          setIsOpenAddImage(true);
        }}
      >
        {t("add")}
      </Button>

      {isLoadingImages && <Loader />}

      {!isLoadingImages && images && images.length == 0 && (
        <div>{t("no_results")}</div>
      )}
      {!isLoadingImages && images && images.length > 0 && (
        <SimpleTable
          staticColumns={staticColumnsImages}
          items={images.slice(
            pageImage * rowsPerPageImage,
            pageImage * rowsPerPageImage + rowsPerPageImage
          )}
          editEnabled={false}
          viewEnabled={false}
          deleteEnabled={!readOnly}
          selectForDelete={selectImageForDelete}
          total={images.length}
          rowsPerPage={rowsPerPageImage}
          page={pageImage}
          t={t}
          handleChangePage={handleChangePageImage}
          handleChangeRowsPerPage={handleChangeRowsPerPageImage}
          actionComponents={[
            {
              label: t("image"),
              createComponent: (row) => {
                return (
                  <Image
                    src={row.file.cdnUrl}
                    alt={row.file.name}
                    width="100"
                    height="100"
                  />
                );
              },
            },
          ]}
        ></SimpleTable>
      )}

      {/* Add image */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={isOpenAddImage}
        onClose={() => setIsOpenAddImage(false)}
        aria-labelledby="form-dialog-title"
      >
        <Formik initialValues={{}} onSubmit={handleSaveImages}>
          {(props) => {
            const {
              isSubmitting,
              handleSubmit,
            } = props;

            return (
              <form onSubmit={handleSubmit}>
                <ConnectedFocusError></ConnectedFocusError>
                <AppBar>
                  <Toolbar>
                    <IconButton
                      onClick={() => setIsOpenAddImage(false)}
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                    >
                      <CloseOutlinedIcon />
                    </IconButton>
                    <Typography variant="h6">{t("images")}</Typography>
                  </Toolbar>
                </AppBar>
                <DialogContent>
                  {isSubmitting && <Loader />}

                  {!isSubmitting && (
                    <DropzoneAreaBase
                      filesLimit={10}
                      fileObjects={imagesDropzone}
                      onAdd={dropZoneHandleAddImage}
                      onDelete={dropZoneHandleDeleteImage}
                      maxFileSize={524288}
                      showPreviews={false}
                      showPreviewsInDropzone={true}
                      dropzoneText={t("bulk_step1_content_upload_text")}
                      acceptedFiles={["image/*"]}
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
                        );
                        if (rejectedFile.size > maxFileSize) {
                          message += t("file_too_big").replace(
                            "${maxFileSize}",
                            convertBytesToMbsOrKbs(maxFileSize)
                          );
                        } else if (!acceptedFiles.includes(rejectedFile.type)) {
                          message += t("dropzone_filetype_not_suported");
                        }
                        return message;
                      }}
                    />
                  )}
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={() => setIsOpenAddImage(false)}
                    color="primary"
                  >
                    {readOnly ? t("close") : t("cancel")}
                  </Button>

                  {!readOnly && (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      color="primary"
                      variant="contained"
                    >
                      {t("save")}
                    </Button>
                  )}
                </DialogActions>
              </form>
            );
          }}
        </Formik>
      </Dialog>

      <DeleteDialog
        t={t}
        open={isOpenDeleteImage}
        setOpen={setIsOpenDeleteImage}
        handleDelete={handleDeleteImage}
      />
    </Fragment>
  );
};

export default ABMImages;
