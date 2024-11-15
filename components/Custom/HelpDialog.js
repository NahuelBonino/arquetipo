"use client"
import React, { useState, useEffect } from "react";
import { Drawer, CardContent, IconButton, Grid } from "@mui/material";
import { Close, Help } from "@mui/icons-material";

export default function HelpDialog ({ t, codigo, title, btnClassname }) {
  const [isShow, setIsShow] = useState(false);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    setTexto(codigo);
  }, []);

  const handleShow = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setIsShow(open);
  };
 
  return (
    <>
      <Help className={`ayudabtn ${btnClassname}`} onClick={handleShow(true)} />
       <Drawer
        anchor="right"
        open={isShow}
        onClose={handleShow(false)}
        transitionDuration={500}
      >
        <Grid>
          <CardContent>
            <div className="d-flex titulo-help">
              <div className="headerPop">{title || t("help")}</div>
              <div>
                <IconButton aria-label="close" onClick={handleShow(false)}>
                  <Close className="help-button" />
                </IconButton>
              </div>
            </div>
            <div className="contHelp mt-3">
              {texto ? (
                <div dangerouslySetInnerHTML={{ __html: texto }} />
              ) : (
                t("sin_ayuda")
              )}
              <br />
              {!texto ? `${t("code")}: ${codigo}` : ""}
            </div>
          </CardContent>
        </Grid>
      </Drawer>
    </>
  );
};
