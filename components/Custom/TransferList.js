/* eslint-disable no-use-before-define */
import React, { useState, Fragment } from "react";
import { get } from "lodash"
import { makeStyles } from "tss-react/mui";
import {
  Button,
  Card,
  Checkbox,
  Grid,
  ListItemText,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
} from "@mui/material";

const useStyles = makeStyles()((theme) => ({
  root: {
    margin: "auto",
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    height: 450,
    overflow: "auto",
  },
}));

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

const TransferList = (props) => {
  const {
    left,
    right,
    setRight,
    setLeft,
    t,
    setFieldValue,
    fieldName,
    itemPkField,
    itemNameField,
  } = props;
  
  const { classes } = useStyles();

  const [checked, setChecked] = useState([]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);


  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleCheckedRight = () => {
    let newRight = right.concat(leftChecked);
    setRight(newRight);
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));

    setFieldValue(fieldName, newRight);
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    let newRight = not(right, rightChecked);
    setRight(newRight);
    setChecked(not(checked, rightChecked));

    setFieldValue(fieldName, newRight);
  };

  const customList = (title, items) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{ "aria-label": "all items selected" }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} ${t(
          "selected_m"
        )}`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem
              key={get(value, itemPkField)}
              role="listitem"
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={get(value, itemNameField)}
              />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Fragment>
      <Grid container spacing={2} alignItems="flex-start" className="rolbox">
        <Grid item className="rolboxinside">
          {customList(t("not_selected_m"), left)}
        </Grid>
        <Grid item>
          <Grid container direction="column" alignItems="center">
            <Button
              size="small"
              className={classes.button}
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              size="small"
              className={classes.button}
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid item className="rolboxinside">
          {customList(t("selected_m"), right)}
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default TransferList;
