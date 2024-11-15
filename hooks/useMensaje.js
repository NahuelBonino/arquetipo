"use client"
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useTranslation } from "@/app/i18n/client"

const { Alert } = require("@mui/material");
const { useState, useEffect } = require("react");


export default function useMensaje(lng) {

  const [errores, setErrores] = useState([]);
  const [severidad, setSeveridad] = useState();

  if (lng == null){
    console.log("LNG ES NULL, ERROR")
    return (<div>LNG ES NULL, ERROR</div>);
  }
    
  const { t } = useTranslation(lng, "mensajes");

  const messageCleanUp = () => {
    setErrores({});
  };

  const addMessage = (error, severidad, location = "default") => {
    if (error.erroresCodigo != undefined) {
      setErrores({
        [location]: error.erroresCodigo.map((e) => e.mensaje),
      });
    } else {
      if (errores[location]?.includes(error)) return;
      setErrores({ [location]: [error] });
    }
    setSeveridad(severidad);
  };

  const MessageComponent = ({ location = "default" }) => {
    const [errors, setErrors] = useState([]);

    useEffect(() => {
      setErrors(errores[location] ?? []);
    }, [errores]);

    return (
      <>
        {errors && errors.length > 0 && (
          <Alert
            onClick={messageCleanUp}
            severity={severidad}
            action={
              <IconButton aria-label="close" color="inherit" size="small">
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            className="alert-style"
          >
            {errors.length > 1 ? (
              <ul key={"lista"}>
                {errors &&
                  errors.map((err, index) => <li key={index}>{t(err)}</li>)}
              </ul>
            ) : (
              <>
                {errors &&
                  errors.map((err, index) => <span key={index}>{t(err)}</span>)}
              </>
            )}
          </Alert>
        )}
      </>
    );
  };

  return { addMessage, MessageComponent, messageCleanUp };
};
