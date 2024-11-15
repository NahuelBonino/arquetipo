import React from "react";
import { infoColor, title } from "assets/jss/nextjs-material-dashboard.js";
import Loader from "components/Loader/loader";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()({
  progress: {
    color: infoColor,
    width: "6rem !important",
    height: "6rem !important",
  },
  wrapperDiv: {
    margin: "100px auto",
    padding: "0px",
    maxWidth: "360px",
    textAlign: "center",
    position: "relative",
    zIndex: "9999",
    top: "0",
  },
  iconWrapper: {
    display: "block",
  },
  title: {
    ...title,
    color: "#FFFFFF",
  },
});

export default function PageChange(props) {
  const { classes } = useStyles();
  return (
    <div>
      <div className={classes.wrapperDiv}>
        <div className={classes.iconWrapper}>
          <Loader />
        </div>
      </div>
    </div>
  );
}
