import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act
} from "@testing-library/react";
import "@testing-library/jest-dom";
import moment from "moment";
import apiSeguridadClient from "@/lib/apiclients/apiSeguridadClient.js";
import Profile from "@/pages/p/perfil";
import useMensaje from "@/hooks/useMensaje.js";
import {
  responseDataTotalOfRegisters,
  responseDataCurrentUser,
  responseDataLastAccess,
} from "./fakeData/PerfilTestFakeData.js";

jest.mock("next/router", () => ({
  useRouter() {
    return {
      pathname: "",
      push: null,
      back: null,
      replace: null,
    };
  },
}));

const i18nInstanceForTest = {
  t: (key) => key,
  i18n: {
    language: "es",
    changeLanguage: () => {},
  },
};

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

jest.mock("@/components/Loader/loader", () => () => {
  return <div>Loader</div>;
});

jest.mock("@/hooks/useMensaje.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const useRouter = jest.spyOn(require("next/navigation"), "useRouter");

jest.mock("@/lib/apiclients/apiSeguridadClient.js");

describe("Perfil", () => {
  let component;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const push = jest.fn();
    const back = jest.fn();
    const replace = jest.fn();

    useRouter.mockImplementation(() => ({
      query: { pathname: "/es/p/perfil" },
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

    apiSeguridadClient.get.mockResolvedValueOnce(responseDataCurrentUser);
    apiSeguridadClient.get.mockResolvedValueOnce(responseDataTotalOfRegisters);
    apiSeguridadClient.get.mockResolvedValueOnce(responseDataLastAccess);

    component = render(<Profile t={(p) => p} />);

    expect(screen.getByText("profile")).toBeInTheDocument();
    expect(screen.getByText("Loader")).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  test("render Perfil", async () => {
    await waitFor(() => {
      expect(screen.getByText("personal_information")).toBeInTheDocument();
      expect(screen.getByText("email")).toBeInTheDocument();
      expect(screen.getByText(responseDataCurrentUser.usuEmail)).toBeInTheDocument();
      expect(screen.getByText("first_name")).toBeInTheDocument();
      expect(screen.getByText(responseDataCurrentUser.usuPrimerNombre)).toBeInTheDocument();
      expect(screen.getByText("second_name")).toBeInTheDocument();
      expect(screen.getByText(responseDataCurrentUser.usuSegundoNombre)).toBeInTheDocument();
      expect(screen.getByText("first_surname")).toBeInTheDocument();
      expect(screen.getByText(responseDataCurrentUser.usuPrimerApellido)).toBeInTheDocument();
      expect(screen.getByText("second_surname")).toBeInTheDocument();
      expect(screen.getByText(responseDataCurrentUser.usuSegundoApellido)).toBeInTheDocument();
      expect(screen.getByText("document")).toBeInTheDocument();
      expect(screen.getByText(responseDataCurrentUser.usuDocument)).toBeInTheDocument();

      expect(screen.getByText("preferences")).toBeInTheDocument();

      const audFecha = moment(responseDataLastAccess.audFecha).format(
        "DD/MM/yyyy HH:mm"
      );
      expect(screen.getByText("last_access")).toBeInTheDocument();
      expect(screen.getByText(audFecha)).toBeInTheDocument();
      expect(screen.getByText("ip")).toBeInTheDocument();
      expect(screen.getByText(responseDataLastAccess.audIp)).toBeInTheDocument();
    });
  });

  test("button update_profile should be clickeable - save and cancel buttons should be clickeable",() => {
    const updateProfileButton = screen.getByText("update_profile");
    expect(updateProfileButton).toBeInTheDocument();
    fireEvent.click(updateProfileButton);
    expect(fakeMessageCleanUp).toHaveBeenCalledTimes(1);

    const formEditTest = screen.getByTestId("formEditTest")
    expect(formEditTest).toBeInTheDocument();
    
    //save
    const saveButton = screen.getByText("save");
    expect(saveButton).toBeInTheDocument();
    //cancel
    const cancelButton = screen.getByText("cancel");
    expect(cancelButton).toBeInTheDocument();
  });

  //agregar interaccion con botones save (agregando datos en los campos) y cancelar

});
