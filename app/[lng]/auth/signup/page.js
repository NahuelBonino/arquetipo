"use client"
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { Box, Grid, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/client"

export default function SingUp({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const router = useRouter();

  const [entityOnEdition, setEntityOnEdition] = useState();
  const [documentTypeList, setDocumentTypeList] = useState([]);

  useEffect(() => {
    setEntityOnEdition({
      usuPrimerNombre: "",
      usuSegundoNombre: "",
      usuPrimerApellido: "",
      usuSegundoApellido: "",
      usuEmail: "",
      usuPassword: "",
      usuPaiPk: "",
      usuPais: "",
      usuTdoPk: "",
      usuTipoDocumento: "",
      usuDocument: "",
      usuPassword2: "",
    });

  }, []);


  const searchDocumentType = async (idPais) => {
    try {
      setDocumentTypeList(
        await apiSeguridadClient.get("/v1/document/buscarporpais/" + idPais)
      );
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const handleChangePais = (event) => {
    searchDocumentType(event.target.value);
  };

  const validate = (values) => {
    const errors = {};
    const requeridos = [
      "usuPrimerNombre",
      "usuPrimerApellido",
      "usuEmail",
      "email2",
      "usuPassword",
      "usuPassword2",
      "usuDocument",
      "usuPaiPk",
      "usuTdoPk",
    ];

    requeridos.forEach((element) => {
      if (!values[element]) {
        errors[element] = t("required");
      }
    });

    if (values.usuPassword) {
      const passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/g; //Al menos 8 caracteres, 1 mayuscula, 1 minuscula, 1 numero
      if (!passRegExp.test(values.usuPassword)) {
        errors["usuPassword"] = t("invalid_password");
      }
    }

    if (
      values.usuPassword &&
      values.usuPassword2 &&
      values.usuPassword2 !== values.usuPassword
    ) {
      errors["usuPassword2"] = t("password_no_match");
    }

    if (values.usuDocument) {
      const re = /\d+/g;
      if (!re.test(values.usuDocument)) {
        errors["usuDocument"] = t("documento_no_match");
      }
    }

    if (values.email && values.email2 && values.email2 !== values.email) {
      errors["email2"] = t("email_no_match");
    }

    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (values.email && !pattern.test(values.email)) {
      errors.email = t("invalid_email_address");
    }

    return errors;
  };

  const save = async (values) => {
    if (values.usuPaiPk == null) {
      values.usuPais = null;
    } else {
      values.usuPais = countryList.filter(
        (element) => "" + element.paiPk == values.usuPaiPk
      )[0];
    }

    if (values.usuTdoPk == null) {
      values.usuTipoDocumento = null;
    } else {
      values.usuTipoDocumento = documentTypeList.filter(
        (element) => "" + element.tdoPk == values.usuTdoPk
      )[0];
    }

    try {
      await apiSeguridadClient.post("/v1/usuarios/registro", values);
      router.push(`/${lng}/auth/login?result=USUARIO_REGISTRADO`);
    } catch (error) {
      addMessage(error, "error");
    }
  };


  return (
    <div className="singup">
        <Grid container>
          <MessageComponent t={t} />
        </Grid>
        <Container component="main" maxWidth="xs">
          <div>
            {entityOnEdition && (
              <Formik
                onSubmit={save}
                validate={validate}
                validateOnChange={false}
                initialValues={entityOnEdition}
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
                      <Grid container spacing={0}>
                        <TextField
                          autoFocus
                          margin="normal"
                          size="small"
                          fullWidth
                          value={values.usuPrimerNombre}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("first_name")}
                          name="usuPrimerNombre"
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
                          value={values.usuSegundoNombre}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("second_name")}
                          name="usuSegundoNombre"
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
                          value={values.usuPrimerApellido}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("first_surname")}
                          name="usuPrimerApellido"
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
                          size="small"
                          fullWidth
                          value={values.usuSegundoApellido}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("second_surname")}
                          name="usuSegundoApellido"
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
                          size="small"
                          fullWidth
                          value={values.usuPhone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("phone_number")}
                          name="usuPhone"
                          error={errors.usuPhone && touched.usuPhone}
                          helperText={
                            errors.usuPhone && touched.usuPhone
                              ? errors.usuPhone
                              : ""
                          }
                          inputProps={{ maxLength: 100 }}
                        />

                        

                        <TextField
                          margin="normal"
                          size="small"
                          fullWidth
                          value={values.usuDocument}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("document_no")}
                          name="usuDocument"
                          error={errors.usuDocument && touched.usuDocument}
                          helperText={
                            errors.usuDocument && touched.usuDocument
                              ? errors.usuDocument
                              : ""
                          }
                          inputProps={{
                            maxLength: 8,
                          }}
                        />
                        <TextField
                          margin="normal"
                          size="small"
                          fullWidth
                          value={values.usuEmail}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("email_address")}
                          name="usuEmail"
                          type="email"
                          error={errors.usuEmail && touched.usuEmail}
                          helperText={
                            errors.usuEmail && touched.usuEmail ? errors.usuEmail : ""
                          }
                          inputProps={{ maxLength: 256 }}
                        />

                        <TextField
                          margin="normal"
                          size="small"
                          fullWidth
                          value={values.email2}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("confirm_email")}
                          name="email2"
                          type="email"
                          error={errors.email2 && touched.email2}
                          helperText={
                            errors.email2 && touched.email2 ? errors.email2 : ""
                          }
                          inputProps={{ maxLength: 256 }}
                        />

                        <TextField
                          margin="normal"
                          size="small"
                          fullWidth
                          value={values.usuPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("password")}
                          name="usuPassword"
                          error={errors.usuPassword && touched.usuPassword}
                          helperText={
                            errors.usuPassword && touched.usuPassword
                              ? errors.usuPassword
                              : ""
                          }
                          inputProps={{
                            type: "password",
                            autoComplete: "new-password",
                            minLength: 8,
                          }}
                        />

                        <TextField
                          margin="normal"
                          size="small"
                          fullWidth
                          value={values.usuPassword2}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t("confirm_password")}
                          name="usuPassword2"
                          error={errors.usuPassword2 && touched.usuPassword2}
                          helperText={
                            errors.usuPassword2 && touched.usuPassword2
                              ? errors.usuPassword2
                              : ""
                          }
                          inputProps={{
                            type: "password",
                            autoComplete: "new-password",
                            minLength: 8,
                          }}
                        />
                      </Grid>
                      <Box marginTop={2} />
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                      >
                        {t("register")}
                      </Button>
                      <Grid container justifyContent="flex-end">
                        <Grid item>
                          <Link href="login" variant="body2" type="submit">
                            {t("has_user")}
                          </Link>
                        </Grid>
                      </Grid>
                    </form>
                  );
                }}
              </Formik>
            )}
          </div>
        </Container>
    </div>
  );
};