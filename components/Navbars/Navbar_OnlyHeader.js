import React from "react";
import PropTypes from "prop-types";
import AdminNavbarLinks from "./AdminNavbarLinks.js";
import styles from "@/assets/jss/nextjs-material-dashboard/components/headerStyle.js";
import Grid from "@mui/material/Grid";
import { makeStyles } from "tss-react/mui";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { LinearProgress } from "@mui/material";

const useStyles = makeStyles()(styles);

const Header = (props) => {
  const { classes } = useStyles();
  const { color } = props;

  return (
    <AppBar className={classes.appBar}>
      {props.showLoader && <LinearProgress className="lineaprogreso" />}
      <Toolbar className={classes.container}>
        <div className={classes.flex}></div>
        <Grid container>
          <Grid item xs={3}>
            <a href="/">
              <img src="img/logoNav.svg" alt="isotipo" className="logoNav" />
            </a>
          </Grid>
          <Grid item xs={9} className="adminNavLinks">
            {<AdminNavbarLinks {...props}/>}
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
  handleDrawerToggle: PropTypes.func,
};

export default Header;
