"use client"
import packageJson from '@/package.json';
import styles from "@/assets/jss/nextjs-material-dashboard/components/footerStyle.js";
import { makeStyles } from "tss-react/mui";
import { useTranslation } from "@/app/i18n/client"

const useStyles = makeStyles()(styles);

export default function Footer(props) {

  const { classes } = useStyles();

  const { t } = useTranslation(props.params.lng);

  return (
    <footer className={classes.footer}>
      <div className={classes.container}>
        <div className={classes.left}>
        </div>
        <p className={classes.right}>
          <span>
             <span>{t('updated')}: {process.env.BUILT_DATE} {t('version')}: {packageJson.version} {t('environment')}: {process.env.AMBIENTE || t("testing")}  &copy; {1900 + new Date().getYear()}{" "}</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
