/* eslint-disable no-use-before-define */
import { Fragment } from "react";
import Link from "next/link";
import PropTypes from 'prop-types';
import { get } from "lodash";
import {
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";

const SimpleTable = ({
  idColumn = "id",
  staticColumns,
  handleOrderBy,
  valueToOrderBy,
  orderDirection,
  t,
  actionComponents,
  editEnabled,
  viewEnabled,
  historyEnabled,
  deleteEnabled,
  items,
  editLink,
  edit,
  selectForDelete,
  selectForHistory,
  total,
  rowsPerPage,
  page,
  handleChangePage,
  handleChangeRowsPerPage
}) => {

  return (
    <Fragment>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {staticColumns.map((column, index) => (
                <TableCell key={index}>
                  {handleOrderBy && column.id ? (
                    <TableSortLabel
                      active={valueToOrderBy == column.id}
                      direction={valueToOrderBy == column.id ? orderDirection : "asc"}
                      onClick={() => handleOrderBy(column.sortBy ?? column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </TableCell>
              ))}

              {actionComponents?.map((comp, index) => (
                <TableCell key={"accCom" + index}>{comp.label}</TableCell>
              ))}

              {editEnabled && <TableCell><span> {t("edit_header")}</span></TableCell>}
              {viewEnabled && <TableCell><span>{t("view_header")}</span></TableCell>}
              {historyEnabled && <TableCell ><span>{t("history_header")}</span></TableCell>}
              {deleteEnabled && <TableCell ><span>{t("delete_header")}</span></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody data-testid="tableBody-test">
            {items.map((row, index) => {
              return (
                <TableRow hover tabIndex={-1} key={index}>
                  {staticColumns.map((column, indexCol) => {
                    let value = get(row, column.id);
                    return (
                      <TableCell key={`${indexCol}${index}`}>
                        {!!column.format ? column.format(row) : value}
                      </TableCell>
                    );
                  })}

                  {actionComponents?.map((comp, indexCol) => {
                    
                    <TableCell key={`${index}${indexCol}`}>{comp.createComponent(row)}</TableCell>
                  })}

                  {editEnabled && (
                    <TableCell>
                      {editLink ? (
                        <Link
                          href={`${editLink}?${idColumn}=${row[idColumn]
                            }`}
                        >
                            <Tooltip title={t("edit")}>
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                        </Link>
                      ) : (
                        <Tooltip title={t("edit")}>
                          <IconButton
                            data-testid = "button-test"
                            size="small"
                            onClick={() => edit?.(row, false)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                  {viewEnabled && (
                    <TableCell>
                      {editLink ? (
                        <Link    
                          aria-label="link"                  
                          href={`${editLink}?${idColumn}=${row[idColumn]}`}
                        >
                            <Tooltip title={t("view")}>
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                        </Link>
                      ) : (
                        <Tooltip title={t("view")}>
                          <IconButton
                            size="small"
                            onClick={() => edit(row, true)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                  {historyEnabled && (
                    <TableCell>
                      <Tooltip title={t("viewHistory")}>
                        <IconButton
                          size="small"
                          onClick={() => selectForHistory(row)}
                        >
                          <AccessTimeIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                  {deleteEnabled && (
                    <TableCell>
                      <Tooltip title={t("delete")}>
                        <IconButton
                          size="small"
                          onClick={() => selectForDelete(row)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        data-testid="pagination-test"
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Fragment>
  );
};


SimpleTable.propTypes = {
  title: PropTypes.string,
};

export default SimpleTable;
