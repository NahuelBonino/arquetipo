import React, { Fragment } from "react";
import { Grid, Paper, Typography } from "@mui/material";

const Auth = ({ children, title }) => {
  return (
    <Fragment>
      <div className="login">
        <div className="bg-color">
          <Grid
            container
            component="main"
            spacing={0}
            className="contLog"
            direction="column"
            alignItems="center"
          >
            <Grid
              item
              xs={12}
              sm={8}
              md={5}
              component={Paper}
              elevation={6}
              square
              style={{ maxWidth: "470px" }}
            >
              <div className="paper">
                <img
                  src="/img/logotipo-azul.svg"
                  alt="logo"
                  className="logo1"
                  width="250px"
                />
                <Typography component="h1" variant="h5">
                  {title}
                </Typography>
                {children}
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </Fragment>
  );
};

export default (Auth);
