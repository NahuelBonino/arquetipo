import Loader from "@/components/Loader/loader";
import useMensaje from "@/hooks/useMensaje";
import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid
} from "@mui/material";
import { useEffect, useState } from "react";
import SimpleTable from "../SimpleTable/SimpleTable";

const HistoricoDialogo = ({
  i18next,
  showHistory,
  setShowHistory,
  entity,
  keyEntity,
  urlBase,
  columns,
  apiClient,
  extraColumns = [],
  lng
}) => {

  const { addMessage, MessageComponent, messageCleanUp } = useMensaje(lng);

  const [isLoading, setLoad] = useState(true);
  const [fields, setFields] = useState([]);
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loaded, setLoaded] = useState(false)
  const { agregarMensaje, MensajeComponente } = useMensaje()


  useEffect(() => {
    messageCleanUp();
    getHistory();
    setLoaded(true)
  }, []);

  useEffect(() => {
    if (loaded) {
      getHistory()
    }
  }, [rowsPerPage, page])


  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value)
    setPage(0)
  }

  const getHistory = async () => {
    try {

      let filter = {}
      filter.maxResults = rowsPerPage
      filter.first = page * filter.maxResults
      setLoad(true);

      const resultTotal = await apiClient.get(
        `${urlBase}/${entity[keyEntity]}/historial/total`
      )
      setTotal(resultTotal)
      let datos = await apiClient.get(
        `${urlBase}/${entity[keyEntity]}/historial`,
        {
          params: filter,
        }
      );
      const columnsTable = columns?.filter(({ id }) => id != "options");
      setFields(columnsTable);
      setItems(
        datos.map((item) => ({
          ...JSON.parse(item.obj),
        }))
      );
      setLoad(false);
    } catch (error) {
      addMessage(error, "error");
    }
  };

  const handleClose = () => setShowHistory(false);

  return (
    <Dialog
      fullScreen
      open={showHistory}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="form-dialog-title">{i18next("history")}
        <Button onClick={handleClose} className="close-icon">
          <Close width={25} color="black" />
        </Button>
      </DialogTitle>
      <DialogContent>
        <Grid container>
          <MessageComponent t={i18next} />
        </Grid>
        {isLoading && <Loader />}
        {!isLoading && items && items.length == 0 && (
          <div>{i18next("no_results")}</div>
        )}
        {!isLoading && items && items.length > 0 && (
          <SimpleTable
            staticColumns={[...columns, ...extraColumns]}
            items={items}
            total={total}
            rowsPerPage={rowsPerPage}
            page={page}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}
      </DialogContent>

    </Dialog>
  );
};

export default HistoricoDialogo;
