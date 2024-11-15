import PropTypes from "prop-types";
import BusinessError from "@/types/BusinessError";
import { Alert, Button, Snackbar } from "@mui/material";

const CustomSnackbar = ({
  t,
  message,
  type,
  action,
  ButtonProps,
  SnackbarProps,
}) => {
  if (message == null) {
    return null;
  }

  let isString = false;
  let hasError = false;
  let hasBusinessError = false;
  if (typeof message === "string") {
    isString = true;
  }
  if (message instanceof BusinessError) {
    hasBusinessError = true;
  } else if (message instanceof Error) {
    hasError = true;
  }

  return (
    <Snackbar {...SnackbarProps}>
      <Alert
        variant="filled"
        severity={type}
        action={
          action != null && (
            <Button color="inherit" size="small" {...ButtonProps}>
              {action}
            </Button>
          )
        }
      >
        {isString && t(message)}
        {hasError && t(message.message)}
        {hasBusinessError &&
          message.erroresCodigo.map((item, i) => (
            <span key={i}>
              {t(item.mensaje)}
              <br></br>
            </span>
          ))}
      </Alert>
    </Snackbar>
  );
};

CustomSnackbar.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  type: PropTypes.oneOf(["error", "warning", "info", "success"]),
  action: PropTypes.string,
  ButtonProps: PropTypes.object,
  SnackbarProps: PropTypes.object,
};

export default CustomSnackbar;
