"use client"
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { Grid, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import { makeStyles } from "tss-react/mui";
import { Formik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/client"


const useStyles = makeStyles()((theme) => ({
  paper: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Recovery({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent, messageCleanUp } = useMensaje(lng);

  const { classes } = useStyles();

  const router = useRouter();

  const [entityOnEdition, setEntityOnEdition] = useState();

  useEffect(() => {
    setEntityOnEdition({
      email: "",
    });
  }, []);

  const validate = (values) => {
    const errors = {};
    const required = ["email"];

    required.forEach((element) => {
      if (!values[element]) {
        errors[element] = t("required");
      }
    });

    return errors;
  };

  const save = async (values) => {
    try {
      messageCleanUp();
      await apiSeguridadClient.post("/v1/usuarios/recuperar", values);
      router.push(`/${lng}/auth/login?result=RECOVERY_PASSWORD`);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  return (
    <div className={classes.paper}>
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
              <form onSubmit={handleSubmit}>
                <Grid container>
                  <MessageComponent t={t} />
                  <TextField
                    margin="normal"
                    fullWidth
                    size="small"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label={t("email_address")}
                    name="email"
                    error={errors.email && touched.email}
                    helperText={
                      errors.email && touched.email ? errors.email : ""
                    }
                  />
                </Grid>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  {t("restore_password")}
                </Button>
                <Grid container justifyContent="flex-end">
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