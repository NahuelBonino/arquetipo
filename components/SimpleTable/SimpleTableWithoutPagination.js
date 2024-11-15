/* eslint-disable no-use-before-define */
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Tooltip, } from "@mui/material";
import { get } from "lodash";

const SimpleTableWithoutPagination = (props) => {
  return (
    <TableContainer>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {props.staticColumns.map((column, index) => (
              <TableCell key={index}>
                {props.handleOrderBy && column.id ? (
                  <TableSortLabel
                    active={props.valueToOrderBy == column.id}
                    direction={
                      props.valueToOrderBy == column.id
                        ? props.orderDirection
                        : "asc"
                    }
                    onClick={() => {
                      props.handleOrderBy(column.id);
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  <>{column.label}</>
                )}
              </TableCell>
            ))}

            {props.editEnabled && <TableCell></TableCell>}
            {props.viewEnabled && <TableCell></TableCell>}
            {props.deleteEnabled && <TableCell></TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.items.map((row, index) => {
            return (
              <TableRow hover tabIndex={-1} key={index}>
                {props.staticColumns.map((column, indexCol) => {
                  const value = get(row, column.id);
                  return (
                    <TableCell key={`${indexCol}${index}`}>
                      {!!column.format ? column.format(row) : value}
                    </TableCell>
                  );
                })}

                {props.editEnabled && (
                  <TableCell>
                    <Tooltip title={props.t("edit")}>
                      <IconButton
                        size="small"
                        onClick={() => props.edit(row, false)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
                {props.viewEnabled && (
                  <TableCell>
                    <Tooltip title={props.t("view")}>
                      <IconButton
                        size="small"
                        onClick={() => props.edit(row, true)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
                {props.deleteEnabled && (
                  <TableCell>
                    <Tooltip title={props.t("delete")}>
                      <IconButton
                        size="small"
                        onClick={() => props.selectForDelete(row)}
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
  );
};

export default SimpleTableWithoutPagination;
