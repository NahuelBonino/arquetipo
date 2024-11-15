import BackendConnectionError from "@/types/BackendConnectionError";
import BusinessError from "@/types/BusinessError";
import axios from "axios";
import { setup } from "axios-cache-adapter";
import localforage from "localforage";
import memoryDriver from "localforage-memoryStorageDriver";

const jsog = require("@/lib/utils/JSOG");

localforage.defineDriver(memoryDriver);
const forageStore = localforage.createInstance({
  driver: [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE,
    memoryDriver._driver,
  ],
  name: "arquetipo-cache",
});

const blobToData = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result)
    reader.readAsText(blob);
  })
}

const handleError = async (error) => {
  if (error != null && error.response != null) {
    if (error.response.status === 401) {
      //Token expirado. Redirección a login
      apiClient.defaults.headers.common["Authorization"] = "";
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("operations");
      window.location.href = "/auth/login";
    } else if (error.response.status === 422) {
      if (error.request.responseType === 'blob' && error.response.data instanceof Blob) {
        throw new BusinessError('BusinessError', JSON.parse(await blobToData(error.response.data)));
      } else {
        throw new BusinessError('BusinessError', error.response.data);
      }
    } else if (error.response.status === 403) {
      throw new BusinessError("bse", {
        errores: [{ mensaje: "ERROR_ACCESO_DENEGADO" }],
      });
    } else if (error.response.status === 404) {
      throw new BusinessError("bse", {
        errores: [{ mensaje: "ERROR_NOT_FOUND" }],
      });
    } else {
      throw new BusinessError("bse", {
        errores: [{ mensaje: "ERROR_GENERAL" }],
      });
    }
  } else if (error != null && error.request) {
    //no se llego al servidor
    throw new BackendConnectionError(error.message, error.code);
  } else {
    throw new BusinessError("bse", {
      errores: [{ mensaje: "ERROR_GENERAL" }],
    })
  };
};

const fileRequestInterceptor = async (config) => {
  let baseURL = await apiVariablesClient.get('/api/variable/' + config.ENV_VAR);
  config.baseURL = baseURL;
  const token = localStorage.getItem("token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
}
const defaultRequestInterceptor = async (config) => {
  console.log("AXIOS")
  if (config.data != null) {
    config.data = jsog.encode(config.data);
  }
  let baseURL = await apiVariablesClient.get('/api/variable/' + config.ENV_VAR);
  config.baseURL = baseURL;
  const token = localStorage.getItem("token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
}


const apiVariablesClient = setup({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
  cache: {
    maxAge: 5 * 60 * 1000,
    exclude: {
      query: false,
    },
    store: forageStore,
  },
});

apiVariablesClient.interceptors.response.use(response => response.data, async error => await handleError(error));


const apiClient = axios.create({
  ENV_VAR: 'BACKEND_API_URL',
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(defaultRequestInterceptor);

apiClient.interceptors.response.use(response => jsog.decode(response.data), async error => await handleError(error));



const apiSeguridadClient = axios.create({
  ENV_VAR: 'SEGURIDAD_BACKEND_API_URL',
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiSeguridadClient?.interceptors.request.use(defaultRequestInterceptor);
apiSeguridadClient.interceptors.response.use(response => jsog.decode(response.data), async error => await handleError(error));


const apiFileClient = axios.create({
  ENV_VAR: 'SEGURIDAD_BACKEND_API_URL',
  headers: {
    'Content-Type': 'application/octet-stream'
  },
  timeout: 80000
});

apiFileClient.interceptors.request.use(fileRequestInterceptor);
apiFileClient.interceptors.response.use(response => response.data, async error => await handleError(error));



const apiFileDownload = axios.create({
  ENV_VAR: 'SEGURIDAD_BACKEND_API_URL',
  headers: { 'Content-Type': 'application/json' },
  timeout: 80000
});

apiFileDownload.interceptors.request.use(defaultRequestInterceptor);
apiFileDownload.interceptors.response.use(response => response.data, async error => await handleError(error));




const apiCacheClient = setup({
  ENV_VAR: 'BACKEND_API_URL',
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
  cache: {
    maxAge: 5 * 60 * 1000,
    exclude: {
      query: false,
    },
    store: forageStore,
  },
});

apiCacheClient.interceptors.request.use(defaultRequestInterceptor);
apiCacheClient.interceptors.response.use(response => jsog.decode(response.data), async error => await handleError(error));


export { apiCacheClient, apiClient, apiFileClient, apiFileDownload, apiSeguridadClient };

