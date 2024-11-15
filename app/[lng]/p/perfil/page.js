"use client"
import { useTranslation } from "@/app/i18n/client";
import Loader from "@/components/Loader/loader";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { Formik } from "formik";
import { useEffect, useState } from "react";


const AuditTable = ({ t, data, funciones }) => {
  const columns = [
    {
      id: "audFecha",
      name: "fecha",
      label: t("date"),
      format: ({ audFecha }) => localTime(audFecha),
    },
    {
      id: "audIp",
      label: t("ip"),
      format: ({ audIp }) => audIp,
    },
    {
      id: "audOperacion",
      label: t("operation"),
      format: ({ audOperacion }) => t(audOperacion),
    },
    {
      label: t("method"),
      format: ({ audMetodo }) => audMetodo,
    },
    {
      label: t("path"),
      format: ({ audPath }) => audPath,
    },
    {
      label: t("status"),
      format: ({ audResponseStatus }) => audResponseStatus,
    },
  ];
  return (
    <>
      <div className="clear"></div>
      <div className="tableProf">
        <span className="titulotab">{t("actions_history")}</span>

        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell key={index}>
                  {column.label}
                  {column.name && data.isAscending && (
                    <Tooltip title={t("change_sorting")}>
                      <ArrowUpward
                        onClick={() => {
                          funciones.setAscending(!data.isAscending);
                        }}
                      />
                    </Tooltip>
                  )}
                  {column.name && !data.isAscending && (
                    <Tooltip title={t("change_sorting")}>
                      <ArrowDownward
                        onClick={() => {
                          funciones.setAscending(!data.isAscending);
                        }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.auditRegister.map(row =>
              <TableRow hover tabIndex={-1} key={row.audFecha}>
                {columns.map((column, indexCol) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={`${indexCol}${column.id}`}>
                      {column.format ? column.format(row) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default function Profile({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent, messageCleanUp } = useMensaje(lng);
  const [user, setUser] = useState({});
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenEditPassword, setIsOpenEditPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [auditRegister, setAuditRegister] = useState([]);
  const [lastAccess, setLastAccess] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [elementsFilter, setElementsFilter] = useState({
    maxResults: 10,
    first: 0,
  });
  /** controlles para order */
  const [sortBy, setSortBy] = useState("audFecha");
  const [isAscending, setIsAscending] = useState(false);
  const passwords = {
    passwordActual: "",
    passwordNueva: "",
    passwordNuevaConfirmar: "",
  };

  useEffect(() => {
    loadCurrentUser();
    searchTotalOfRegisters();
    findLastAccess();
  }, []);

  useEffect(() => {
    searchRegisters();
  }, [sortBy, isAscending, page, rowsPerPage]);

  const findLastAccess = async () => {
    try {
      let res = await apiSeguridadClient.get("/v1/auditoria/me/lastaccess");
      setLastAccess(res);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const searchTotalOfRegisters = async () => {
    try {
      let filter = { ...elementsFilter };
      setTotal(
        await apiSeguridadClient.get("/v1/auditoria/me/buscar/total", {
          params: filter,
        })
      );
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const searchRegisters = async () => {
    try {
      let filter = { ...elementsFilter };
      filter.ascending = [isAscending];
      filter.orderBy = [sortBy];
      const results = await apiSeguridadClient.get("/v1/auditoria/me/buscar", { params: filter })
      setAuditRegister(results);
      setIsLoading(false);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      let user = await apiSeguridadClient.get("/v1/usuarios/me");
      user.usuPaiPk = "";
      user.usuTdoPk = "";
      if (!user.usuDocument) {
        user.usuDocument = "";
      }
      setUser(user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      addMessage(error, "error");
    }
  };

  const savePreferences = async (values) => {
    try {
      await apiSeguridadClient.put("/v1/usuarios/me/actualizar", values);
      setUser({ ...user });
      addMessage("CAMBIOS_GUARDADOS", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const updatePassword = async (values) => {
    try {
      await apiSeguridadClient.put("/v1/usuarios/me/cambiarpassword", values);
      loadCurrentUser();
      handleClose();
      addMessage("SUCCESSFUL_SAVE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const getTable = () => {
    const data = { isAscending, sortBy, auditRegister };
    const funciones = { setAscending: setIsAscending, setSortBy };
    if (auditRegister) {
      return <AuditTable data={data} funciones={funciones} t={t} />;
    }
    return <></>;
  };

  const handleClose = () => {
    setIsOpenEdit(false);
    setIsOpenEditPassword(false);
  };

  const handleChangePage = (newPage) => {
    setElementsFilter({
      ...elementsFilter,
      first: newPage * elementsFilter.maxResults,
    });
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setElementsFilter({
      ...elementsFilter,
      first: 0,
      maxResults: event.target.value,
    });
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const validatePasswords = (values) => {
    const errors = {};

    const requeridos = [
      "passwordActual",
      "passwordNueva",
      "passwordNuevaConfirmar",
    ];

    requeridos.forEach((element) => {
      if (!values[element]) {
        errors[element] = t("required");
      }
    });

    if (values.passwordNueva) {
      const passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/g; //Al menos 8 caracteres, 1 mayuscula, 1 minuscula, 1 numero
      if (!passRegExp.test(values.passwordNueva)) {
        errors["passwordNueva"] = t("invalid_password");
      }
    }

    if (
      values.passwordNueva &&
      values.passwordNuevaConfirmar &&
      values.passwordNuevaConfirmar != values.passwordNueva
    ) {
      errors["passwordNuevaConfirmar"] = t("password_no_match");
    }

    return errors;
  };

  const validate = (values) => {
    const errors = {};
    const requeridos = ["usuPrimerNombre", "usuPrimerApellido", "usuDocument"];
    requeridos.forEach((element) => {
      if (!values[element]) {
        errors[element] = t("required");
      }
    });

    return errors;
  };

  const save = async (values) => {
    try {
      await apiSeguridadClient.put("/v1/usuarios/me/actualizar", values);
      loadCurrentUser();
      handleClose();
      addMessage("SUCCESSFUL_SAVE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("profile")}</h3>
        </Grid>
      </Grid>
      <Grid container>
        <MessageComponent t={t} />
      </Grid>
      {isLoading && <Loader />}
      {!isLoading && user && (
        <div elevation={0} className="infoPerfil">
          <Formik initialValues={user} onSubmit={savePreferences}>
            {(props) => {
              const { handleSubmit } = props;
              return (
                <form onSubmit={handleSubmit} className="profile">
                  <div className="sub-title">{t("personal_information")}</div>

                  <Grid container>
                    <Grid item xs={12} sm={6}>
                      {t("first_name")}
                    </Grid>
                    <Grid className="normaltxt" item xs={12} sm={6}>
                      {user.usuPrimerNombre}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {t("second_name")}
                    </Grid>
                    <Grid className="normaltxt" item xs={12} sm={6}>
                      {user.usuSegundoNombre}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {t("first_surname")}
                    </Grid>
                    <Grid className="normaltxt" item xs={12} sm={6}>
                      {user.usuPrimerApellido}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {t("second_surname")}
                    </Grid>
                    <Grid className="normaltxt" item xs={12} sm={6}>
                      {user.usuSegundoApellido}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      {t("email")}
                    </Grid>
                    <Grid className="normaltxt" item xs={12} sm={6}>
                      {" "}
                      {user.usuEmail}
                    </Grid>
                    {user.usuPais && (
                      <Grid item xs={12} sm={6}>
                        {t("country")}
                      </Grid>
                    )}
                    {user.usuPais && (
                      <Grid className="normaltxt" item xs={12} sm={6}>
                        {" "}
                        {user.usuPais.nombre}
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      {t("document")}
                    </Grid>
                    <Grid className="normaltxt" item xs={12} sm={6}>
                      {" "}
                      {user.usuDocument}
                    </Grid>
                  </Grid>

                  <div className="profilebtn">
                    <Button
                      onClick={() => {
                        setIsOpenEdit(true);
                        messageCleanUp();
                      }}
                      className="submit"
                      color="primary"
                      variant="contained"
                    >
                      {t("update_profile")}
                    </Button>

                    <Button
                      onClick={() => {
                        setIsOpenEditPassword(true);
                        messageCleanUp();
                      }}
                      className="submit"
                      color="primary"
                      variant="contained"
                    >
                      {t("update_password")}
                    </Button>
                  </div>

                  <br />

                  <div className="sub-title">{t("preferences")}</div>

                  <Grid container></Grid>
                </form>
              );
            }}
          </Formik>
        </div>
      )}
      <div className="ipdiv">
        {lastAccess && (
          <Grid container>
            <Grid item xs={12} sm={6}>
              {t("last_access")}
            </Grid>
            <Grid className="normaltxt" item xs={12} sm={6}>
              {localTime(lastAccess?.audFecha)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {t("ip")}
            </Grid>
            <Grid className="normaltxt" item xs={12} sm={6}>
              {lastAccess.audIp}
            </Grid>
          </Grid>
        )}
      </div>

      <div className="tablaPerfil">
        {getTable()}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>

      {/* Edición */}
      {user && (
        <Dialog
          open={isOpenEdit}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {" "}
            {t("update_profile")}
          </DialogTitle>

          <Formik
            initialValues={user}
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
                <form
                  data-testid="formEditTest"
                  className="form"
                  onSubmit={handleSubmit}
                >
                  <DialogContent>
                    <TextField
                      margin="normal"
                      fullWidth
                      autoComplete="off"
                      value={values.usuPrimerNombre || ""}
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
                      fullWidth
                      autoComplete="off"
                      value={values.usuSegundoNombre || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="usuSegundoNombre"
                      label={t("second_name")}
                      error={
                        errors.usuSegundoNombre && touched.usuSegundoNombre
                      }
                      helperText={
                        errors.usuSegundoNombre && touched.usuSegundoNombre
                          ? errors.usuSegundoNombre
                          : ""
                      }
                      inputProps={{ maxLength: 100 }}
                    />
                    <TextField
                      margin="normal"
                      fullWidth
                      autoComplete="off"
                      value={values.usuPrimerApellido || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="usuPrimerApellido"
                      label={t("first_surname")}
                      error={
                        errors.usuPrimerApellido && touched.usuPrimerApellido
                      }
                      helperText={
                        errors.usuPrimerApellido && touched.usuPrimerApellido
                          ? errors.usuPrimerApellido
                          : ""
                      }
                      inputProps={{ maxLength: 100 }}
                    />
                    <TextField
                      margin="normal"
                      fullWidth
                      autoComplete="off"
                      value={values.usuSegundoApellido || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="usuSegundoApellido"
                      label={t("last_surname")}
                      error={
                        errors.usuSegundoApellido && touched.usuSegundoApellido
                      }
                      helperText={
                        errors.usuSegundoApellido && touched.usuSegundoApellido
                          ? errors.usuSegundoApellido
                          : ""
                      }
                      inputProps={{ maxLength: 100 }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      autoComplete="off"
                      value={values.usuDocument || ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      name="usuDocument"
                      label={t("document")}
                      error={errors.usuDocument && touched.usuDocument}
                      helperText={
                        errors.usuDocument && touched.usuDocument
                          ? errors.usuDocument
                          : ""
                      }
                      inputProps={{ maxLength: 8 }}
                    />

                    <br />
                    <br />
                  </DialogContent>

                  <DialogActions>
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
      )}

      {/* Update password */}
      {user && (
        <Dialog
          open={isOpenEditPassword}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {t("update_password")}
          </DialogTitle>

          <Formik
            initialValues={passwords}
            validate={validatePasswords}
            onSubmit={updatePassword}
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
                      fullWidth
                      value={values.passwordActual}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label={t("current_password")}
                      name="passwordActual"
                      error={errors.passwordActual && touched.passwordActual}
                      helperText={
                        errors.passwordActual && touched.passwordActual
                          ? errors.passwordActual
                          : ""
                      }
                      inputProps={{
                        type: "password",
                        autoComplete: "new-password",
                      }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      value={values.passwordNueva}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label={t("new_password")}
                      name="passwordNueva"
                      error={errors.passwordNueva && touched.passwordNueva}
                      helperText={
                        errors.passwordNueva && touched.passwordNueva
                          ? errors.passwordNueva
                          : ""
                      }
                      inputProps={{
                        type: "password",
                        autoComplete: "new-password",
                      }}
                    />

                    <TextField
                      margin="normal"
                      fullWidth
                      value={values.passwordNuevaConfirmar}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label={t("confirm_new_password")}
                      name="passwordNuevaConfirmar"
                      error={
                        errors.passwordNuevaConfirmar &&
                        touched.passwordNuevaConfirmar
                      }
                      helperText={
                        errors.passwordNuevaConfirmar &&
                          touched.passwordNuevaConfirmar
                          ? errors.passwordNuevaConfirmar
                          : ""
                      }
                      inputProps={{
                        type: "password",
                        autoComplete: "new-password",
                      }}
                    />
                  </DialogContent>

                  <DialogActions>
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
      )}
    </>
  );
}