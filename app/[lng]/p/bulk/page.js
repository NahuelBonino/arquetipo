"use client"
import { useTranslation } from "@/app/i18n/client";
import Loader from "@/components/Loader/loader";
import SimpleTable from "@/components/SimpleTable/SimpleTable";
import useMensaje from "@/hooks/useMensaje";
import { apiFileClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";


export default function BulkTasks({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const staticColumns = [
    {
      id: "entity",
      label: t("entityname"),
      format: (row) =>
        _.get(row, "entity").replaceAll("com.sofis.entities.bulk.", ""),
    },
    { id: "status", label: t("status") },
    { id: "totalProcessedItems", label: t("total_processed_items") },
    { id: "totalSuccessful", label: t("total_successful_items") },
    { id: "totalError", label: t("total_error_items") },
    {
      id: "lastProcessDate",
      label: t("last_process_date"),
      format: (row) =>
        _.get(row, "lastProcessDate")
          ? localTime(_.get(row, "lastProcessDate"))
          : "",
    },
  ];
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterElements, setFilterElements] = useState({
    maxResults: 10,
    first: 0,
    orderBy: ["id"],
    ascending: [false],
  });
  const [editingObject, setEditingObject] = useState({});
  const [isOpenViewError, setIsOpenViewError] = useState(false);
  const [isResultViewItems, setIsResultViewItems] = useState([]);
  const [orderDirection, setorderDirection] = useState("asc");
  const [valueToOrderBy, setvalueToOrderBy] = useState("");

  useEffect(() => {
    searchTotal();
  }, []);

  useEffect(() => {
    search();
  }, [page, rowsPerPage, orderDirection, valueToOrderBy]);

  //Search
  const searchTotal = async () => {
    try {
      setTotal(
        await apiFileClient.get("/v1/bulk/search/total", { params: filterElements })
      );
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const search = async () => {
    try {
      setLoading(true);
      let results = await apiFileClient.get("/v1/bulk/search", { params: filterElements })
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

  const handleChangePage = (event, newPage) => {
    setFilterElements({
      ...filterElements,
      first: newPage * filterElements.maxResults,
    });
    setPage(newPage);
  };

  const handleOrderBy = (columnId) => {
    const isDesc = orderDirection === "desc";
    setFilterElements({
      ...filterElements,
      orderBy: [columnId],
      ascending: [isDesc],
    });

    setvalueToOrderBy(columnId);
    setorderDirection(isDesc ? "asc" : "desc");
  };
  const handleChangeRowsPerPage = (event) => {
    setFilterElements({
      ...filterElements,
      first: 0,
      maxResults: event.target.value,
    });
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  const handleSearch = async () => {
    if (page != 0) {
      handleChangePage(null, 0);
    } else {
      search();
    }
    searchTotal();
  };

  const handleClear = async () => {
    setPage(0);
    setItems([]);
    setFilterElements({
      maxResults: 10,
      first: 0,
      orderBy: ["id"],
      ascending: [false],
    });
  };

  const handleViewError = async (row, isView) => {
    setLoading(true);
    setIsOpenViewError(true);
    try {
      setEditingObject(row);
      setIsResultViewItems(JSON.parse(row.result));
    } catch (error) {
      alert(JSON.stringify(error));
    }

    setLoading(false);
  };

  const handleCloseViewError = async () => {
    setIsOpenViewError(false);
  };


  return (
    <>
      <Grid
        justifyContent="space-between" // Add it here :)
        container
        direction="row"
      >
        <Grid item>
          <h3>{t("BulkTasks")}</h3>
        </Grid>
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
                      value={filterElements.entity || ""}
                      onChange={handleChangeFilter}
                      label={t("entityname")}
                      name="entity"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <RadioGroup
                      row
                      aria-label="status"
                      name="status"
                      value={filterElements.status || "null"}
                      onChange={handleChangeFilter}
                    >
                      <FormControlLabel
                        value="0"
                        control={<Radio color="primary" />}
                        label={t("inprocess")}
                      />
                      <FormControlLabel
                        value="1"
                        control={<Radio color="primary" />}
                        label={t("finished")}
                      />
                      <FormControlLabel
                        value="null"
                        control={<Radio color="primary" />}
                        label={t("all")}
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <RadioGroup
                      row
                      aria-label="enabled"
                      name="enabled"
                      value={filterElements.enabled || "null"}
                      onChange={handleChangeFilter}
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio color="primary" />}
                        label={t("yes")}
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio color="primary" />}
                        label={t("no")}
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
                    editEnabled={false}
                    deleteEnabled={false}
                    viewEnabled={true}
                    total={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    t={t}
                    edit={handleViewError}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    handleOrderBy={handleOrderBy}
                    orderDirection={orderDirection}
                    valueToOrderBy={valueToOrderBy}
                  ></SimpleTable>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={isOpenViewError}
        onClose={handleCloseViewError}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              {" "}
              {t("Total")} :{" "}
              <span className="totals-results">
                {editingObject.totalProcessedItems}
              </span>
            </Grid>
            <Grid item xs={4}>
              {" "}
              {t("Success")} :{" "}
              <span className="success-results">
                {editingObject.totalSuccessful}
              </span>
            </Grid>
            <Grid item xs={4}>
              {" "}
              {t("Error")} :{" "}
              <span className="error-results">{editingObject.totalError}</span>
            </Grid>
            <Grid item xs={12}>
              <Table aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("line")}</TableCell>
                    <TableCell align="right">{t("result")}</TableCell>
                    <TableCell align="right">{t("message")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isResultViewItems.map((row) => (
                    <TableRow
                      key={row[0]}
                      className={
                        row && row[1] == 1 ? "bulkTableRowFail" : "bulkTableRow"
                      }
                    >
                      <TableCell component="th" scope="row">
                        {row[0]}
                      </TableCell>
                      <TableCell align="right">
                        {row[1] == 1 ? t("Error") : "OK"}
                      </TableCell>
                      <TableCell align="right">
                        {JSON.stringify(row[2])}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewError} color="primary">
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};