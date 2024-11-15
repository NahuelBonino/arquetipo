import {
  sidebarWidth,
  sidebarWidthCollapsed,
  transition,
  container,
} from "@/assets/jss/nextjs-material-dashboard.js";

const appStyle = (theme) => ({
  wrapper: {
    position: "relative",
    top: "0",
    height: "100vh",
  },
  mainPanel: {
    [theme?.breakpoints?.up("md")]: {
      width: `calc(100% - ${sidebarWidth}px)`,
    },
    overflow: "auto",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: "touch"
  },
  mainPanelCollapsedSidebar: {
    [theme?.breakpoints?.up("md")]: {
      width: `calc(100% - ${sidebarWidthCollapsed}px)`,
    },
    overflow: "auto",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: "touch",
  },
  content: {
    marginTop: "35px",
    padding: "30px 15px",
    minHeight: "calc(100vh - 123px)",
  },
  container,
  map: {
    marginTop: "70px",
  },
});

export default appStyle;
