import { Fragment } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { get, isEmpty } from "lodash";
import { CountryRegionData } from "react-country-region-selector";
import { Autocomplete, Grid, TextField } from "@mui/material";
import { getCountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import { MuiTelInput } from 'mui-tel-input'

const postalCodes = require("postal-codes-js");

export const validateAddress = (address, errors, t) => {
  if (isEmpty(address.addAddress1)) {
    errors.addAddress1 = t("required");
  }

  if (isEmpty(address.addCountryIso2)) {
    errors.addCountry = t("required");
  }

  if (isEmpty(address.addStateCode)) {
    errors.addStateData = t("required");
  }

  if (isEmpty(address.addCity)) {
    errors.addCity = t("required");
  }

  if (isEmpty(address.addPhone)) {
    errors.addPhone = t("required");
  } else if ((isValidPhoneNumber(address.addPhone, address.addCountryIso2) !== true)) {
    errors.addPhone = t("invalid");

  }

  if (isEmpty(address.addPostalCode)) {
    errors.addPostalCode = t("required");
  } else {
    let validPostalCode = postalCodes.validate(
      address.addCountryIso2,
      address.addPostalCode
    );

    if (!validPostalCode) {
      errors.addPostalCode = t("invalid");
    }
  }
};

const Address = (props) => {
  const getRegions = (country) => {
    if (!country) {
      return [];
    }
    return country[2].split("|").map((regionPair) => {
      return regionPair.split("~");
    });
  };

  let navigation = props.navigation;
  let values = get(props.values, navigation);
  let touched = props.touched;

  if (get(props.touched, navigation)) {
    touched = get(props.touched, navigation);
  }
  let errors = props.errors;
  if (get(props.errors, navigation)) {
    errors = get(props.errors, navigation);
  }

  let handleChange = props.handleChange;
  let handleBlur = props.handleBlur;
  let t = props.t;
  let variant = props.variantTextField;
  let xs = props.xs;
  let sm = props.sm;
  let readOnly = props.readOnly ? props.readOnly : false;

  if (!values.addAddress1) {
    values.addAddress1 = "";
  }
  if (!values.addAddress2) {
    values.addAddress2 = "";
  }
  if (!values.addAddress3) {
    values.addAddress3 = "";
  }
  if (!values.addCountry) {
    values.addCountry = "";
  }
  if (!values.addStateCode) {
    values.addStateCode = "";
  }
  if (!values.addCity) {
    values.addCity = "";
  }
  if (!values.addPostalCode) {
    values.addPostalCode = "";
  }
  if (!values.addPhone) {
    values.addPhone = '+598';
  }
  if (!values.addNotes) {
    values.addNotes = "";
  }
  if (!values.addCountry && values.addCountryIso2) {
    values.addCountry = CountryRegionData.find(
      (option) => option[1] === values.addCountryIso2
    );
  }
  if (!values.addStateData && values.addStateCode && values.addCountryIso2) {
    values.addStateData = getRegions(values.addCountry).find(
      (r) => r[1] === values.addStateCode
    );
  }
  if (!values.addStateData) {
    values.addStateData = "";
  }
  if (!values.addCountry) {
    values.addCountry = "";
  }


  const setAddressFieldValue = (a, b) => {
    props.setFieldValue(navigation + "." + a, b);
  };

  return (
    <Fragment>
      <Grid item xs={xs} sm={sm}>
        <TextField
          variant={variant}
          fullWidth
          autoComplete="off"
          size="small"
          value={values.addAddress1}
          onChange={handleChange}
          onBlur={handleBlur}
          name={navigation + ".addAddress1"}
          label={t("addAddress1")}
          inputProps={{
            readOnly: readOnly,
          }}
          error={errors.addAddress1 && touched.addAddress1}
          helperText={
            errors.addAddress1 && touched.addAddress1 ? errors.addAddress1 : ""
          }
        />
      </Grid>
      <Grid item xs={xs} sm={sm}>
        <TextField
          variant={variant}
          fullWidth
          autoComplete="off"
          size="small"
          value={values.addAddress2}
          onChange={handleChange}
          onBlur={handleBlur}
          name={navigation + ".addAddress2"}
          label={t("addAddress2")}
          inputProps={{
            readOnly: readOnly,
          }}
          error={errors.addAddress2 && touched.addAddress2}
          helperText={
            errors.addAddress2 && touched.addAddress2 ? errors.addAddress2 : ""
          }
        />
      </Grid>
      <Grid item xs={xs} sm={sm}>
        <TextField
          variant={variant}
          fullWidth
          autoComplete="off"
          size="small"
          value={values.addAddress3}
          onChange={handleChange}
          onBlur={handleBlur}
          name={navigation + ".addAddress3"}
          label={t("addAddress3")}
          inputProps={{
            readOnly: readOnly,
          }}
          error={errors.addAddress3 && touched.addAddress3}
          helperText={
            errors.addAddress3 && touched.addAddress3 ? errors.addAddress3 : ""
          }
        />
      </Grid>

      <Grid item xs={xs} sm={sm}>
        <Autocomplete
          id={navigation + ".addCountry"}
          name={navigation + ".addCountry"}
          options={CountryRegionData}
          value={values.addCountry}
          isOptionEqualToValue={(option, value) => option[1] === value[1]}
          getOptionLabel={(option) => {
            return option ? option[0] : "";
          }}
          getOptionDisabled={(option) => readOnly}
          disableClearable={readOnly}
          autoSelect={true}
          onChange={(evt, value) => {
            if (value) {
              props.setFieldValue(navigation + ".addCountry", value);
              setAddressFieldValue("addStateCode", "");
              setAddressFieldValue("addState", "");
              setAddressFieldValue("addStateData", "");
              setAddressFieldValue("addCountryIso2", value[1]);
              if (getCountryCallingCode(value[1])) {
                setAddressFieldValue(
                  "addPhone",
                  "+" + getCountryCallingCode(value[1])
                );
              }
            } else {
              props.setFieldValue(navigation + ".addCountry", "");
              setAddressFieldValue("addStateCode", "");
              setAddressFieldValue("addState", "");
              setAddressFieldValue("addStateData", "");
              setAddressFieldValue("addCountryIso2", "");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("addCountry")}
              variant={variant}
              size="small"
              inputProps={{ ...params.inputProps, readOnly: readOnly }}
              error={errors.addCountry && touched.addCountry}
              helperText={
                errors.addCountry && touched.addCountry ? errors.addCountry : ""
              }
            />
          )}
        />
      </Grid>
      <Grid item xs={xs} sm={sm}>
        <Autocomplete
          id={navigation + ".addStateData"}
          name={navigation + ".addStateData"}
          options={getRegions(values.addCountry)}
          value={values.addStateData}
          isOptionEqualToValue={(option, value) => option[1] === value[1]}
          getOptionLabel={(option) => {
            return option ? option[0] : "";
          }}
          getOptionDisabled={(option) => readOnly}
          disableClearable={readOnly}
          autoSelect={true}
          onChange={(evt, value) => {
            if (value) {
              props.setFieldValue(navigation + ".addStateData", value);
              setAddressFieldValue(
                "addState",
                getRegions(values.addCountry).find((r) => r[1] === value[1])[0]
              );
              setAddressFieldValue("addStateCode", value[1]);
            } else {
              props.setFieldValue(navigation + ".addStateData", "");
              setAddressFieldValue("addState", "");
              setAddressFieldValue("addStateCode", "");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("addState")}
              variant={variant}
              inputProps={{ ...params.inputProps, readOnly: readOnly }}
              size="small"
              error={errors.addStateData && touched.addStateData}
              helperText={
                errors.addStateData && touched.addStateData
                  ? errors.addStateData
                  : ""
              }
            />
          )}
        />
      </Grid>
      <Grid item xs={xs} sm={sm}>
        <TextField
          variant={variant}
          fullWidth
          autoComplete="off"
          size="small"
          value={values.addCity}
          onChange={handleChange}
          onBlur={handleBlur}
          name={navigation + ".addCity"}
          label={t("addCity")}
          inputProps={{
            readOnly: readOnly,
          }}
          error={errors.addCity && touched.addCity}
          helperText={errors.addCity && touched.addCity ? errors.addCity : ""}
        />
      </Grid>
      <Grid item xs={xs} sm={sm}>
        <TextField
          variant={variant}
          fullWidth
          autoComplete="off"
          size="small"
          value={values.addPostalCode}
          onChange={handleChange}
          onBlur={handleBlur}
          name={navigation + ".addPostalCode"}
          label={t("addPostalCode")}
          inputProps={{
            readOnly: readOnly,
          }}
          error={errors.addPostalCode && touched.addPostalCode}
          helperText={
            errors.addPostalCode && touched.addPostalCode
              ? errors.addPostalCode
              : ""
          }
        />
      </Grid>
      <Grid item xs={xs} sm={sm}>

        <MuiTelInput 
          defaultCountry={"uy"}
          variant="outlined"
          name={navigation + ".addPhone"}
          fullWidth
          value={values.addPhone}
          label={t("addPhone")}
          inputProps={{
            readOnly: readOnly,
          }}
          size="small"
          onChange={(value, info) => setAddressFieldValue("addPhone", value)}
          onBlur={handleBlur}
          error={errors.addPhone && touched.addPhone}
          helperText={
            touched.addPhone && errors.addPhone ? errors.addPhone : ""
          }
          />

      </Grid>
      <Grid item xs={xs} sm={sm}>
        <TextField
          variant={variant}
          fullWidth
          autoComplete="off"
          size="small"
          value={values.addNotes}
          onChange={handleChange}
          onBlur={handleBlur}
          name={navigation + ".addNotes"}
          label={t("addNotes")}
          inputProps={{
            readOnly: readOnly,
          }}
          rows={1}
          error={errors.addNotes && touched.addNotes}
          helperText={
            errors.addNotes && touched.addNotes ? errors.addNotes : ""
          }
        />
      </Grid>
    </Fragment>
  );
};

Address.propTypes = {
  values: PropTypes.any.isRequired,
  handleChange: PropTypes.any.isRequired,
  handleBlur: PropTypes.any.isRequired,
  touched: PropTypes.any.isRequired,
  errors: PropTypes.any.isRequired,
  t: PropTypes.any.isRequired,
  variantTextField: PropTypes.any.isRequired,
  spacing: PropTypes.any.isRequired,
  xs: PropTypes.any.isRequired,
  sm: PropTypes.any.isRequired,
};

export default Address;
