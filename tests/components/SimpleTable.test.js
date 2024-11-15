import SimpleTable from "@/components/SimpleTable/SimpleTable";
import { fireEvent, render, screen } from "@/tests/testUtils";
import "@testing-library/jest-dom";
import { get } from "lodash";
import {
  actionComponents,
  defaultProps,
  defaultPropsWithEditLink,
  fakeRowsPerPage,
  fakeStaticColumns,
  fakeTotal,
} from "./fakeData/SimpleTableFakeData";

describe("SimpleTable with edit enable without edit link", () => {
  let component;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    component = render(
      <SimpleTable
        staticColumns={defaultProps.staticColumns}
        items={defaultProps.items}
        editEnabled={defaultProps.editEnabled}
        viewEnabled={defaultProps.viewEnabled}
        deleteEnabled={defaultProps.deleteEnabled}
        edit={defaultProps.edit}
        editLink={defaultProps.editLink}
        selectForDelete={defaultProps.selectForDelete}
        total={defaultProps.total}
        rowsPerPage={defaultProps.rowsPerPage}
        t={defaultProps.t}
        page={defaultProps.page}
        handleChangePage={defaultProps.handleChangePage}
        handleChangeRowsPerPage={defaultProps.handleChangeRowsPerPage}
        handleOrderBy={defaultProps.handleOrderBy}
        orderDirection={defaultProps.orderDirection}
        actionComponents={actionComponents}
      />
    );
  });

  test("ActionComponent should be clickeable", () => {
    //screen.debug(component.container)
    const elem = screen.getByText(actionComponents[0].label);
    expect(actionComponents[0].createComponent).toHaveBeenCalledTimes(
      fakeTotal
    );
  });

  test("Render SimpleTable component", () => {
    for (let i = 0; i < 4; i++) {
      expect(screen.getByText(fakeStaticColumns[i].label)).toBeInTheDocument();
    }
    defaultProps.items.forEach((fkitem) => {
      expect(
        screen.getByText(get(fkitem, fakeStaticColumns[0].id))
      ).toBeInTheDocument();
      expect(
        screen.getByText(get(fkitem, fakeStaticColumns[1].id))
      ).toBeInTheDocument();
      expect(
        screen.getByText(get(fkitem, fakeStaticColumns[2].id))
      ).toBeInTheDocument();
      expect(
        screen.getByText(get(fkitem, fakeStaticColumns[3].id))
      ).toBeInTheDocument();
    });
  });

  test("Render TablePagination component", () => {
    const paginationText =
      fakeTotal > fakeRowsPerPage
        ? `1–${fakeRowsPerPage} of ${fakeTotal}`
        : `1–${fakeTotal} of ${fakeTotal}`;
    expect(component.getByText(paginationText)).toBeInTheDocument();
    expect(component.getByText(fakeRowsPerPage)).toBeInTheDocument();
    expect(component.getByText("Rows per page:")).toBeInTheDocument();
  });

  test("Edit button should be clickeable", () => {
    const buttons = screen.getAllByRole("button", { name: "edit" });
    buttons.forEach((button) => {
      fireEvent.click(button);
    });
    expect(defaultProps.edit).toHaveBeenCalledTimes(fakeTotal);
  });

  test("View button should be clickeable", () => {
    const buttons = screen.getAllByRole("button", { name: "view" });
    buttons.forEach((button) => {
      fireEvent.click(button);
    });
    expect(defaultProps.edit).toHaveBeenCalledTimes(fakeTotal);
  });

  test("Delete button should be clickeable", () => {
    //screen.debug(component.getAllByTestId("tableBody-test"))
    const deleteButtons = screen.getAllByTestId("DeleteIcon");
    deleteButtons.forEach((deleteButton) => {
      fireEvent.click(deleteButton);
    });
    expect(defaultProps.selectForDelete).toHaveBeenCalledTimes(fakeTotal);
  });

  test("Down arrow button should be clickeable", () => {
    const columnButtons = screen.getAllByTestId("ArrowDownwardIcon");
    columnButtons.forEach((columnButton) => {
      fireEvent.click(columnButton);
    });
    expect(defaultProps.handleOrderBy).toHaveBeenCalledTimes(4);
  });
});

describe("SimpleTable with edit link", () => {
  let component;
  let defaultProps = defaultPropsWithEditLink;

  beforeEach(async () => {
    component = render(
      <SimpleTable
        staticColumns={defaultProps.staticColumns}
        items={defaultProps.items}
        editEnabled={defaultProps.editEnabled}
        viewEnabled={defaultProps.viewEnabled}
        deleteEnabled={defaultProps.deleteEnabled}
        edit={defaultProps.edit}
        editLink={defaultProps.editLink}
        selectForDelete={defaultProps.selectForDelete}
        total={defaultProps.total}
        rowsPerPage={defaultProps.rowsPerPage}
        t={defaultProps.t}
        page={defaultProps.page}
        handleChangePage={defaultProps.handleChangePage}
        handleChangeRowsPerPage={defaultProps.handleChangeRowsPerPage}
        handleOrderBy={defaultProps.handleOrderBy}
        orderDirection={defaultProps.orderDirection}
        actionComponents={actionComponents}
      />
    );
  });

  test("Render edit link", () => {
    for (let i = 0; i < fakeTotal; i++) {
      const linkEdit = screen.getAllByRole("link")[i];
      expect(linkEdit).toBeInTheDocument();
    }
  });
});
