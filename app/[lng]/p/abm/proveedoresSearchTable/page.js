"use client"
import Address, { validateAddress } from "@/components/Address/Address";
import CsvBulkUpload from "@/components/CsvBulkUpload/CsvBulkUpload";
import SearchTable from "@/components/SearchTable/SearchTable";
import HelpDialog from "@/components/Custom/HelpDialog";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import { CloseOutlined } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Autocomplete from "@mui/lab/Autocomplete";
import {
  AppBar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { ConnectedFocusError } from "focus-formik-error";
import { Formik } from "formik";
import { debounce, get } from "lodash";
import { useTranslation } from "@/app/i18n/client"
import { useEffect, useRef, useState } from "react";
import { CountryRegionData } from "react-country-region-selector";


export default function ProveedoresSearchTable({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const filterColumns = [
    { id: "name", label: t("name"), type: "TEXT" },
    {
      id: "addCountry",
      label: t("country_select"),
      type: "SELECT",
      options: CountryRegionData,
      getValue: (o) => o[1],
      getLabel: (o) => o[0],
    },
    { id: "auditData.lastModDateTime", label: t("mod_date"), type: "DATE" },
    { id: "enabled", label: t("enabled"), type: "BOOLEAN" },
  ];

  const staticColumns = [
    { id: "companyName", label: t("name") },
    {
      id: "enabled",
      label: t("enabled"),
      format: (row) => (get(row, "enabled") ? t("yes") : t("no")),
    },
    {
      label: t("brands"),
      format: (row) =>
        get(row, "marcas")
          ? get(row, "marcas")
            .map(function (br) {
              return br.name;
            })
            .join(", ")
          : "",
    },
    {
      id: "auditData.lastModDateTime",
      label: t("mod_date"),
      format: (row) => localTime(get(row, "auditData.lastModDateTime")),
    },
    {
      label: t("edit_dialog"),
      format: (row) => (
        <Tooltip title={t("edit_dialog")}>
          <IconButton size="small" onClick={() => handleEdit(row, false)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const [filterElements, setFilterElements] = useState({});
  const [editingObject, setEditingObject] = useState({});
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [isAddEnabled, setIsAddEnabled] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [marcas, setMarcas] = useState([]);

  useEffect(() => {
    setIsAddEnabled(userHasRequiredOperation(constantesOps.PROVEEDORES_CREAR));
    setIsEditEnabled(
      userHasRequiredOperation(constantesOps.PROVEEDORES_ACTUALIZAR)
    );
    setIsDeleteEnabled(
      userHasRequiredOperation(constantesOps.PROVEEDORES_ELIMINAR)
    );
  }, []);

  const handleSearch = useRef(null);

  const handleMarcas = (value) => {
    try {
      let results = apiClient.get("/v1/marcas/search", {
        params: {
          name: value,
          maxResults: 10,
          first: 0,
          orderBy: ["searchName"],
          ascending: [true],
        },
      })
      setMarcas(results);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  //Debounce para no disparar consulta a backend cada vez que se apreta una key. Se esperan 500ms para disparar.
  const handleMarcasDebounced = debounce(handleMarcas, 500);

  const handleEdit = (row, readOnly) => {
    setEditingObject(row);
    setIsOpenEdit(true);
    setIsReadOnly(readOnly);
  };

  const handleAdd = async () => {
    setEditingObject({
      companyName: "",
      enabled: true,
      address: {},
      marcas: [],
    });
    setIsOpenEdit(true);
    setIsReadOnly(false);
  };

  const validate = (values) => {
    let errors = {};

    if (!values.companyName) {
      errors.companyName = t("required");
    }

    validateAddress(values.address, errors, t);

    if (values.salEmail) {
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.salEmail)) {
        errors.salEmail = t("invalid");
      }
    }

    return errors;
  };

  const validateCsv = (data) => {
    const errors = [];

    if (!data || !data.length > 0) {
      errors.push(t("messages:label_cvs_invalid_format"));
      return errors;
    }

    return errors;
  };

  const save = async (values) => {
    try {
      if (values.id == null) {
        await apiClient.post("/v1/proveedores", values);
      } else {
        await apiClient.put("/v1/proveedores/" + values.id, values);
      }
      handleSearch.current();
      setIsOpenEdit(false);
      addMessage("SUCCESSFUL_SAVE", "success");
    } catch (error) {
      addMessage(error, "error", "dialog");
    }

  };

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("suppliers")}</h3>
        </Grid>
        {isAddEnabled && (
          <Grid item className="btn-labels">
            <CsvBulkUpload
              entity="com.sofis.entities.bulk.ProveedoresBulk"
              online={10}
              t={t}
              validate={validateCsv}
              bulk_upload_title={t("bulk_upload_title")}
              bulk_donwload_title={t("bulk_donwload_title")}
              bulk_dialog_title={t("suppliers")}
              bulk_step1_title={t("bulk_step1_title")}
              bulk_step2_title={t("bulk_step2_title")}
              bulk_step3_title={t("bulk_step3_title")}
              filter={filterElements}
              search={handleSearch}
            ></CsvBulkUpload>

            <Button
              color="primary"
              variant="contained"
              className="float-right"
              onClick={handleAdd}
              startIcon={<AddIcon />}
            >
              {t("add")}
            </Button>
            <HelpDialog t={t} codigo="AYUDA_PROVEEDORES" />
          </Grid>
        )}
      </Grid>
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>
      <SearchTable
        api={apiClient}
        basePath="/v1/proveedores"
        staticColumns={staticColumns}
        filterColumns={filterColumns}
        t={t}
        lng={lng}
        editLink={`/${lng}/p/abm/proveedor`} //si la edición se realiza en una página aparte, se utiliza editLink
        editMethod={handleEdit} //si la edición se realiza en un popup, se utiliza editMethod. En este caso estan las dos formas representadas como ejemplo.
        editEnabled={isEditEnabled}
        isDeleteEnabled={isDeleteEnabled}
        handleSearchRef={handleSearch}
        addMessage={addMessage}
        editingObject={editingObject}
        setEditingObject={setEditingObject}
        filterElements={filterElements}
        setFilterElements={setFilterElements}
        searchOnInit={true}
        idColumn={"id"}
      />

      {/* Edit */}
      <Dialog
        fullScreen
        scroll="body"
        open={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        aria-labelledby="form-dialog-title"
      >
        <Formik
          initialValues={editingObject}
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
              setFieldValue,
            } = props;

            return (
              <form onSubmit={handleSubmit}>
                <ConnectedFocusError>/</ConnectedFocusError>
                <AppBar>
                  <Toolbar>
                    <IconButton
                      onClick={() => setIsOpenEdit(false)}
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                    >
                      <CloseOutlined></CloseOutlined>
                    </IconButton>
                    <Typography variant="h6">{t("supplier")}</Typography>
                    {!isReadOnly && (
                      <Button
                        type="submit"
                        autoFocus
                        disabled={isSubmitting}
                        color="inherit"
                      >
                        {t("save")}
                      </Button>
                    )}
                  </Toolbar>
                </AppBar>
                <DialogContent>
                  <span className="title-form-owom">{t("companyinfo")}</span>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        autoComplete="off"
                        size="small"
                        value={values.companyName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="companyName"
                        label={t("companyname")}
                        error={errors.companyName && touched.companyName}
                        helperText={
                          errors.companyName && touched.companyName
                            ? errors.companyName
                            : ""
                        }
                        inputProps={{
                          readOnly: isReadOnly,
                          maxLength: 100,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        autoComplete="off"
                        size="small"
                        value={values.taxId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="taxId"
                        label={t("taxid")}
                        error={errors.taxId && touched.taxId}
                        helperText={
                          errors.taxId && touched.taxId ? errors.taxId : ""
                        }
                        inputProps={{
                          readOnly: isReadOnly,
                          maxLength: 100,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={values.enabled}
                            onChange={!isReadOnly ? handleChange : undefined}
                            onBlur={handleBlur}
                            name="enabled"
                            color="primary"
                            inputProps={{
                              readOnly: isReadOnly,
                            }}
                          />
                        }
                        label={t("enabled")}
                      />
                    </Grid>
                  </Grid>
                  <span className="title-form-owom">{t("companyaddress")}</span>

                  <Grid container spacing={2}>
                    <Address
                      {...props}
                      navigation="address"
                      t={t}
                      variantTextField="outlined"
                      spacing={2}
                      xs={12}
                      sm={6}
                      readOnly={isReadOnly}
                    ></Address>
                  </Grid>

                  <span className="title-form-owom">
                    {t("salesrepresentative")}
                  </span>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        autoComplete="off"
                        size="small"
                        value={values.salFirstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="salFirstName"
                        label={t("firstname")}
                        error={errors.salFirstName && touched.salFirstName}
                        helperText={
                          errors.salFirstName && touched.salFirstName
                            ? errors.salFirstName
                            : ""
                        }
                        inputProps={{
                          readOnly: isReadOnly,
                          maxLength: 100,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        autoComplete="off"
                        size="small"
                        value={values.salLastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="salLastName"
                        label={t("lastname")}
                        error={errors.salLastName && touched.salLastName}
                        helperText={
                          errors.salLastName && touched.salLastName
                            ? errors.salLastName
                            : ""
                        }
                        inputProps={{
                          readOnly: isReadOnly,
                          maxLength: 100,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        autoComplete="off"
                        size="small"
                        value={values.salEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="salEmail"
                        label={t("email")}
                        error={errors.salEmail && touched.salEmail}
                        helperText={
                          errors.salEmail && touched.salEmail
                            ? errors.salEmail
                            : ""
                        }
                        inputProps={{
                          readOnly: isReadOnly,
                          maxLength: 100,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <span className="title-form-owom">{t("account")}</span>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        autoComplete="off"
                        size="small"
                        value={values.accountNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="accountNumber"
                        label={t("accountnumber")}
                        error={errors.accountNumber && touched.accountNumber}
                        helperText={
                          errors.accountNumber && touched.accountNumber
                            ? errors.accountNumber
                            : ""
                        }
                        inputProps={{
                          readOnly: isReadOnly,
                          maxLength: 100,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        autoComplete="off"
                        size="small"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="notes"
                        label={t("notes")}
                        multiline
                        rows={2}
                        error={errors.notes && touched.notes}
                        helperText={
                          errors.notes && touched.notes ? errors.notes : ""
                        }
                        inputProps={{
                          readOnly: isReadOnly,
                          maxLength: 100,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <span className="title-form-owom">{t("brands")}</span>
                  <Autocomplete
                    id="contact-autocomplete"
                    multiple
                    name="marcas"
                    value={values.marcas}
                    options={marcas}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionLabel={(marca) => `${marca?.name}`}
                    onChange={(e, value) => {
                      setFieldValue("marcas", value !== null ? value : "");
                      setMarcas([]);
                    }}
                    onOpen={handleBlur}
                    autoComplete={true}
                    includeInputInList
                    getOptionDisabled={() => isReadOnly}
                    disableClearable={isReadOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.marcas && errors.marcas)}
                        fullWidth
                        helperText={touched.marcas && errors.marcas}
                        label={t("entertext")}
                        name="marcas"
                        size="small"
                        onChange={(evt) =>
                          handleMarcasDebounced(evt.target.value)
                        }
                        inputProps={{
                          ...params.inputProps,
                          readOnly: isReadOnly,
                        }}
                      />
                    )}
                  />
                </DialogContent>

                <DialogActions>
                  <Grid container direction="row">
                    <MessageComponent t={t} location="dialog" autoFocus />
                  </Grid>
                  <Button onClick={() => setIsOpenEdit(false)} color="primary">
                    {t("cancel")}
                  </Button>
                  {!isReadOnly && (
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
    </>
  );
};
