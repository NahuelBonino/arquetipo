"use client"
import { useTranslation } from "@/app/i18n/client";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";


const useStyles = makeStyles()((theme) => ({
  root: {
    margin: "auto",
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    height: 450,
    overflow: "auto",
  },
}));

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

export default function Rol({ params: { lng }, searchParams: { rolId } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const { classes } = useStyles();


  const [rolOnEdit, setRolOnEdit] = useState();
  const [isEditEnabled, setIsEditEnabled] = useState(false);

  //Operaciones transfer list
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);

  //Carga inicial cuando se ingresa por primera vez
  useEffect(() => {

    if (rolId != null) {
      loadRole();
    } else {
      addRole();
    }
    setIsEditEnabled(
      userHasRequiredOperation(constantesOps.SEGURIDAD_ROLES_ACTUALIZAR)
    );
  }, []);

  //Cargar
  const addRole = async () => {
    try {
      const filtroOp = {
        habilitado: true,
      };
      const operationsAvaible = await apiSeguridadClient.get(
        "/v1/operaciones/buscar",
        { params: filtroOp }
      );

      const notSelectedOperations = operationsAvaible.map((r) => {
        return { operacion: r };
      }); //Para cada operación no seleccionada, creamos entidad que asocia el rol a la operación

      setRolOnEdit({ rolNombre: "", rolCodigo: "", rolHabilitado: true });
      setRight([]);
      setLeft(notSelectedOperations);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const loadRole = async () => {
    try {
      let role = await apiSeguridadClient.get("/v1/roles/" + rolId);
      const filtroOp = {
        rolHabilitado: true,
      };
      const operationsAvaible = await apiSeguridadClient.get(
        "/v1/operaciones/buscar",
        { params: filtroOp }
      );

      const selectedOperations = role.rolOperaciones; //Entidad que asocia un rol con una operación

      const notSelectedOperations = operationsAvaible
        .filter(
          (ar) => !selectedOperations.find((rm) => rm.operacion.opeId === ar.opeId)
        )
        .map((r) => {
          return { operacion: r };
        }); //Para cada operación no seleccionada, creamos entidad que asocia el rol a la operación

      setRolOnEdit(role);
      setRight(selectedOperations);
      setLeft(notSelectedOperations);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const validate = (values) => {
    const errors = {};
    if (!values.rolCodigo) {
      errors.rolCodigo = t("required");
    }
    if (!values.rolNombre) {
      errors.rolNombre = t("required");
    }
    return errors;
  };

  const save = async (values) => {
    try {
      values.rolOperaciones = right;
      if (values.rolId == null) {
        const rol = await apiSeguridadClient.post("/v1/roles", values);
        setRolOnEdit(rol);
      } else {
        const rol = await apiSeguridadClient.put("/v1/roles/" + values.rolId, values);
        setRolOnEdit(rol);
      }
      addMessage("SUCCESSFUL_SAVE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  //Operaciones transfer list

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title, items) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{ "aria-label": "all items selected" }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} ${t(
          "selected_f"
        )}`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map((value, index) => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem
              key={index}
              role="listitem"
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.operacion.opeNombre} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("role")}</h3>
        </Grid>
      </Grid>
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>

      <Grid container direction="row">
        <Grid item xs={12} sm={12} md={12}>
          {rolOnEdit && (
            <Formik
              initialValues={rolOnEdit}
              enableReinitialize={true}
              validate={validate}
              validateOnChange={false}
              validateOnBlur={false}
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
                  <form className={classes.form} onSubmit={handleSubmit}>
                    <Card>
                      <CardContent>
                        <Grid spacing={2} container direction="row">
                          <Grid xs={12} item>
                            <TextField
                              className="inputWidth"
                              size="small"
                              autoComplete="off"
                              value={values.rolCodigo}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              label={t("code")}
                              name="rolCodigo"
                              autoFocus
                              error={errors.rolCodigo && touched.rolCodigo}
                              helperText={
                                errors.rolCodigo && touched.rolCodigo
                                  ? errors.rolCodigo
                                  : ""
                              }
                              inputProps={{ maxLength: 6 }}
                            />
                          </Grid>
                          <Grid xs={12} item>
                            <TextField
                              className="inputWidth"
                              size="small"
                              autoComplete="off"
                              value={values.rolNombre}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              name="rolNombre"
                              label={t("name")}
                              error={errors.rolNombre && touched.rolNombre}
                              helperText={
                                errors.rolNombre && touched.rolNombre
                                  ? errors.rolNombre
                                  : ""
                              }
                              inputProps={{ maxLength: 100 }}
                            />
                          </Grid>

                          <Grid xs={12} item>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={values.rolHabilitado}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  name="rolHabilitado"
                                  color="primary"
                                  className="inputWidth"
                                />
                              }
                              label={t("enabled")}
                            />
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          spacing={2}
                          alignItems="flex-start"
                          className={classes.root + " rolbox"}
                        >
                          <Grid item className="rolboxinside">
                            {customList(t("operations"), left)}
                          </Grid>
                          <Grid item>
                            <Grid
                              container
                              direction="column"
                              alignItems="center"
                            >
                              <Button
                                size="small"
                                className={classes.button}
                                onClick={handleCheckedRight}
                                disabled={leftChecked.length === 0}
                                aria-label="move selected right"
                              >
                                &gt;
                              </Button>
                              <Button
                                size="small"
                                className={classes.button}
                                onClick={handleCheckedLeft}
                                disabled={rightChecked.length === 0}
                                aria-label="move selected left"
                              >
                                &lt;
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid item className="rolboxinside">
                            {customList(t("role_permissions"), right)}
                          </Grid>
                        </Grid>
                      </CardContent>
                      <CardActions disableSpacing>
                        {isEditEnabled &&
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={classes.submit}
                            color="primary"
                            variant="contained"
                          >
                            {t("save")}
                          </Button>
                        }
                      </CardActions>
                    </Card>
                  </form>
                );
              }}
            </Formik>
          )}
        </Grid>
      </Grid>
    </>
  );
};