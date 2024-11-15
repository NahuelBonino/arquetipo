import React, { Fragment } from "react";
import { Formik } from "formik";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";

const DeleteDialog = (props) => {
  const { t, open, setOpen, handleDelete } = props;

  return (
    <Fragment>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Formik initialValues={{}} onSubmit={handleDelete}>
          {(props) => {
            const { isSubmitting, handleSubmit } = props;

            return (
              <form onSubmit={handleSubmit}>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {t("delete_element_confirmation")}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpen(false)} color="primary">
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    autoFocus
                    disabled={isSubmitting}
                    color="primary"
                    variant="contained"
                  >
                    {t("delete")}
                  </Button>
                </DialogActions>
              </form>
            );
          }}
        </Formik>
      </Dialog>
    </Fragment>
  );
};

export default DeleteDialog;
