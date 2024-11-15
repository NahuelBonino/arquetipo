"use client";
import Axios from "axios";
import { setupCache, buildWebStorage } from "axios-cache-interceptor";

let axios = Axios.create({
  headers: { Accept: "application/json" },
  timeout: 1000 * 30,
});

if (typeof document != "undefined") {
  axios = setupCache(axios, {
    storage: buildWebStorage(localStorage, "axios-cache:"),
    ttl: 30 * 60 * 1000,
    methods: ["get"],
  });
}

export default (
  endpoint,
  {
    method = "GET",
    body: data = undefined,
    formData = false,
    params = {},
    headers = {},
    accept = "application/json",
  } = {}
) => {
  var requestHeaders = {};

  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (formData) headers["Content-Type"] = "";

  Object.keys(headers).forEach((key) => (requestHeaders[key] = headers[key]));

  return axios
    .request({
      method,
      url: endpoint,
      headers: requestHeaders,
      params,
      timeout: 1000 * 30,
      data: formData ? data : JSON.stringify(data),
    })
    .then(async (res) => {
      const response = res.data;
      return {
        status: res.status >= 200 && res.status <= 299,
        code: res.status,
        response,
      };
    })
    .catch((error) => {
      return { status: false, code: 500, response: error.response?.data };
    });
};
