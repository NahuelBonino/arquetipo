"use client"
import { useTranslation } from "@/app/i18n/client";
import SearchTable from "@/components/SearchTable/SearchTable";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import CloseIcon from '@mui/icons-material/Close';
import {
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


export default function Templates({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent, messageCleanUp } = useMensaje(lng);

  const filterColumns = [
    { id: "codigo", label: t("code"), type: "TEXT" },
    { id: "nombre", label: t("name"), type: "TEXT" },
  ];
  const staticColumns = [
    { id: "plantCodigo", label: t("code") },
    { id: "plantNombre", label: t("name") },
    {
      id: "plantAuditData.lastModUser.nombreYApellido",
      sortBy: "plantAuditData.lastModUser.usuPrimerNombre",
      label: t("mod_user"),
      format: ({ plantAuditData }) =>
        plantAuditData.lastModUser?.nombreYApellido,
    },
    {
      id: "plantAuditData.lastModDateTime",
      label: t("mod_date"),
      format: ({ plantAuditData }) => localTime(plantAuditData.lastModDateTime),
    },
  ];

  const [templateOnEdit, setTemplateOnEdit] = useState({});
  const [isAddEnabled, setIsAddEnabled] = useState(false);
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(false);
  const [elementsFilter, setElementsFilter] = useState({
    maxResults: 10,
    first: 0,
    orderBy: ["plantId"],
    ascending: [true],
  });
  const handleSearch = useRef(null);

  useEffect(() => {
    setIsAddEnabled(
      userHasRequiredOperation(constantesOps.CATALOGOS_PLANTILLAS_CREAR)
    );
    setIsEditEnabled(
      userHasRequiredOperation(constantesOps.CATALOGOS_PLANTILLAS_ACTUALIZAR)
    );
    setIsDeleteEnabled(
      userHasRequiredOperation(constantesOps.CATALOGOS_PLANTILLAS_ELIMINAR)
    );
    setIsHistoryEnabled(
      userHasRequiredOperation(
        constantesOps.CATALOGOS_PLANTILLAS_HISTORIAL
      )
    );
  }, []);


  const handleEdit = (row) => {
    messageCleanUp();
    setTemplateOnEdit(row);
    setIsOpenEdit(true);
  };

  const handleClose = () => {
    setIsOpenEdit(false);
  };

  const handleAdd = async () => {
    messageCleanUp();
    setTemplateOnEdit({
      plantNombre: "",
      plantCodigo: "",
      plantAsunto: "",
      plantCuerpo: "",
      plantHabilitado: true,
    });
    setIsOpenEdit(true);
  };


  const validate = (values) => {
    const errors = {};
    if (!values.plantCodigo) {
      errors.plantCodigo = t("required");
    }

    if (!values.plantNombre) {
      errors.plantNombre = t("required");
    }

    return errors;
  }

  const save = async (values) => {
    try {
      if (values.plantId == null) {
        await apiSeguridadClient.post("/v1/plantillas", values);
      } else {
        await apiSeguridadClient.put("/v1/plantillas/" + values.plantId, values);
      }
      handleSearch.current();
      handleClose();
      addMessage("SUCCESSFUL_SAVE", "success");
    } catch (error) {
      addMessage(error, "error", "dialog");
    }
  }

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("templates")}</h3>
        </Grid>
        {isAddEnabled && (
          <Grid item>
            <Button
              color="secondary"
              variant="contained"
              className="float-right"
              onClick={handleAdd}
            >
              {t("add")}
            </Button>
          </Grid>
        )}
      </Grid>
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>

      <SearchTable
        api={apiSeguridadClient}
        searchTotalPath={"/buscar/total"}
        searchPath={"/buscar"}
        basePath="/v1/plantillas"
        staticColumns={staticColumns}
        filterColumns={filterColumns}
        t={t}
        lng={lng}
        editMethod={handleEdit}
        historyEnabled={isHistoryEnabled}
        editEnabled={isEditEnabled}
        deleteEnabled={isDeleteEnabled}
        handleSearchRef={handleSearch}
        editingObject={templateOnEdit}
        setEditingObject={setTemplateOnEdit}
        filterElements={elementsFilter}
        setFilterElements={setElementsFilter}
        searchOnInit={true}
        idColumn={"plantId"}
        addMessage={addMessage}
      />

      {/* Edición */}
      <Dialog
        open={isOpenEdit}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{t("template")}
          <Button onClick={handleClose} className="close-icon">
            <CloseIcon width={25} color="black" />
          </Button>
        </DialogTitle>
        <Formik
          initialValues={templateOnEdit}
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
              <form onSubmit={handleSubmit}>
                <DialogContent>
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.plantCodigo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("code")}
                    name="plantCodigo"
                    autoFocus
                    error={errors.plantCodigo && touched.plantCodigo}
                    helperText={
                      errors.plantCodigo && touched.plantCodigo ? errors.plantCodigo : ""
                    }
                    inputProps={{ maxLength: 45 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.plantNombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="plantNombre"
                    label={t("name")}
                    error={errors.plantNombre && touched.plantNombre}
                    helperText={
                      errors.plantNombre && touched.plantNombre ? errors.plantNombre : ""
                    }
                    inputProps={{ maxLength: 250 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.plantAsunto}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="plantAsunto"
                    label={t("subject")}
                    error={errors.plantAsunto && touched.plantAsunto}
                    helperText={
                      errors.plantAsunto && touched.plantAsunto ? errors.plantAsunto : ""
                    }
                    inputProps={{ maxLength: 250 }}
                  />
                  <TextField
                    multiline
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.plantCuerpo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="plantCuerpo"
                    label={t("body")}
                    error={errors.plantCuerpo && touched.plantCuerpo}
                    helperText={
                      errors.plantCuerpo && touched.plantCuerpo ? errors.plantCuerpo : ""
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.plantHabilitado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="plantHabilitado"
                        color="primary"
                      />
                    }
                    label={t("enabled")}
                  />
                </DialogContent>

                <DialogActions>
                  <Grid container>
                    <MessageComponent t={t} location="dialog" />
                  </Grid>
                  <Button onClick={handleClose} color="primary">
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
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