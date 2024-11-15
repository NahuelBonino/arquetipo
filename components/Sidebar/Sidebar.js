/*eslint-disable*/
"use client"
import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import * as ops from "@/constants/operations";
import styles from "@/assets/jss/nextjs-material-dashboard/components/sidebarStyle.js";
import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  SubMenu
} from "react-pro-sidebar";
import { makeStyles } from "tss-react/mui";
import Hidden from "@mui/material/Hidden";
import { useTranslation } from "@/app/i18n/client"
import {
  Lock,
  Group,
  Settings,
  Person,
  Dashboard,
  HomeWork,
  HomeOutlined,
  ArrowForward,
  ArrowBack
} from "@mui/icons-material";
import AllInbox from "@mui/icons-material/AllInbox";
import BuildIcon from "@mui/icons-material/Build";
import FlagIcon from "@mui/icons-material/Flag";
import CodeIcon from "@mui/icons-material/Code";
import { IconButton } from "@mui/material";
import { ImprovedLink } from "@/components/ImprovedLink/ImprovedLink.js"

const useStyles = makeStyles()(styles);

export default function Sidebar(props) {
  const { classes } = useStyles();

  const lng = props.params.lng;
  const { t } = useTranslation(props.params.lng);


  const imgComponent = props.collapsed ? (
    <img src="/img/imagotipo.svg" alt="logo" className={classes.img} />
  ) : (
    <img src="/img/logotipo.svg" alt="logo" className={classes.img} />
  );

  const operaciones = JSON.parse(localStorage.getItem("operations"));

  const url = "/p/inicio";

  const SideBarContent = () => (
    <>
      <Menu iconShape="square" />

      <Menu iconShape="circle">
        <MenuItem icon={<HomeOutlined />} component={<ImprovedLink href={url}></ImprovedLink>}> {t("home")} </MenuItem>


        <SubMenu icon={<HomeWork />} label={t("ABM Examples")}>
          {
            <MenuItem icon={<AllInbox />} component={<ImprovedLink href={`/${lng}/p/abm/proveedoresSimpleTable`} />}>
              {t("Proveedores Tabla")}
            </MenuItem>
          }
          {
            <MenuItem icon={<AllInbox />} component={<ImprovedLink href={`/${lng}/p/abm/proveedoresSearchTable`} />}>
              {t("Proveedores Filtro")}
            </MenuItem>
          }
        </SubMenu>

        <SubMenu icon={<HomeWork />} label={t("tasks")}>
          {operaciones.includes(ops.BULKTASKS_FIND) && (
            <MenuItem icon={<CodeIcon />} component={<ImprovedLink href={`/${lng}/p/bulk`} />}>
              {t("Excel")}
            </MenuItem>
          )}
        </SubMenu>

        <SubMenu icon={<BuildIcon />} label={t("configuration")}>
          {operaciones.includes(ops.MENU_CONFIGURACIONES) && (
            <MenuItem icon={<Settings />} component={<ImprovedLink href={`/${lng}/p/configuraciones`} />}>
              {t("configurations")}
            </MenuItem>
          )}
          {operaciones.includes(ops.MENU_USUARIOS) && (
            <MenuItem icon={<Person />} component={<ImprovedLink href={`/${lng}/p/usuarios`} />}>
              {t("users")}
            </MenuItem>
          )}
          {operaciones.includes(ops.MENU_ROLES) && (
            <MenuItem icon={<Group />} component={<ImprovedLink href={`/${lng}/p/roles`} />}>
              {t("roles")}
            </MenuItem>
          )}
          {operaciones.includes(ops.MENU_OPERACIONES) && (
            <MenuItem icon={<Lock />} component={<ImprovedLink href={`/${lng}/p/operaciones`} />}>
              {t("operations")}
            </MenuItem>
          )}
          {operaciones.includes(ops.MENU_PLANTILLAS) && (
            <MenuItem icon={<Dashboard />} component={<ImprovedLink href={`/${lng}/p/plantillas`} />}>
              {t("templates")}
            </MenuItem>
          )}
          {operaciones.includes(ops.MENU_PAISES) && (
            <MenuItem icon={<FlagIcon />} component={<ImprovedLink href={`/${lng}/p/paises`} />}>
              {t("countries")}
            </MenuItem>
          )}
        </SubMenu>
      </Menu>
    </>
  )

  let brand = (

    <div>

      <IconButton
        name="collapse"
        className="btn-toggle-menu"
        onClick={() => props.handleCollapsedChange(!props.collapsed)}
        color="primary"
        component="span"
        style={{ position: "absolute", top: 0, right: 0, zIndex: 5, padding: "10px", color: "white" }}>
        {props.collapsed && <ArrowForward />}
        {!props.collapsed && <ArrowBack />}
      </IconButton>

      <Link href={url} className={classes.logoLink}>
        <div className={classes.logoImage}>{imgComponent}</div>
      </Link>
    </div>

  );

  let brandMobile = (
    <div className={classes.logo}>
      <Link href={url} className={classes.logoLink}>
        <div className={classes.logoImage}>
          <img src="/img/logotipo.svg" alt="logo" className={classes.img} />
        </div>
      </Link>
    </div>
  );

  return (
    <div>
      <Hidden mdUp implementation="css">
        <ProSidebar
          width="270px"
          toggled={props.open}
          onToggle={props.handleDrawerToggle}
          breakPoint="lg"
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="ps-sidebar-header">{brandMobile}</div>
            <div style={{ flex: 1 }}><SideBarContent /></div>
          </div>
        </ProSidebar>
      </Hidden>
      <Hidden mdDown implementation="css">
        {props.collapsed !== null && (
          <ProSidebar collapsed={props.collapsed} width="270px">
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="ps-sidebar-header">{brand}</div>
              <div style={{ flex: 1 }}><SideBarContent /></div>
            </div>
          </ProSidebar>
        )}
      </Hidden>
    </div>
  );
}

Sidebar.propTypes = {
  handleDrawerToggle: PropTypes.func,
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  open: PropTypes.bool,
};
