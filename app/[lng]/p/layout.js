"use client"
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isTokenValid,
  userHasRequiredOperation,
} from "@/lib/utils/opsValidator";
import { makeStyles } from "tss-react/mui";
import styles from "@/assets/jss/nextjs-material-dashboard/layouts/adminStyle.js";
import Footer from "@/components/Footer/Footer.js";
import Navbar from "@/components/Navbars/Navbar.js";
import Sidebar from "@/components/Sidebar/Sidebar.js";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { useTranslation } from "@/app/i18n/client"

const useStyles = makeStyles()(styles);

export default function General({
  children,
  ...rest
}) {

  const lng = rest.params.lng;

  const { classes } = useStyles();

  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {

    setCollapsed(localStorage.getItem("sidebarCollapsed") === "true");
    setLoading(false);

  }, []);

  const handleCollapsedChange = (checked) => {
    setCollapsed(checked);
    localStorage.setItem("sidebarCollapsed", checked);
  };


  if (loading) {
    return <div></div>;
  }

  return (
    <Fragment>
      {
        <div className={classes.wrapper}>
          <div style={{position: "relative", zIndex: 2}}>
            <Sidebar
              collapsed={collapsed}
              handleCollapsedChange={handleCollapsedChange}
              handleDrawerToggle={handleDrawerToggle}
              open={mobileOpen}
              {...rest}
            />
          </div>
          <div
            style={{zIndex: 1}}
            className={
              collapsed ? classes.mainPanelCollapsedSidebar : classes.mainPanel
            }
          >
            <Navbar
              showLoader={false}
              handleDrawerToggle={handleDrawerToggle}
              {...rest}
            />
            <div className={classes.content}>
              <div className={classes.container}>{children}</div>
            </div>
            <Footer {...rest} />
          </div>
        </div>
      }
    </Fragment>
  );
}
