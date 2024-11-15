"use client"
import { useTranslation } from "@/app/i18n/client";
import CsvBulkUpload from "@/components/CsvBulkUpload/CsvBulkUpload";
import DeleteDialog from "@/components/Custom/DeleteDialog";
import Loader from "@/components/Loader/loader";
import SimpleTable from "@/components/SimpleTable/SimpleTable";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CountryRegionData } from "react-country-region-selector";


export default function ProveedoresSimpleTable({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const staticColumns = [
    { id: "companyName", label: t("name") },
    {
      id: "enabled",
      label: t("enabled"),
      format: (row) => (_.get(row, "enabled") ? t("yes") : t("no")),
    },
    {
      label: t("brands"),
      format: (row) =>
        _.get(row, "marcas")
          ? _.get(row, "marcas")
            .map(function (br) {
              return br.name;
            })
            .join(", ")
          : "",
    },
    {
      id: "auditData.lastModDateTime",
      label: t("mod_date"),
      format: (row) => localTime(_.get(row, "auditData.lastModDateTime")),
    },
  ];

  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterElements, setFilterElements] = useState({});
  const [editingObject, setEditingObject] = useState({});
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [isAddEnabled, setIsAddEnabled] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [orderDirection, setOrderDirection] = useState("asc");
  const [valueToOrderBy, setValueToOrderBy] = useState("id");

  useEffect(() => {
    setIsAddEnabled(userHasRequiredOperation(constantesOps.PROVEEDORES_CREAR));
    setIsEditEnabled(
      userHasRequiredOperation(constantesOps.PROVEEDORES_ACTUALIZAR)
    );
    setIsDeleteEnabled(
      userHasRequiredOperation(constantesOps.PROVEEDORES_ELIMINAR)
    );
    searchTotal();
  }, []);

  useEffect(() => {
    searchItems();
  }, [page, rowsPerPage, orderDirection, valueToOrderBy]);

  const searchTotal = async () => {
    try {
      setTotal(
        await apiClient.get("/v1/proveedores/search/total", {
          params: filterElements,
        })
      );
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const searchItems = async () => {
    try {
      setLoading(true);
      filterElements.maxResults = rowsPerPage;
      filterElements.first = page * filterElements.maxResults;
      if (valueToOrderBy) {
        filterElements.orderBy = [valueToOrderBy];
        filterElements.ascending = [orderDirection === "asc"];
      }
      let results = await apiClient.get("/v1/proveedores/search", { params: filterElements })
      setItems(results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      addMessage(error, "error");
    }
  };

  const handleChangeFilter = (event) => {
    setFilterElements({
      ...filterElements,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleOrderBy = (columnId) => {
    const isDesc = orderDirection === "desc";
    setValueToOrderBy(columnId);
    setOrderDirection(isDesc ? "asc" : "desc");
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const handleSearch = async () => {
    if (page != 0) {
      handleChangePage(null);
    } else {
      searchItems();
    }
    searchTotal();
  };

  const handleClear = async () => {
    setPage(0);
    setItems(null);
    setFilterElements({});
  };

  const handleEdit = (row) => {
    setEditingObject(row);
    setIsOpenEdit(true);
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete("/v1/proveedores/" + editingObject.id);
      if (page != 0) {
        searchTotal();
        setPage(0);
      } else {
        handleSearch();
      }
      handleCloseDelete();
      addMessage("SUCCESSFUL_DELETE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const handleCloseDelete = () => {
    setIsOpenDelete(false);
  };

  const selectForDelete = (row) => {
    setEditingObject(row);
    setIsOpenDelete(true);
  };

  const validateCsv = (data) => {
    const errors = [];

    if (!data || !data.length > 0) {
      errors.push(t("messages:label_cvs_invalid_format"));
      return errors;
    }
    return errors;
  };

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("proveedores")}</h3>
        </Grid>
        {isAddEnabled &&
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

            <Link href="/p/abm/proveedor">
              <Button
                color="primary"
                variant="contained"
                className="float-right"
                startIcon={<AddIcon />}
              >
                {t("add")}
              </Button>
            </Link>
          </Grid>
        }
      </Grid>
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>
      <Grid container direction="row">
        <Grid item xs={12} sm={12} md={12}>
          <Box marginTop={2}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t("filters")}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      value={filterElements.name || ""}
                      onChange={handleChangeFilter}
                      label={t("name")}
                      name="name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      value={filterElements.accountNumber || ""}
                      onChange={handleChangeFilter}
                      label={t("accountnumber")}
                      name="accountNumber"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      value={filterElements.taxId || ""}
                      onChange={handleChangeFilter}
                      label={t("taxid")}
                      name="taxId"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      value={filterElements.salLastName || ""}
                      onChange={handleChangeFilter}
                      label={t("representativelastname")}
                      name="salLastName"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      value={filterElements.salFirstName || ""}
                      onChange={handleChangeFilter}
                      label={t("representativefirstname")}
                      name="salFirstName"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      value={filterElements.salEmail || ""}
                      onChange={handleChangeFilter}
                      label={t("representativeemail")}
                      name="salEmail"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      name={"addCountry"}
                      fullWidth
                      size="small"
                      label={t("addCountry")}
                      value={filterElements.addCountry || ""}
                      select
                      onChange={handleChangeFilter}
                    >
                      <MenuItem value="">
                        <em>{t("select")}</em>
                      </MenuItem>
                      {CountryRegionData.map((option, index) => (
                        <MenuItem key={option[1]} value={option[1]}>
                          {option[0]}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      autoComplete="off"
                      value={filterElements.marName || ""}
                      onChange={handleChangeFilter}
                      label={t("brands")}
                      name="marName"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <RadioGroup
                      size="small"
                      row
                      aria-label="enabled"
                      name="enabled"
                      value={filterElements.enabled || "null"}
                      onChange={handleChangeFilter}
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio color="primary" />}
                        label={t("enabled")}
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio color="primary" />}
                        label={t("not_enabled")}
                      />
                      <FormControlLabel
                        value="null"
                        control={<Radio color="primary" />}
                        label={t("all")}
                      />
                    </RadioGroup>
                  </Grid>
                </Grid>
              </CardContent>
              <CardContent>
                <Button
                  onClick={handleSearch}
                  className="MuiButton-containedPrimary"
                >
                  {t("search")}
                </Button>
                <Button onClick={handleClear}>{t("clean")}</Button>
              </CardContent>
            </Card>
          </Box>

          <Box marginTop={3}>
            <Card>
              <CardContent>
                {isLoading && <Loader />}

                {!isLoading && items?.length == 0 && (
                  <div>{t("no_results")}</div>
                )}
                {!isLoading && items?.length > 0 && total && (
                  <SimpleTable
                    staticColumns={staticColumns}
                    items={items}
                    editEnabled={isEditEnabled}
                    viewEnabled={!isEditEnabled}
                    deleteEnabled={isDeleteEnabled}
                    editLink="/p/abm/proveedor" //si la edición se realiza en una página aparte, sino edit
                    edit={handleEdit}
                    selectForDelete={selectForDelete}
                    total={total}
                    rowsPerPage={rowsPerPage}
                    t={t}
                    page={page}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    handleOrderBy={handleOrderBy}
                    orderDirection={orderDirection}
                    valueToOrderBy={valueToOrderBy}
                    addMessage={addMessage}
                  ></SimpleTable>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Edit */}
      <Dialog
        fullScreen
        scroll="body"
        open={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        aria-labelledby="form-dialog-title"
      >
        No se implementa para no duplicar código. Ver proveedor.js o
        proveedoresSearchTable.js
      </Dialog>

      {/* Delete */}
      <DeleteDialog
        t={t}
        open={isOpenDelete}
        setOpen={setIsOpenDelete}
        handleDelete={handleDelete}
      />
    </>
  );
};