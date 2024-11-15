import React from "react";
import NotLoggedNavbarLinks from "./NotLoggedNavbarLinks.js";
import styles from "@/assets/jss/nextjs-material-dashboard/components/headerStyle.js";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import { makeStyles } from "tss-react/mui";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

const useStyles = makeStyles()(styles);

const Header = (props) => {
  const { classes } = useStyles();

  const { color } = props;

  return (
    <AppBar className={classes.appBar}>
      <Toolbar className="header2">
        <div className={classes.flex}></div>
        <Grid container>
          <Grid item xs={3}>
            <img src="img/logoNav.svg" alt="isotipo" className="logoNav" />
          </Grid>
          <Grid item xs={9} className="adminNavLinks">
            {<NotLoggedNavbarLinks {...props}/>}
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
