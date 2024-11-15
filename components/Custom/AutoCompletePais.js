/* eslint-disable no-use-before-define */
import { Fragment } from "react";
import Autocomplete from "@mui/lab/Autocomplete";
import TextField from "@mui/material/TextField";

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
function countryToFlag(isoCode) {
  return typeof String.fromCodePoint !== "undefined"
    ? isoCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(char.charCodeAt(0) + 127397)
      )
    : isoCode;
}

const AutocompletePais = () => {
  return (
    <Autocomplete
      id="country-select-demo"
      options={countries}
      autoHighlight
      getOptionLabel={(option) => option.label}
      renderOption={(option) => (
        <Fragment>
          <span>{countryToFlag(option.code)}</span>
          {option.label} ({option.code})
        </Fragment>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Seleccione un país"
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-password", // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

// From https://bitbucket.org/atlassian/atlaskit-mk-2/raw/4ad0e56649c3e6c973e226b7efaeb28cb240ccb0/packages/core/select/src/data/countries.js
const countries = [{ code: "UY", label: "Uruguay", phone: "598" }];


export default AutocompletePais;
