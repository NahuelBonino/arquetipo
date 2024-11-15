"use client"
import styles from "@/assets/jss/nextjs-material-dashboard/components/headerLinksStyle.js";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { SAuth } from "@/lib/services";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, Grid, Popover, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { makeStyles } from "tss-react/mui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/client"
import { useCookies } from "react-cookie";

const useStyles = makeStyles()(styles);

export default function AdminNavbarLinks(props) {

  const [cookies, setCookie, removeCookie] = useCookies();
  const locale  = props.params.lng;
  const { t } = useTranslation(locale);
  const { addMessage } = useMensaje(locale);

  const router = useRouter();

  const { classes } = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpenProfile = Boolean(anchorEl);
  const [ambits, setAmbits] = useState([]);
  const [selectedAmbit, setSelectedAmbit] = useState("");
  const [contexts, setContexts] = useState([]);
  const [selectedContext, setSelectedContext] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    let storageAmbitos = localStorage.getItem("ambitos");
    if (storageAmbitos) {
      setAmbits(JSON.parse(storageAmbitos));
    }

    let storageAmbito = localStorage.getItem("ambito");
    if (storageAmbito) {
      setSelectedAmbit(storageAmbito);
    }

    let storageContextos = localStorage.getItem("contextos");
    if (storageContextos) {
      setContexts(JSON.parse(storageContextos));
    }

    let storageContexto = localStorage.getItem("contexto");
    if (storageContexto) {
      setSelectedContext(storageContexto);
    }

    setUser(localStorage.getItem("user"));
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const logout = () => {
    SAuth.clearUserInfoInLocalStorage();
    SAuth.clearUserInfoInCookies(removeCookie);
    router.push(`/${locale}`);
  };

  const changeDomain = async () => {
    let storageAmbito = localStorage.getItem("ambito");
    let storageContexto = localStorage.getItem("contexto");

    if (
      storageAmbito !== selectedAmbit ||
      storageContexto !== selectedContext
    ) {
      const params = {
        ambitoCodigo: selectedAmbit,
        contexto:
          selectedContext && selectedContext !== "" ? selectedContext : null,
      };
      await SAuth.changeDomain(params, setCookie, removeCookie);
      router.push(`/${locale}`);
    } else {
      addMessage("DOMINIO_YA_SELECCIONADO", "error");
    }
  };

  const handleAmbitoChange = async (event) => {
    setSelectedAmbit(event.target.value);
    let contextos = await apiSeguridadClient.get("/v1/usuarios/me/ambitos/" + event.target.value + "/contextos")
    localStorage.setItem("contextos", JSON.stringify(contextos));
    setContexts(contextos);
  };

  const handleContextoChange = (event) => {
    setSelectedContext(event.target.value);
  };

  const handleChange = (e) => {
    const l = e.target.value;
    router.push(`/${l}`, `/${l}`);
  };

  return (
    <div className="navbarlinks">
      <div className={classes.manager}>
        <TextField
          select
          size="small"
          value={locale}
          name="locale"
          onChange={handleChange}
          inputProps={{ "aria-label": "age" }}
        >
          <MenuItem key="es" value="es">
            Español
          </MenuItem>
          <MenuItem key="en" value="en">
            English
          </MenuItem>
        </TextField>

        <Button
          aria-owns={isOpenProfile ? "profile-menu-list-grow" : null}
          onClick={handleClick}
        >
          <MoreVertIcon className={classes.icons} />
        </Button>

        <Popover
          open={isOpenProfile}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box m={2} />
          <Grid
            container
            spacing={2}
            style={{ width: "500px" }}
            className="sesionDiv"
          >
            <Grid xs={4} item className="prof">
              <div className="user">{user}</div>
              <div className="perfil">
                <Link href={`/${locale}/p/perfil`}>{t("profile")}</Link>
              </div>
            </Grid>

            <Grid xs={8} item className="grey">
              <div className="dominio">{t("domain")}:</div>

              <TextField
                select
                size="small"
                value={selectedAmbit}
                onChange={(e) => {
                  handleAmbitoChange(e);
                }}
                label={t("ambito")}
              >
                {ambits.map((ambit, index) => (
                  <MenuItem key={ambit} value={ambit}>
                    {ambit}
                  </MenuItem>
                ))}
              </TextField>

              {contexts && contexts.length > 0 && (
                <div className="space">
                  <TextField
                    select
                    size="small"
                    value={selectedContext}
                    onChange={(e) => {
                      handleContextoChange(e);
                    }}
                    label={t("contexto")}
                  >
                    {contexts.map((context, index) => (
                      <MenuItem
                        key={context.contextoId}
                        value={context.contextoId}
                      >
                        {context.contextoLabel}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              )}

              <Button
                onClick={() => changeDomain()}
                className="MuiButton-containedPrimary"
              >
                <p className={classes.linkText}>{t("change_domain")}</p>
              </Button>

              <Button onClick={logout} className="MuiButton-containedSecondary">
                <p className={classes.linkText}>{t("logout")}</p>
              </Button>
            </Grid>
          </Grid>
        </Popover>
      </div>
    </div>
  );
};
