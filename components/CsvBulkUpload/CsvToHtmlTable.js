import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const CsvToHtmlTable = ({
  data,
  result,
  hasHeader,
  tableColumnClassName,
  rowKey,
  colKey,
  renderCell,
  t,
}) => {
  const rowsWithColumns = [...data];
  let headerRow = undefined;
  if (hasHeader) {
    headerRow = rowsWithColumns.splice(0, 1)[0];
  }

  const renderTableHeader = (row) => {
    if (row && row.map) {
      return (
        <TableHead>
          <TableRow>
            {row.map((column, i) => (
              <TableCell key={i}>{column}</TableCell>
            ))}

            {result && <TableCell key={"result"}>{t("result")}</TableCell>}
          </TableRow>
        </TableHead>
      );
    }
  };

  const renderTableBody = (rows) => {
    if (rows && rows.map) {
      return (
        <TableBody>
          {rows.map((row, rowIdx) => (
            <TableRow
              hover
              tabIndex={-1}
              className={
                result && result[rowIdx] && result[rowIdx][1] == 1
                  ? "bulkTableRowFail"
                  : "bulkTableRow"
              }
              key={typeof rowKey === "function" ? rowKey(row, rowIdx) : rowIdx}
            >
              {row.map &&
                row.map((column, colIdx) => (
                  <TableCell
                    className={tableColumnClassName}
                    key={
                      typeof rowKey === "function"
                        ? colKey(row, colIdx, rowIdx)
                        : column[colKey]
                    }
                  >
                    {typeof renderCell === "function"
                      ? renderCell(column, colIdx, rowIdx)
                      : column}
                  </TableCell>
                ))}
              {result && result[rowIdx] ? (
                <TableCell>{t("messages:" + result[rowIdx][2])}</TableCell>
              ) : (
                <TableCell></TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      );
    }
  };

  return (
    <TableContainer>
      <Table stickyHeader aria-label="sticky table">
        {renderTableHeader(headerRow)}
        {renderTableBody(rowsWithColumns)}
      </Table>
    </TableContainer>
  );
};

CsvToHtmlTable.defaultProps = {
  data: "",
  rowKey: (row, rowIdx) => `row-${rowIdx}`,
  colKey: (col, colIdx, rowIdx) => `col-${colIdx}`,
  hasHeader: true,
  csvDelimiter: "\t",
  tableClassName: "",
  tableRowClassName: "",
  tableColumnClassName: "",
};

export default CsvToHtmlTable;
