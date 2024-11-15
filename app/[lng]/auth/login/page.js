"use client"
import { useTranslation } from "@/app/i18n/client";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { SAuth } from "@/lib/services";
import { clearOperations } from "@/lib/utils/opsValidator";
import { Button, Grid, Link, TextField } from "@mui/material";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import * as Yup from "yup";


function validateForm(t) {
  return Yup.object().shape({
    username: Yup.string().required(t("required")),
    password: Yup.string().required(t("required")),
  });
}

export default function Login({ params: { lng }, searchParams: { result, uuid, usu } }) {


  const [cookies, setCookie, removeCookie] = useCookies();
  const { t } = useTranslation(lng);
  const { addMessage, MessageComponent } = useMensaje(lng);

  const router = useRouter();

  useEffect(() => {
    if (result) {
      addMessage(result, "success");
    }
    if (usu && uuid) {
      validateUser();
    }
  }, []);

  const callLogin = async (values) => {
    try {
      clearOperations(); //borro el cache de operaciones que hay en opsValidator.js para que coloque las operaciones nuevas
      localStorage.removeItem("token");
      await SAuth.login(values, setCookie, removeCookie);
      if (cookies.redirectUrl) {
        removeCookie("redirectUrl", { path: '/' });
        router.push(cookies.redirectUrl);
      } else {
        router.push(`/${lng}/p/inicio`);
      }
    } catch (error) {
      addMessage(error, "error");
    }

  };

  const validateUser = async () => {
    try {
      await apiSeguridadClient.post("/v1/usuarios/validar", {
        email: usu,
        usuUuidResetPassword: uuid,
      });
      addMessage("VALIDACION_EXITOSA", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  return (
    <div className="login">
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        validateOnBlur={false}
        validationSchema={validateForm(t)}
        onSubmit={callLogin}
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
              <TextField
                margin="normal"
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                autoComplete="off"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                label={t("email")}
                name="username"
                autoFocus
                error={errors.username && touched.username}
                helperText={
                  errors.username && touched.username ? errors.username : ""
                }
              />
              <TextField
                margin="normal"
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                autoComplete="off"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                name="password"
                label={t("password")}
                error={errors.password && touched.password}
                type="password"
                helperText={
                  errors.password && touched.password ? errors.password : ""
                }
              />

              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
                variant="contained"
                color="primary"
              >
                {t("login")}
              </Button>

              <Link href="recovery" variant="body2" className="olvidopass">
                {t("forgot_password")}
              </Link>

              <div className="regisLog">{t("dont_have_account")}</div>
              <Link href="signup" variant="body2">
                {t("register")}
              </Link>
            </form>
          );
        }}
      </Formik>
    </div>
  );
};