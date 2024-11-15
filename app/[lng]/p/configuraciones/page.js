"use client"
import { useTranslation } from "@/app/i18n/client";
import SearchTable from "@/components/SearchTable/SearchTable";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { uploadTmpFile } from "@/lib/services/FileUploader";
import localTime from "@/lib/utils/dateConverter";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  TextField,
} from "@mui/material";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";

export default function Configuraciones({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent, messageCleanUp } = useMensaje(lng);

  const filterColumns = [
    { id: "codigo", label: t("code"), type: "TEXT" },
    { id: "nombre", label: t("name"), type: "TEXT" },
  ];

  const staticColumns = [
    { id: "confCodigo", label: t("code") },
    { id: "confNombre", label: t("name") },
    { id: "confValor", label: t("value") },
    {
      id: "confAuditData.lastModUser.nombreYApellido",
      label: t("mod_user"),
      sortBy: "confAuditData.lastModUser.usuPrimerNombre",
      format: ({ confAuditData }) =>
        confAuditData.lastModUser
          ? confAuditData.lastModUser.nombreYApellido
          : null,
    },
    {
      id: "confAuditData.lastModDateTime",
      label: t("mod_date"),
      format: ({ confAuditData }) => localTime(confAuditData.lastModDateTime),
    },
  ];

  const [elementsFilter, setElementsFilter] = useState({
    maxResults: 10,
    first: 0,
    orderBy: ["confId"],
    ascending: [true],
  });
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [typeOnEdit, setTypeOnEdit] = useState({});
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const handleSearch = useRef(null);

  useEffect(() => {
    setIsEditEnabled(
      userHasRequiredOperation(
        constantesOps.CATALOGOS_CONFIGURACIONES_ACTUALIZAR
      )
    );
    setIsHistoryEnabled(
      userHasRequiredOperation(
        constantesOps.CATALOGOS_CONFIGURACIONES_HISTORIAL
      )
    );
  }, []);

  const handleEdit = (row) => {
    row.confTieneArchivo = row.confTieneArchivo ?? false;
    messageCleanUp();
    setTypeOnEdit(row);
    setFile(row.confArchivo);
    setIsOpenEdit(true);
  };

  const handleClose = () => {
    setIsOpenEdit(false);
  };

  const handleUploadDoc = async (event) => {
    let fileAux = event.target.files[0];
    setLoading(true);
    try {
      let arch = await uploadTmpFile(
        fileAux,
        file,
        fileAux.name,
        "application/octet-stream"
      );
      setFile(arch);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      addMessage(error, "error");
    }
  };

  const validate = (values) => {
    const errors = {};
    if (!values.confCodigo) {
      errors.confCodigo = t("required");
    }

    if (!values.confNombre) {
      errors.confNombre = t("required");
    }

    return errors;
  };

  const save = async (values) => {
    try {
      if (file != null) {
        values.confArchivo = file;
      }
      if (values.confId == null) {
        await apiSeguridadClient.post("/v1/configuraciones", values);
      } else {
        await apiSeguridadClient.put(
          "/v1/configuraciones/" + values.confId,
          values
        );
      }
      handleSearch.current();
      handleClose();
      addMessage("SUCCESSFUL_SAVE", "success");
    } catch (error) {
      addMessage(error, "error", "dialog");
    }
  };

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("configurations")}</h3>
        </Grid>
      </Grid>

      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>

      <SearchTable
        api={apiSeguridadClient}
        searchTotalPath={"/buscar/total"}
        searchPath={"/buscar"}
        basePath="/v1/configuraciones"
        staticColumns={staticColumns}
        filterColumns={filterColumns}
        t={t}
        lng={lng}
        handleSearchRef={handleSearch}
        editMethod={handleEdit}
        editEnabled={isEditEnabled}
        deleteEnabled={false}
        historyEnabled={isHistoryEnabled}
        editingObject={typeOnEdit}
        setEditingObject={setTypeOnEdit}
        filterElements={elementsFilter}
        setFilterElements={setElementsFilter}
        searchOnInit={true}
        idColumn={"confId"}
        addMessage={addMessage}
      />


      {/* Edición */}
      <Dialog
        open={isOpenEdit}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{t("configuration")}
          <Button onClick={handleClose} className="close-icon">
            <CloseIcon width={25} color="black" />
          </Button>
        </DialogTitle>
        <Formik
          initialValues={typeOnEdit}
          validateOnChange={false}
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
              <form className="form" onSubmit={handleSubmit}>
                <DialogContent>
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.confCodigo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("code")}
                    name="confCodigo"
                    autoFocus
                    error={errors.confCodigo && touched.confCodigo}
                    helperText={
                      errors.confCodigo && touched.confCodigo
                        ? errors.confCodigo
                        : ""
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.confNombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="confNombre"
                    label={t("name")}
                    error={errors.confNombre && touched.confNombre}
                    helperText={
                      errors.confNombre && touched.confNombre
                        ? errors.confNombre
                        : ""
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.confValor}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="confValor"
                    label={t("value")}
                    error={errors.confValor && touched.confValor}
                    helperText={
                      errors.confValor && touched.confValor
                        ? errors.confValor
                        : ""
                    }
                    inputProps={{ maxLength: 255 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.confTieneArchivo || false}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="confTieneArchivo"
                        color="primary"
                      />
                    }
                    label={t("with_file")}
                  />

                  {values.confTieneArchivo && (
                    <Box>
                      {values.confArchivo != null && (
                        <TextField
                          margin="normal"
                          size="small"
                          fullWidth
                          value={values.confArchivo.filName}
                          label={t("archivo_actual")}
                          disabled={true}
                        />
                      )}

                      <input
                        type="file"
                        onChange={handleUploadDoc}
                        name="config_File"
                      />

                      <TextField
                        margin="normal"
                        size="small"
                        fullWidth
                        value={values.confArchivoNameInBucket}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="confArchivoNameInBucket"
                        label={t("name_in_bucket")}
                        inputProps={{ maxLength: 100 }}
                      //error={errors.confValor && touched.nombre}
                      />
                    </Box>
                  )}
                </DialogContent>

                <DialogActions>
                  <Grid container direction="row">
                    <MessageComponent t={t} location="dialog" />
                  </Grid>
                  <Button onClick={handleClose} color="primary">
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="submit MuiButton-containedPrimary"
                    color="primary"
                    variant="contained"
                  >
                    {t("save")}
                  </Button>
                </DialogActions>
              </form>
            );
          }}
        </Formik>
      </Dialog>
    </>
  );
};