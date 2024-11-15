import React from "react";
import AdminNavbarLinks from "./AdminNavbarLinks.js";
import styles from "@/assets/jss/nextjs-material-dashboard/components/headerStyle.js";
import PropTypes from "prop-types";
import { makeStyles } from "tss-react/mui";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Hidden from "@mui/material/Hidden";
import Menu from "@mui/icons-material/Menu";
import { LinearProgress } from "@mui/material";

const useStyles = makeStyles()(styles);

const Header = (props) => {
  const { classes } = useStyles();

  return (
    <AppBar className={classes.appBar}>
      {props.showLoader && <LinearProgress className="lineaprogreso" />}
      <Toolbar>
        <div className={classes.flex}></div>

        {<AdminNavbarLinks {...props} />}

        <Hidden mdUp implementation="css">
          <IconButton
            aria-label="open drawer"
            onClick={props.handleDrawerToggle}
          >
            <Menu />
          </IconButton>
        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  handleDrawerToggle: PropTypes.func,
};

export default Header;
