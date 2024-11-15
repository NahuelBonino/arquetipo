import { apiSeguridadClient } from "@/lib/apiClient";
import BusinessError from "@/types/BusinessError";

export const login = async (params, setCookie, removeCookie) => {
  try {

    let options = {
      audience: "main-frontend",
      incluirOperaciones: true,
    };
    let method = "basic";

    options = {
      ...options,
      ...params,
    };

    const response = await apiSeguridadClient.post("/v1/auth/" + method, options);

    if (!response) {
      throw new BusinessError("bse", {
        errores: [{ mensaje: "LOGIN_REINTENTAR" }],
      });
    }

    const { jwt, operaciones } = response;

    const tokenData = JSON.parse(Buffer.from(jwt.split(".")[1], 'base64'));
    await setUserInfoInLocalStorage(jwt, tokenData, operaciones);

    setCookie("pageOps", operaciones, { path: "/" });
    setCookie("jwt", jwt, { path: "/" });

    let ambitos = await apiSeguridadClient.get("/v1/usuarios/me/ambitos");
    localStorage.setItem("ambitos", JSON.stringify(ambitos));
   
    if (ambitos != null && tokenData.context) {
      let contextos = await apiSeguridadClient.get('/v1/usuarios/me/ambitos/' + ambitos[0] + '/contextos');
      localStorage.setItem("contextos", JSON.stringify(contextos));
    } else {
      localStorage.removeItem("contextos");
    }

  } catch (error) {
    clearUserInfoInLocalStorage();
    clearUserInfoInCookies(removeCookie);
    throw error;
  }
};

export const changeDomain = async (params, setCookie, removeCookie) => {
  try {
    let options = {
      incluirOperaciones: true,
    };

    options = {
      ...options,
      ...params,
    };
    const response = await apiSeguridadClient.post(
      "/v1/usuarios/me/cambiardominio",
      null,
      { params: options }
    );

    if (!response) {
      throw new BusinessError("bse", {
        errores: [{ mensaje: "LOGIN_REINTENTAR" }],
      });
    }

    const { jwt, operaciones } = response;
    const tokenData = JSON.parse(Buffer.from(jwt.split(".")[1], 'base64'));

    await setUserInfoInLocalStorage(jwt, tokenData, operaciones);

    setCookie("pageOps", operaciones, { path: "/" });
    setCookie("jwt", jwt, { path: "/" });

  } catch (error) {
    clearUserInfoInLocalStorage();
    clearUserInfoInCookies(removeCookie);
    throw error;
  }
};

const setUserInfoInLocalStorage = async (jwt, tokenData, operaciones) => {

  localStorage.setItem("token", jwt);
  localStorage.setItem("user", tokenData.email);
  localStorage.setItem(
    "userName",
    tokenData.nombre != "null null" ? tokenData.nombre : ""
  );
  localStorage.setItem("ambito", tokenData.ambit);
  if (tokenData.context) {
    localStorage.setItem("contexto", tokenData.context);
  }
  operaciones.push("AUTH");
  localStorage.setItem("operations", JSON.stringify(operaciones));
};

export const clearUserInfoInLocalStorage = () => {
  localStorage.removeItem("operations");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("ambito");
  localStorage.removeItem("contexto");
};

export const clearUserInfoInCookies = (removeCookie) => {
  removeCookie("pageOps", { path: '/' });
  removeCookie("jwt", { path: '/' });
};
