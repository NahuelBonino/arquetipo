import { useRouter } from "next/navigation";
import { FormControl, NativeSelect } from "@mui/material";
import Button from "@mui/material/Button";
import { makeStyles } from "tss-react/mui";
import styles from "@/assets/jss/nextjs-material-dashboard/components/headerLinksStyle.js";

const useStyles = makeStyles()(styles);

const NotLoggedNavbarLinks = (props) => {
  const { classes } = useStyles();
  const openProfile = null;

  const locale  = props.params.lng;

  //const [cookie, setCookie] = useCookies(["NEXT_LOCALE"]);
  const router = useRouter();

  const handleChange = (e) => {
    const l = e.target.value;
    router.push(`/${l}`, `/${l}`);
    //if (cookie.NEXT_LOCALE !== locale) {
    //  setCookie("NEXT_LOCALE", locale, { path: "/" });
    //}
  };

  return (
    <div>
      <div className={classes.manager}>
        <Button
          aria-owns={openProfile ? "profile-menu-list-grow" : null}
          aria-haspopup="true"
          className={classes.buttonLink}
        >
          <FormControl className={classes.formControl}>
            <NativeSelect
              value={locale}
              name="locale"
              onChange={handleChange}
              className={classes.selectEmpty}
              inputProps={{ "aria-label": "age" }}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </NativeSelect>
          </FormControl>
        </Button>
      </div>
    </div>
  );
};

export default NotLoggedNavbarLinks;
