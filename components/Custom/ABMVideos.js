import { Fragment, useEffect, useState } from "react";
import { ConnectedFocusError } from "focus-formik-error";
import { Formik } from "formik";
import useMensaje from "@/hooks/useMensaje";
import Loader from "@/components/Loader/loader";
import SimpleTable from "@/components/SimpleTable/SimpleTable";
import DeleteDialog from "@/components/Custom/DeleteDialog";
import { CloseOutlined as CloseOutlinedIcon } from "@mui/icons-material";
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";

const ABMVideos = (props) => {
  const { readOnly, t, videos, setVideos, loadVideos, saveVideo, deleteVideo, lng } = props;

  const { addMessage, messageCleanUp } = useMensaje(lng);

  const staticColumnsVideos = [
    { id: "vidTitle", label: t("title") },
    { id: "vidUrl", label: t("url") },
  ];

  const [isLoadingVideos, setIsLoadingVideos] = useState(videos == null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isOpenAddVideo, setIsOpenAddVideo] = useState(false);
  const [isOpenDeleteVideo, setIsOpenDeleteVideo] = useState(false);
  const [pageVideo, setPageVideo] = useState(0);
  const [rowsPerPageVideo, setRowsPerPageVideo] = useState(10);

  useEffect(() => {
    messageCleanUp();
    if (loadVideos && videos == null) {
      handleLoadVideos();
    }
  }, []);

  const selectVideoForDelete = (row) => {
    setEditingVideo(row);
    setIsOpenDeleteVideo(true);
  };

  const handleLoadVideos = async () => {
    try {
      setIsLoadingVideos(true);
      let p = await loadVideos()
      setVideos(p);
      setIsLoadingVideos(false);
    } catch (error) {
      addMessage(error, "error");
      setIsLoadingVideos(false);
    }
  };

  const handleChangePageVideo = (newPage) => {
    setPageVideo(newPage);
  };

  const handleChangeRowsPerPageVideo = (event) => {
    setRowsPerPageVideo(event.target.value);
    setPageVideo(0);
  };

  const handleDeleteVideo = async () => {
    try {
      await deleteVideo(editingVideo.vidPk);
      handleLoadVideos();
      setIsOpenDeleteVideo(false);
      addMessage("SUCCESSFUL_DELETE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const validate = (values) => {
    const errors = {};

    if (!values.vidTitle) {
      errors.vidTitle = t("required");
    }

    if (!values.vidUrl) {
      errors.vidUrl = t("required");
    }

    return errors;
  };

  const save = async (values) => {
    await saveVideo(values);
    setIsOpenAddVideo(false);
    handleLoadVideos();
  };

  return (
    <Fragment>
      <Button
        color="primary"
        className="button-child"
        variant="contained"
        onClick={() => {
          setEditingVideo({
            vidTitle: "",
            vidUrl: "",
            vidFormat: "",
          });
          setIsOpenAddVideo(true);
        }}
      >
        {t("add")}
      </Button>

      {isLoadingVideos && <Loader />}

      {!isLoadingVideos && videos && videos.length == 0 && (
        <div>{t("no_results")}</div>
      )}
      {!isLoadingVideos && videos && videos.length > 0 && (
        <SimpleTable
          staticColumns={staticColumnsVideos}
          items={videos.slice(
            pageVideo * rowsPerPageVideo,
            pageVideo * rowsPerPageVideo + rowsPerPageVideo
          )}
          editEnabled={false}
          viewEnabled={false}
          deleteEnabled={!readOnly}
          selectForDelete={selectVideoForDelete}
          total={videos.length}
          rowsPerPage={rowsPerPageVideo}
          page={pageVideo}
          t={t}
          handleChangePage={handleChangePageVideo}
          handleChangeRowsPerPage={handleChangeRowsPerPageVideo}
        ></SimpleTable>
      )}

      {/* Add video */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={isOpenAddVideo}
        onClose={() => setIsOpenAddVideo(false)}
        aria-labelledby="form-dialog-title"
      >
        <Formik
          initialValues={editingVideo}
          validate={validate}
          onSubmit={save}
        >
          {(props) => {
            const {
              values,
              touched,
              errors,
              isSubmitting,
              handleChange,
              handleSubmit,
              handleBlur,
            } = props;

            return (
              <form onSubmit={handleSubmit}>
                <ConnectedFocusError></ConnectedFocusError>
                <AppBar>
                  <Toolbar>
                    <IconButton
                      onClick={() => setIsOpenAddVideo(false)}
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                    >
                      <CloseOutlinedIcon />
                    </IconButton>
                    <Typography variant="h6">{t("video")}</Typography>
                  </Toolbar>
                </AppBar>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        autoComplete="off"
                        value={values.vidTitle || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="vidTitle"
                        label={t("title")}
                        inputProps={{
                          readOnly: readOnly,
                        }}
                        error={errors.vidTitle && touched.vidTitle}
                        helperText={
                          errors.vidTitle && touched.vidTitle
                            ? errors.vidTitle
                            : ""
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        variant="outlined"
                        size="small"
                        fullWidth
                        autoComplete="off"
                        value={values.vidUrl || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="vidUrl"
                        label={t("url")}
                        inputProps={{
                          readOnly: readOnly,
                        }}
                        error={errors.vidUrl && touched.vidUrl}
                        helperText={
                          errors.vidUrl && touched.vidUrl ? errors.vidUrl : ""
                        }
                      />
                    </Grid>
                  </Grid>
                </DialogContent>

                <DialogActions>
                  <Button
                    onClick={() => setIsOpenAddVideo(false)}
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
        open={isOpenDeleteVideo}
        setOpen={setIsOpenDeleteVideo}
        handleDelete={handleDeleteVideo}
      />
    </Fragment>
  );
};

export default ABMVideos;
