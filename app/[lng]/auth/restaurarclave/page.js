"use client"
import { useTranslation } from "@/app/i18n/client";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { Grid, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page({ params: { lng }, searchParams: { uuid, usu } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const router = useRouter();

  const [entityOnEdition, setEntityOnEdition] = useState();
  const [hasRequest, setHasRequest] = useState(false);

  useEffect(() => {
    if (usu && uuid) {
      checkThereAreRequest();
    } else {
      setEntityOnEdition({
        password: "",
        confirmar: "",
        email: "",
        uuidResetPassword: "",
      });
    }
  }, []);

  const checkThereAreRequest = async () => {
    try {
      await apiSeguridadClient.post(
        "/v1/usuarios/changepasswordrequest",
        {
          email: usu,
          uuidResetPassword: uuid,
        }
      );
      setEntityOnEdition({
        password: "",
        confirmar: "",
        email: usu,
        uuidResetPassword: uuid,
      });
      setHasRequest(true);
    } catch (error) {
      setEntityOnEdition({
        password: "",
        confirmar: "",
      });
      setHasRequest(false);
      addMessage(error, "error");
    }
  };

  const validate = (values) => {
    const errors = {};
    const required = ["password", "confirmar"];

    required.forEach((element) => {
      if (!values[element]) {
        errors[element] = t("required");
      }
    });

    if (values.password) {
      //Al menos 8 caracteres, 1 mayuscula, 1 minuscula, 1 numero
      const passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/g;
      if (!passRegExp.test(values.password)) {
        errors["password"] = t("invalid_password");
      }
    }

    if (
      values.password &&
      values.confirmar &&
      values.confirmar !== values.password
    ) {
      errors["confirmar"] = t("password_no_match");
    }

    return errors;
  };

  const save = async (values) => {
    try {
      await apiSeguridadClient.post("/v1/usuarios/cambiarpassword", values);
      router.push(`/${lng}/auth/login?result=CAMBIO_CLAVE_EXITO`);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  return (
    <div>
      <Grid container>
        <MessageComponent t={t} />
      </Grid>
      <Typography component="h1" variant="h5">
        {t("reset_password")}
      </Typography>
      {entityOnEdition && (
        <Formik
          onSubmit={save}
          validate={validate}
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
              <form onSubmit={handleSubmit} className="divlogin">
                <Grid container spacing={2}>
                  <TextField
                    margin="normal"
                    fullWidth
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("new_password")}
                    name="password"
                    inputProps={{
                      type: "password",
                      autoComplete: "new-password",
                    }}
                    error={errors.password && touched.password}
                    helperText={
                      errors.password && touched.password ? errors.password : ""
                    }
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    value={values.confirmar}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("confirm_password")}
                    name="confirmar"
                    error={errors.confirmar && touched.confirmar}
                    helperText={
                      errors.confirmar && touched.confirmar
                        ? errors.confirmar
                        : ""
                    }
                    inputProps={{
                      type: "password",
                      autoComplete: "new-password",
                    }}
                  />

                  <Button
                    disabled={isSubmitting || !hasRequest}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    {t("update_password")}
                  </Button>

                  <Grid item>
                    <Link href="login" variant="body2">
                      {t("go_to_login")}
                    </Link>
                  </Grid>
                </Grid>
              </form>
            );
          }}
        </Formik>
      )}
    </div>
  );
};
