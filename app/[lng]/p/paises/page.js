"use client"
import { useTranslation } from "@/app/i18n/client";
import SearchTable from "@/components/SearchTable/SearchTable";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import CloseIcon from "@mui/icons-material/Close";
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

export default function Paises({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent, messageCleanUp } = useMensaje(lng);

  const filterColumns = [
    { id: "nombre", label: t("name"), type: "TEXT" },
    { id: "habilitado", label: t("enabled"), type: "BOOLEAN" },
  ];

  const staticColumns = [
    { id: "paisCodigo", label: t("code") },
    { id: "paisNombre", label: t("name") },
    {
      id: "paisHabilitado",
      label: t("enabled"),
      format: ({ paisHabilitado }) => (paisHabilitado ? t("yes") : t("no")),
    },
    {
      id: "paisAuditData.lastModUser.nombreYApellido",
      sortBy: "paisAuditData.lastModUser.usuPrimerNombre",
      label: t("mod_user"),
      format: ({ paisAuditData }) =>
        paisAuditData?.lastModUser?.nombreYApellido,
    },
    {
      id: "paisAuditData.lastModDateTime",
      label: t("mod_date"),
      format: ({ paisAuditData }) => localTime(paisAuditData?.lastModDateTime),
    },
  ];

  const [paisOnEdit, setPaisOnEdit] = useState({
    nombre: "",
    codigo: "",
    habilitado: true,
  });
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(false);
  const [isAddEnabled, setIsAddEnabled] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [elementsFilter, setElementsFilter] = useState({
    maxResults: 10,
    first: 0,
    orderBy: ["paisId"],
    ascending: [false],
  });
  const handleSearch = useRef(null);

  useEffect(() => {
    setIsAddEnabled(
      userHasRequiredOperation(constantesOps.CATALOGOS_PAISES_CREAR)
    );
    setIsEditEnabled(
      userHasRequiredOperation(constantesOps.CATALOGOS_PAISES_ACTUALIZAR)
    );
    setIsDeleteEnabled(
      userHasRequiredOperation(constantesOps.CATALOGOS_PAISES_ELIMINAR)
    );
    setIsHistoryEnabled(
      userHasRequiredOperation(
        constantesOps.CATALOGOS_PAISES_ACTUALIZAR
      )
    );
  }, []);



  const handleEdit = (row) => {
    messageCleanUp();
    setPaisOnEdit(row);
    setOpenEdit(true);
  };

  const handleClose = () => {
    setOpenEdit(false);
  };

  const handleAdd = async () => {
    messageCleanUp();
    setPaisOnEdit({ paisNombre: "", paisCodigo: "", paisHabilitado: true });
    setOpenEdit(true);
  };


  const validate = (values) => {
    const errors = {};
    if (!values.paisCodigo) {
      errors.paisCodigo = t("required");
    }

    if (!values.paisNombre) {
      errors.paisNombre = t("required");
    }

    return errors;
  };

  const save = async (values) => {
    try {
      if (values.paisId) {
        await apiSeguridadClient.put("/v1/paises/" + values.paisId, values);
      } else {
        await apiSeguridadClient.post("/v1/paises", values);
      }
      addMessage("SUCCESSFUL_SAVE", "success");
      handleClose();
      handleSearch.current();
    } catch (error) {
      addMessage(error, "error", "dialog");
    }
  };

  return (
    <>
      <Grid
        justifyContent="space-between"
        container
        direction="row"
      >
        <Grid item>
          <h3>{t("countries")}</h3>
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
        basePath="/v1/paises"
        staticColumns={staticColumns}
        filterColumns={filterColumns}
        t={t}
        lng={lng}
        editMethod={handleEdit}  //Si la edición se realiza en un popup utilizar editMethod. Si la edición se realiza en otra página utilizar editLink
        editEnabled={isEditEnabled}
        deleteEnabled={isDeleteEnabled}
        historyEnabled={isHistoryEnabled}
        handleSearchRef={handleSearch}
        editingObject={paisOnEdit}
        setEditingObject={setPaisOnEdit}
        filterElements={elementsFilter}
        setFilterElements={setElementsFilter}
        searchOnInit={true}
        idColumn={"paisId"}
        addMessage={addMessage}
      />

      {/* Edición */}
      <Dialog
        open={openEdit}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{t("country")}
          <Button onClick={handleClose} className="close-icon">
            <CloseIcon width={25} color="black" />
          </Button>
        </DialogTitle>
        <Formik
          initialValues={paisOnEdit}
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
                    value={values.paisCodigo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("code")}
                    name="paisCodigo"
                    error={errors.paisCodigo && touched.paisCodigo}
                    helperText={
                      errors.paisCodigo && touched.paisCodigo
                        ? errors.paisCodigo
                        : ""
                    }
                    inputProps={{ maxLength: 5 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.paisNombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="paisNombre"
                    label={t("name")}
                    error={errors.paisNombre && touched.paisNombre}
                    helperText={
                      errors.paisNombre && touched.paisNombre
                        ? errors.paisNombre
                        : ""
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.paisHabilitado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="paisHabilitado"
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
