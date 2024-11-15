"use client"
import { useTranslation } from "@/app/i18n/client";
import HistoricoDialog from "@/components/Custom/HistoricoDialog";
import SearchTable from "@/components/SearchTable/SearchTable";
import * as constantesOps from "@/constants/operations";
import { getRoles } from "@/helpers/actions";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import { Delete } from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from "@mui/lab/Autocomplete";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import { ConnectedFocusError } from "focus-formik-error";
import { Formik } from "formik";
import moment from "moment";
import "moment-timezone";
import { Fragment, useEffect, useRef, useState } from "react";


export default function Usuarios({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const filterColumns = [
    { id: "email", label: t("email"), type: "TEXT" },
    { id: "habilitado", label: t("enabled"), type: "BOOLEAN" },
  ];

  const staticColumns = [
    { id: "usuEmail", label: t("email") },
    { id: "usuPrimerNombre", label: t("name") },
    { id: "usuPrimerApellido", label: t("lastname") },
    {
      id: "usuHabilitado",
      label: t("enabled"),
      format: ({ usuHabilitado }) => (usuHabilitado ? t("yes") : t("no")),
    },
    {
      id: "auditData.lastModUser.nombreYApellido",
      sortBy: "auditData.lastModUser.usuPrimerNombre",
      label: t("mod_user"),
      format: ({ auditData }) =>
        auditData.lastModUser ? auditData.lastModUser.nombreYApellido : null,
    },
    {
      id: "auditData.lastModDateTime",
      label: t("mod_date"),
      format: ({ auditData }) => localTime(auditData.lastModDateTime),
    },
  ];

  const staticColumnsRoles = [
    { label: t("role"), format: ({ rol }) => rol.rolNombre },
  ];


  const [elementsFilter, setElementsFilter] = useState({
    maxResults: 10,
    first: 0,
    orderBy: ["usuId"],
    ascending: [true],
  });
  const [openEdit, setOpenEdit] = useState(false);
  const [userOnEdit, setUserOnEdit] = useState({});
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [isAddEnabled, setIsAddEnabled] = useState(false);
  const [roleList, setRoleList] = useState([]);
  const [selectedRole, setSelectedRole] = useState(0);
  const roleFilter = { orderBy: ["rolId"], ascending: [true] };
  const [isShowHistory, setIsShowHistory] = useState(false);

  const handleSearch = useRef(null);

  useEffect(() => {
    setIsAddEnabled(
      userHasRequiredOperation(constantesOps.CATALOGOS_PAISES_CREAR)
    );
    setIsEditEnabled(
      userHasRequiredOperation(constantesOps.SEGURIDAD_USUARIOS_ACTUALIZAR)
    );
    setIsDeleteEnabled(
      userHasRequiredOperation(constantesOps.SEGURIDAD_USUARIOS_ELIMINAR)
    );
    setIsShowHistory(
      userHasRequiredOperation(constantesOps.SEGURIDAD_USUARIOS_HISTORIAL)
    );
    searchRoles();
  }, []);

  const searchRoles = async () => {
    try {
      let roles = getRoles(roleFilter);
      setRoleList(roles);
      setSelectedRole(roles[0].rolPk);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const handleEdit = async (row) => {
    let user = await apiSeguridadClient.get("/v1/usuarios/" + row.usuId, {
      params: { includeRoles: true },
    });

    if (!user.usuTimezone) {
      user.usuTimezone = moment.tz.guess();
    }
    if (!user.usuLanguage) {
      user.usuLanguage = "es";
    }
    setUserOnEdit(user);
    setOpenEdit(true);
  };

  const handleClose = () => {
    setOpenEdit(false);
  };

  const handleAdd = async () => {
    setUserOnEdit({
      usuPrimerNombre: "",
      usuSegundoNombre: "",
      usuPrimerApellido: "",
      usuSegundoApellido: "",
      usuHabilitado: true,
      usuEmail: "",
      usuRoles: [],
    });

    setOpenEdit(true);
  };

  const validate = (values) => {
    const errors = {};
    const requeridos = ["usuPrimerNombre", "usuPrimerApellido", "usuEmail"];
    requeridos.forEach((element) => {
      if (!values[element]) {
        errors[element] = t("required");
      }
    });

    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (values.usuEmail && !pattern.test(values.usuEmail)) {
      errors.usuEmail = t("invalid_email_address");
    }
    return errors;
  };

  const save = async (values) => {
    try {
      if (!values.usuRoles?.length) {
        addMessage("ERROR_EMPTY_ROLES", "error", "dialog");
        return;
      }
      console.log(values.usuPrimerNombre);
      if (values.usuId == null) {
        await apiSeguridadClient.post("/v1/usuarios", values);
      } else {
        await apiSeguridadClient.put("/v1/usuarios/" + values.usuId, values);
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
          <h3>{t("users")}</h3>
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
        basePath="/v1/usuarios"
        staticColumns={staticColumns}
        filterColumns={filterColumns}
        t={t}
        lng={lng}
        handleSearchRef={handleSearch}
        editMethod={handleEdit}
        historyEnabled={isShowHistory}
        editEnabled={isEditEnabled}
        deleteEnabled={isDeleteEnabled}
        editingObject={userOnEdit}
        setEditingObject={setUserOnEdit}
        filterElements={elementsFilter}
        setFilterElements={setElementsFilter}
        searchOnInit={true}
        idColumn={"usuId"}
        addMessage={addMessage}
      />

      {/*Historico */}
      {isShowHistory && (
        <HistoricoDialog
          columns={staticColumns}
          entity={userOnEdit}
          isShowHistory={isShowHistory}
          setShowHistory={setIsShowHistory}
          i18next={t}
          keyEntity="usuId"
          urlBase="/v1/usuarios"
          apiClient={apiSeguridadClient}
          lng={lng}
        ></HistoricoDialog>
      )}

      {/* Edición */}
      <Dialog
        open={openEdit}
        onClose={handleClose}
      >
        <DialogTitle id="form-dialog-title">{t("user")}
          <Button onClick={handleClose} className="close-icon">
            <CloseIcon width={25} color="black" />
          </Button>
        </DialogTitle>
        <Formik
          initialValues={userOnEdit}
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
              <form className="form" onSubmit={handleSubmit}>
                <ConnectedFocusError></ConnectedFocusError>
                <DialogContent>
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    value={values.usuPrimerNombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="usuPrimerNombre"
                    label={t("first_name")}
                    error={errors.usuPrimerNombre && touched.usuPrimerNombre}
                    helperText={
                      errors.usuPrimerNombre && touched.usuPrimerNombre
                        ? errors.usuPrimerNombre
                        : ""
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    value={values.usuSegundoNombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="usuSegundoNombre"
                    label={t("second_name")}
                    error={errors.usuSegundoNombre && touched.usuSegundoNombre}
                    helperText={
                      errors.usuSegundoNombre && touched.usuSegundoNombre
                        ? errors.usuSegundoNombre
                        : ""
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    value={values.usuPrimerApellido}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="usuPrimerApellido"
                    label={t("first_surname")}
                    error={errors.usuPrimerApellido && touched.usuPrimerApellido}
                    helperText={
                      errors.usuPrimerApellido && touched.usuPrimerApellido
                        ? errors.usuPrimerApellido
                        : ""
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    value={values.usuSegundoApellido}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="usuSegundoApellido"
                    label={t("last_surname")}
                    error={errors.usuSegundoApellido && touched.usuSegundoApellido}
                    helperText={
                      errors.usuSegundoApellido && touched.usuSegundoApellido
                        ? errors.usuSegundoApellido
                        : ""
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    autoComplete="off"
                    value={values.usuEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    name="usuEmail"
                    label={t("email")}
                    error={errors.usuEmail && touched.usuEmail}
                    helperText={
                      errors.usuEmail && touched.usuEmail ? errors.usuEmail : ""
                    }
                    inputProps={{ maxLength: 250 }}
                  />

                  <Autocomplete
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.usuTimezone}
                    options={moment.tz.names()}
                    getOptionLabel={(e) => e}
                    onChange={(e, value) => {
                      setFieldValue("usuTimezone", value);
                    }}
                    onBlur={handleBlur}
                    name="usuTimezone"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="normal"
                        label="Timezone"
                        error={errors.usuTimezone && touched.usuTimezone}
                        helperText={
                          errors.usuTimezone && touched.usuTimezone
                            ? errors.usuTimezone
                            : ""
                        }
                      />
                    )}
                  />

                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    value={values.usuLanguage}
                    select
                    name="usuLanguage"
                    label={t("language")}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.usuLanguage && touched.usuLanguage}
                    helperText={
                      errors.usuLanguage && touched.usuLanguage ? errors.usuLanguage : ""
                    }
                  >
                    <MenuItem key="es" value="es">
                      Español
                    </MenuItem>
                    <MenuItem key="en" value="en">
                      English
                    </MenuItem>
                  </TextField>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.usuHabilitado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        name="usuHabilitado"
                        color="primary"
                      />
                    }
                    label={t("enabled")}
                  />

                  {values.usuId ? (
                    <Fragment>
                      <br />
                      <br />
                      <InputLabel>{t("validated_email")}</InputLabel>
                      {values.usuEmailVerificado ? t("yes") : t("no")}
                    </Fragment>
                  ) : (
                    ""
                  )}

                  <br />
                  <br />
                  <Divider light />

                  <br />

                  <Typography variant="h6">{t("roles")}</Typography>

                  <br />

                  <TextField
                    size="small"
                    name="locale"
                    label={t("role")}
                    value={selectedRole}
                    select
                    style={{ width: 250, marginRight: 10 }}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                    }}
                  >
                    <MenuItem value={0}>{t('select')}</MenuItem>
                    {roleList.filter(rol => !values.usuRoles.some(item => item.rol.rolId === rol.rolId)).map(rol => (
                      <MenuItem key={rol.rolId} value={rol.rolId}>
                        {rol.rolNombre}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    disabled={!selectedRole}
                    color="primary"
                    variant="contained"
                    className="float-right"
                    onClick={() => {
                      let role = roleList.find(r => r.rolId === selectedRole);
                      let newRole = { rol: role };

                      if (values.usuRoles.some((item) => item.rol.rolId === role.rolId)) {
                        return;
                      }

                      values.usuRoles.push(newRole);
                      setFieldValue("usuRoles", values.usuRoles);
                      setSelectedRole(0);
                    }}
                  >
                    {t("add")}
                  </Button>

                  <br />
                  <br />

                  <TableContainer>
                    <Table stickyHeader aria-label="sticky table">
                      <TableHead>
                        <TableRow>
                          {staticColumnsRoles.map(column =>
                            <TableCell key={column.id}>{column.label}</TableCell>
                          )}
                          {isDeleteEnabled && <TableCell></TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {values.usuRoles.map(row => {
                          return (
                            <TableRow hover tabIndex={-1} key={row.rolId}>
                              {staticColumnsRoles.map(column => {
                                const value = row[column.id];
                                return (
                                  <TableCell key={`${column.id}${row.id}`}>
                                    {column.format
                                      ? column.format(row)
                                      : value}
                                  </TableCell>
                                );
                              })}
                              {isDeleteEnabled && (
                                <TableCell>
                                  <Tooltip title={t("delete")}>
                                    <IconButton
                                      size="small"
                                      onClick={() => setFieldValue("usuRoles", values.usuRoles.filter(item => item.rol.rolId !== row.rol.rolId))}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                    className="submit"
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
