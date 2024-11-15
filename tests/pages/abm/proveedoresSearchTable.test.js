import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act
} from "@testing-library/react";
import "@testing-library/jest-dom";
import ProveedoresSearchTable from "@/app/[lng]/p/abm/proveedoresSearchTable/page.js";
import useMensaje from "@/hooks/useMensaje.js";

const useRouter = jest.spyOn(require("next/navigation"), "useRouter");

const i18nInstanceForTest = {
  t: (key) => key,
  i18n: {
    language: "es",
    changeLanguage: () => {},
  },
};

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      pathname: "",
      push: null,
      back: null,
      replace: null,
    };
  },
}));

jest.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
  serverSideTranslations: () => ({}),
  withTranslation: () => (Component) => (props) =>
    <Component t={() => ""} {...props} />,
}));

jest.mock(
  "@/layouts/General.js",
  () =>
    ({ children, requiredOperation, showLoader, ...rest }) => {
      const React = require("react");
      const { Fragment, Grid } = React;
      return (
        <Fragment>
          <div>{children}</div>
        </Fragment>
      );
    }
);

jest.mock("@/components/CsvBulkUpload/CsvBulkUpload", () => () => {
  return <div></div>;
});

jest.mock("@/hooks/useMensaje.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/lib/apiclients/apiClient.js");

describe("Proveedores SearchTable", () => {
  let component;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const push = jest.fn();
    const back = jest.fn();
    const replace = jest.fn();

    useRouter.mockImplementation(() => ({
      query: { pathname: "/es/p/abm/proveedoresSearchTable" },
      push,
      back,
      replace,
    }));

    fakeMessageCleanUp = jest.fn();
    useMensaje.mockReturnValue({
      addMessage: jest.fn(),
      MessageComponent: () => <div data-testid="mocked-child"></div>,
      messageCleanUp: fakeMessageCleanUp,
    });

    component = render(<ProveedoresSearchTable t={(p) => p} />);
  });

  test("render Component ", async () => {
    screen.debug(component.container)
    expect(screen.getByText("proveedores")).toBeInTheDocument();
    expect(screen.getByText("filters")).toBeInTheDocument();
    expect(screen.getAllByText("name")[0]).toBeInTheDocument();
  });

});
