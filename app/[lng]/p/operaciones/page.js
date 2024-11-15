"use client"
import { useTranslation } from "@/app/i18n/client";
import SearchTable from "@/components/SearchTable/SearchTable";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import { Grid } from "@mui/material";
import { useRef, useState } from "react";

export default function Operaciones({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { MessageComponent, addMessage } = useMensaje(lng);
  const handleSearch = useRef(null);

  const filterColumns = [
    { id: "codigo", label: t("code"), type: "TEXT" },
    { id: "nombre", label: t("name"), type: "TEXT" },
    { id: "habilitado", label: t("enabled"), type: "BOOLEAN" },
  ];

  const staticColumns = [
    { label: t("code"), id: "opeCodigo" },
    { label: t("name"), id: "opeNombre" },
    {
      id: "opeCategoria.nombre",
      label: t("category"),
      format: ({ opeCategoria }) => opeCategoria?.nombre,
    },
    {
      id: "opeHabilitado",
      label: t("enabled"),
      format: ({ opeHabilitado }) => (opeHabilitado ? t("yes") : t("no")),
    }
  ];

  const [elementsFilter, setElementsFilter] = useState({
    maxResults: 10,
    first: 0,
  });

  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("operations")}</h3>
        </Grid>
      </Grid>
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>

      <SearchTable
        api={apiSeguridadClient}
        searchTotalPath={"/buscar/total"}
        searchPath={"/buscar"}
        basePath="/v1/operaciones"
        staticColumns={staticColumns}
        handleSearchRef={handleSearch}
        filterColumns={filterColumns}
        t={t}
        lng={lng}
        filterElements={elementsFilter}
        setFilterElements={setElementsFilter}
        viewEnabled={false}
        historyEnabled={false}
        searchOnInit={true}
        idColumn={"opeId"}
        addMessage={addMessage}
      />
    </>
  );
};