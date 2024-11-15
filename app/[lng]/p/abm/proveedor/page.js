"use client"
import { useTranslation } from "@/app/i18n/client";
import Address, { validateAddress } from "@/components/Address/Address";
import ABMDocuments from "@/components/Custom/ABMDocuments";
import ABMImages from "@/components/Custom/ABMImages";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiClient, apiFileDownload } from "@/lib/apiClient";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import { debounce } from "lodash";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { ConnectedFocusError } from "focus-formik-error";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}


export default function ProveedorDetalle({ params: { lng }, searchParams: { id } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const router = useRouter();

  const [editingObject, setEditingObject] = useState();
  const [marcas, setMarcas] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [images, setImages] = useState(null);
  const imageFilter = {
    incluirCampos: ["file.nombre", "file.id", "file.tmpUuid", "file.storage"],
  };
  const [documentos, setDocumentos] = useState([]);

  //Initial charge when first entered
  useEffect(() => {
    if (id != null) {
      if (userHasRequiredOperation(constantesOps.PROVEEDORES_ACTUALIZAR)) {
        handleEdit();
      } else if (userHasRequiredOperation(constantesOps.PROVEEDORES_BUSCAR)) {
        handleEdit();
        setIsReadOnly(true);
      } else {
        router.push(`/${lng}/p/inicio`);
        return;
      }
    } else if (userHasRequiredOperation(constantesOps.PROVEEDORES_CREAR)) {
      handleAdd();
    } else {
      router.push(`/${lng}/p/inicio`);
      return;

    }
    handleMarcas();
  }, []);

  //Documents
  const loadDocuments = async () => {
    //es el metodo que levanta los documentos desde el servidor

    //se levantan los documentos del server o no se hace nada
    //return api.get("/v1/proveedores/" + editingObject.id + "/documentos/search", {
    //  params: imageFilter,
    //})
  };

  const saveDocuments = async (documentosToSave) => {
    /*Metodo que se invoca cuando se le da click al save de los documentos, el componente
          ABMDocuments lo subio de forma temporaal al server, aqui se decide si
          los mantenemos en memoria o ya invocamos al server para guardarlos */

    //console.log("saveDocumentos " + JSON.stringify(documentosToSave))
    /*En este caso los manteneos en memoria porque se salvan junto al form de esta pagina*/
    const newDocumentos = [...documentos, ...documentosToSave];
    setDocumentos(newDocumentos);

    /* En el guardar del form incluir los archivos de esta forma */
    /* 
        if (documentos != null) {
            //si el objeto solo admite un archivo
            values.archivo = documentos[0];
            //permite varios archivos
            values.archivo = documentos;
        }
        */

    /*Ejemplo de como salvar los documentos ya de forma definitiva en el server
          teniendo el id del objeto padre y agregando la lista de documentos*/
    //return api.post("/v1/proveedores/" + editingObject.id + "/archivo", newDocumentos);
  };

  const deleteDocument = async (documentoToDelete, indexToDelete) => {
    /*Metodo que se llama cuando se elimina un documento, igual que el save
          si mantenemos en memoria es sacarlo de la lista de documentos, sino tambien se llama
          al server para eliminarlos*/
    const updatedDocuments = documentos.filter(
      (_, index) => index !== indexToDelete
    );
    setDocumentos(updatedDocuments);

    /*El objeto documentoToDelete debe tener el id del documento para eliminarlo*/
    //return api.delete("/v1/proveedores/" + editingObject.id + "/documentdelete/" + documentoToDelete.id);
  };
  //Fin Documents

  //Images
  const loadImages = async () => {

    return apiClient.get("/v1/proveedores/" + editingObject.id + "/images/search", {
      params: imageFilter,
    });
  };

  const saveImages = async (images) => {
    return apiClient.post(
      "/v1/proveedores/" + editingObject.id + "/addnewimages",
      images
    );
  };

  const deleteImage = async (imagePk) => {
    return apiClient.delete(
      "/v1/proveedores/" + editingObject.id + "/images/" + imagePk
    );
  };

  const handleAdd = async () => {
    setEditingObject({
      companyName: "",
      enabled: true,
      address: {},
      marcas: [],
    });
    setIsReadOnly(false);
  };

  const handleEdit = async () => {
    if (id) {
      let result = await apiClient.get("/v1/proveedores/" + id)
      setEditingObject(result);
    }
  };

  const handleMarcas = async (value) => {
    try {
      let results = await apiClient.get("/v1/marcas/search", {
        params: {
          name: value,
          maxResults: 10,
          first: 0,
          orderBy: ["searchName"],
          ascending: [true],
        }
      })
      setMarcas(results);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  //Debounce para no disparar consulta a backend cada vez que se apreta una key. Se esperan 500ms para disparar.
  const handleMarcasDebounced = debounce(handleMarcas, 500);

  const validate = (values) => {
    let errors = {};

    if (!values.companyName) {
      errors.companyName = t("required");
    }

    validateAddress(values.address, errors, t);

    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (values.salEmail) {
      if (!pattern.test(values.salEmail)) {
        errors.salEmail = t("invalid");
      }
    }

    return errors;
  };

  const save = async (values) => {
    try {
      let prov;
      if (values.id == null) {
        prov = await apiClient.post("/v1/proveedores", values);
        values.id = prov.id;
        values.version = prov.version;
      } else {
        prov = await apiClient.put("/v1/proveedores/" + values.id, values);
        values.version = prov.version;
      }
      setEditingObject(values);
      addMessage("SUCCESSFUL_SAVE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("supplier")}</h3>
        </Grid>
      </Grid>
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>
      <Grid container>
        <Grid item xs={12} sm={12} md={12}>
          {editingObject && (
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
                    <Card>
                      <CardContent>
                        <ConnectedFocusError>/</ConnectedFocusError>
                        <Tabs
                          value={activeTab}
                          indicatorColor="primary"
                          textColor="primary"
                          onChange={(evt, newValue) => {
                            setActiveTab(newValue);
                          }}
                        >
                          <Tab label={t("general")} value={0} />
                          {values.id && <Tab label={t("images")} value={1} />}
                          {values.id && (
                            <Tab label={t("documents")} value={2} />
                          )}
                        </Tabs>
                        <TabPanel value={activeTab} index={0}>
                          <span className="title-form-owom">
                            {t("companyinfo")}
                          </span>
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
                                error={
                                  errors.companyName && touched.companyName
                                }
                                helperText={
                                  errors.companyName && touched.companyName
                                    ? errors.companyName
                                    : ""
                                }
                                inputProps={{
                                  readOnly: isReadOnly,
                                  maxLength: 100
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
                                  errors.taxId && touched.taxId
                                    ? errors.taxId
                                    : ""
                                }
                                inputProps={{
                                  readOnly: isReadOnly,
                                  maxLength: 50
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={values.enabled}
                                    onChange={
                                      !isReadOnly ? handleChange : undefined
                                    }
                                    onBlur={handleBlur}
                                    name="enabled"
                                    color="primary"
                                    inputProps={{
                                      readOnly: isReadOnly
                                    }}
                                  />
                                }
                                label={t("enabled")}
                              />
                            </Grid>
                          </Grid>
                          <span className="title-form-owom">
                            {t("companyaddress")}
                          </span>

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
                                error={
                                  errors.salFirstName && touched.salFirstName
                                }
                                helperText={
                                  errors.salFirstName && touched.salFirstName
                                    ? errors.salFirstName
                                    : ""
                                }
                                inputProps={{
                                  readOnly: isReadOnly,
                                  maxLength: 100
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
                                error={
                                  errors.salLastName && touched.salLastName
                                }
                                helperText={
                                  errors.salLastName && touched.salLastName
                                    ? errors.salLastName
                                    : ""
                                }
                                inputProps={{
                                  readOnly: isReadOnly,
                                  maxLength: 100
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
                                  maxLength: 250
                                }}
                              />
                            </Grid>
                          </Grid>

                          <span className="title-form-owom">
                            {t("account")}
                          </span>
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
                                error={
                                  errors.accountNumber && touched.accountNumber
                                }
                                helperText={
                                  errors.accountNumber && touched.accountNumber
                                    ? errors.accountNumber
                                    : ""
                                }
                                inputProps={{
                                  readOnly: isReadOnly,
                                  maxLength: 100
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
                                  errors.notes && touched.notes
                                    ? errors.notes
                                    : ""
                                }
                                inputProps={{
                                  readOnly: isReadOnly,
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
                              setFieldValue(
                                "marcas",
                                value !== null ? value : ""
                              );
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
                        </TabPanel>

                        {values.id && (
                          <TabPanel value={activeTab} index={1}>
                            <ABMImages
                              readOnly={isReadOnly}
                              addEnable={true}
                              images={images}
                              setImages={setImages}
                              loadImages={loadImages}
                              saveImages={saveImages}
                              deleteImage={deleteImage}
                              t={t}
                              lng={lng}
                            />
                          </TabPanel>
                        )}

                        {values.id && (
                          <TabPanel value={activeTab} index={2}>
                            <ABMDocuments
                              t={t}
                              filesLimit={1}
                              readOnly={false}
                              addEnable={true}
                              acceptedFiles={[
                                "image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.tsv,.ppt,.pptx,.pages,.odt,.rtf",
                              ]}
                              maxFileSize={30000000}
                              documentos={documentos}
                              setDocumentos={setDocumentos}
                              loadDocumentos={loadDocuments}
                              saveDocumentos={saveDocuments}
                              deleteDocumentos={deleteDocument}
                              downloadApi={apiFileDownload}
                              downloadPostUrl={"/v1/archivos/download"}
                              showEmptyTable={false}
                              lng={lng}
                            />
                          </TabPanel>
                        )}
                      </CardContent>
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