/* eslint-disable no-use-before-define */
import DeleteDialog from "@/components/Custom/DeleteDialog";
import HistoricoDialog from "@/components/Custom/HistoricoDialog";
import Loader from "@/components/Loader/loader";
import SimpleTable from "@/components/SimpleTable/SimpleTable";
import { apiFileClient } from "@/lib/apiClient";
import { downloadFile } from "@/lib/utils/fileUtils";
import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { Form, Formik } from "formik";
import { get } from "lodash";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";


const SearchTable = ({
  staticColumns,
  filterColumns,
  api,
  t,
  basePath,
  searchTotalPath = "/search/total",
  searchPath = "/search",
  deletePath = "",
  idColumn = "id",
  editMethod,
  editEnabled = false,
  deleteEnabled = false,
  historyEnabled = false,
  viewEnabled,
  setEditingObject,
  editingObject,
  filterElements,
  setFilterElements,
  initialRowsPerPage = 10,
  editLink,
  searchOnInit = false,
  addMessage,
  lng,
  handleSearchRef,
}) => {

  let urlTotal = basePath + searchTotalPath;
  let urlSearch = basePath + searchPath;
  let urlDelete = basePath + deletePath;

  if (viewEnabled == null) {
    viewEnabled = !editEnabled;
  }

  const [total, setTotal] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [orderDirection, setOrderDirection] = useState("asc");
  const [valueToOrderBy, setValueToOrderBy] = useState(idColumn);
  const [items, setItems] = useState(null);
  const [isShowHistory, setIsShowHistory] = useState(false);

  const DEFAULT_FILTRO = {
    maxResults: 10,
    first: 0,
    orderBy: valueToOrderBy,
    ascending: [true],
  };

  const componentDidMount = useRef(false);

  useEffect(() => {
    if (filterElements.clear) {
      handleSearch();
      setFilterElements(DEFAULT_FILTRO);
    }
  }, [filterElements]);

  useEffect(() => {
    if (componentDidMount.current || searchOnInit) {
      searchItems();
    }
    componentDidMount.current = true;
  }, [page, rowsPerPage, orderDirection, valueToOrderBy]);

  useEffect(() => {
    handleSearchRef.current = handleSearch;
    if (searchOnInit) {
      searchTotal();
    }
  }, []);

  const searchTotal = async () => {
    try {
      setTotal(await api.get(urlTotal, { params: filterElements }));
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const searchItems = async () => {
    try {
      setIsLoading(true);
      let newFilter = { ...filterElements };
      newFilter.orderBy = [valueToOrderBy];
      newFilter.maxResults = rowsPerPage;
      newFilter.first = page * filterElements.maxResults;

      newFilter.ascending = [orderDirection === "asc"];

      if (newFilter.orderBy === undefined) {
        newFilter.orderBy = [valueToOrderBy];
      }
      if (!newFilter.first) {
        newFilter.first = 0;
      }
      setFilterElements(newFilter);
      let results = await api.get(urlSearch, { params: newFilter });
      setItems(results);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      addMessage(error, "error");
    }
  };

  const exportar = async () => {
    try {
      const file = await apiFileClient.get(
        basePath + "/exportar?exportFormat=csv",
        {
          params: {
            ...filterElements,
            maxResults: null,
            first: 0,
            csvHeaders: staticColumns,
          },
        }
      );
      downloadFile(new Blob([file]), "archivo" + ".csv");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const selectForDelete = (row) => {
    setEditingObject(row);
    setIsOpenDelete(true);
  };

  const selectForHistory = (row) => {
    setEditingObject(row);
    setIsShowHistory(true);
  };

  const handleChangeFilter = (event) => {
    setFilterElements({
      ...filterElements,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangePage = (event, newPage) => {
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
      handleChangePage(null, 0);
    } else {
      searchItems();
    }
    searchTotal();
  };

  const handleClear = async () => {
    setFilterElements({ ...DEFAULT_FILTRO, clear: true });
  };

  const handleDelete = async () => {
    try {
      await api.delete(urlDelete + "/" + editingObject[idColumn]);
      if (page != 0) {
        searchTotal();
        setPage(0);
      } else {
        handleSearch();
      }
      setIsOpenDelete(false);
      addMessage("SUCCESSFUL_DELETE", "success");
    } catch (error) {
      addMessage(error, "error");
    }
  };

  return (
    <>
      <Grid container direction="row">
        <Grid item xs={12} sm={12} md={12}>
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className="titulo-filtros">{t("filters")}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Formik initialValues={filterColumns} onSubmit={handleSearch}>
                {(props) => {
                  const { values, isSubmitting } = props;

                  return (
                    <Form>
                      <CardContent>
                        <Grid container spacing={2}>
                          {values?.map((filter, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                              {filter.type == "BOOLEAN" && (
                                <RadioGroup
                                  size="small"
                                  row
                                  aria-label={filter.label}
                                  name={filter.id}
                                  value={
                                    get(filterElements, filter.id) || "null"
                                  }
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
                              )}
                              {filter.type == "TEXT" && (
                                <TextField
                                  name={filter.id}
                                  label={t(filter.label)}
                                  value={get(filterElements, filter.id) || ""}
                                  fullWidth
                                  size="small"
                                  autoComplete="off"
                                  onChange={handleChangeFilter}
                                />
                              )}
                              {filter.type == "DATE" && (
                                <TextField
                                  name={filter.id}
                                  size="small"
                                  id="date"
                                  label={t(filter.label)}
                                  type="date"
                                  value={get(filterElements, filter.id) || ""}
                                  onChange={handleChangeFilter}
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                />
                              )}
                              {filter.type == "SELECT" && (
                                <TextField
                                  name={filter.id}
                                  label={t(filter.label)}
                                  value={get(filterElements, filter.id) || ""}
                                  fullWidth
                                  size="small"
                                  select
                                  onChange={handleChangeFilter}
                                >
                                  <MenuItem value="">
                                    <em>{t("select")}</em>
                                  </MenuItem>
                                  {filter.options.map((option, index) => (
                                    <MenuItem
                                      key={filter.getValue(option)}
                                      value={filter.getValue(option)}
                                    >
                                      {filter.getLabel(option)}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                              {filter.type == "CUSTOM" && (
                                <>
                                  {filter.createComponent(
                                    filterElements,
                                    handleChangeFilter
                                  )}
                                </>
                              )}
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                      <CardContent className="search-clear-buttons">
                        <Button onClick={handleClear}>{t("clean")}</Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="MuiButton-containedPrimary"
                        >
                          {t("search")}
                        </Button>
                      </CardContent>
                    </Form>
                  );
                }}
              </Formik>
            </AccordionDetails>
          </Accordion>

          <Grid
            container
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p className="resultadosBusqueda">
              {t("title-search-result").replace(":items", total || 0)}
            </p>
            <Link className="float-right" component="button" onClick={exportar}>
              {t("export")}
            </Link>
          </Grid>

          {(items || isLoading) && (
            <Box>
              <Card>
                <CardContent>
                  {isLoading && <Loader />}
                  {!isLoading && items && items.length == 0 && (
                    <div>{t("no_results")}</div>
                  )}
                  {!isLoading && items && items.length > 0 && total && (
                    <SimpleTable
                      staticColumns={staticColumns}
                      items={items}
                      editEnabled={editEnabled}
                      viewEnabled={viewEnabled}
                      deleteEnabled={deleteEnabled}
                      historyEnabled={historyEnabled}
                      edit={editMethod}
                      editLink={editLink}
                      selectForDelete={selectForDelete}
                      selectForHistory={selectForHistory}
                      total={total}
                      rowsPerPage={rowsPerPage}
                      t={t}
                      page={page}
                      handleChangePage={handleChangePage}
                      handleChangeRowsPerPage={handleChangeRowsPerPage}
                      handleOrderBy={handleOrderBy}
                      orderDirection={orderDirection}
                      valueToOrderBy={valueToOrderBy}
                      idColumn={idColumn}
                    ></SimpleTable>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </Grid>
      </Grid>

      {/*Historico */}
      {isShowHistory && (
        <HistoricoDialog
          columns={staticColumns}
          entity={editingObject}
          showHistory={isShowHistory}
          setShowHistory={setIsShowHistory}
          i18next={t}
          keyEntity={idColumn}
          urlBase={basePath}
          apiClient={api}
          lng={lng}
        />
      )}

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

SearchTable.propTypes = {
  staticColumns: PropTypes.any.isRequired,
  filterColumns: PropTypes.any.isRequired,
  api: PropTypes.any.isRequired,
  t: PropTypes.any.isRequired,
  lng: PropTypes.any.isRequired,
  basePath: PropTypes.any.isRequired,
  searchTotalPath: PropTypes.any,
  searchPath: PropTypes.any,
  deletePath: PropTypes.any,
  editLink: PropTypes.any,
  editMethod: PropTypes.func,
  idColumn: PropTypes.any,
  rowsPerPage: PropTypes.any,
  editEnabled: PropTypes.any,
  deleteEnabled: PropTypes.any,
  searchOnInit: PropTypes.any,
};

export default SearchTable;
