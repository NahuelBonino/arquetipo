"use client"
import { useTranslation } from "@/app/i18n/client";
import SearchTable from "@/components/SearchTable/SearchTable";
import * as constantesOps from "@/constants/operations";
import useMensaje from "@/hooks/useMensaje";
import { apiSeguridadClient } from "@/lib/apiClient";
import localTime from "@/lib/utils/dateConverter";
import { userHasRequiredOperation } from "@/lib/utils/opsValidator";
import { Button, Grid } from "@mui/material";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";


export default function Roles({ params: { lng } }) {

  const { t } = useTranslation(lng);

  const { addMessage, MessageComponent } = useMensaje(lng);

  const filterColumns = [
    { id: "codigo", label: t("code"), type: "TEXT" },
    { id: "nombre", label: t("name"), type: "TEXT" },
    { id: "habilitado", label: t("enabled"), type: "BOOLEAN" },
  ];

  const staticColumns = [
    { id: "rolCodigo", label: t("code") },
    { id: "rolNombre", label: t("name") },
    { id: "rolHabilitado", label: t("enabled"), format: ({ rolHabilitado }) => (rolHabilitado ? t("yes") : t("no")) },
    { id: "auditData.lastModUser.nombreYApellido", sortBy: "auditData.lastModUser.usuPrimerNombre", label: t("mod_user"), format: ({ auditData }) => auditData.lastModUser ? auditData.lastModUser.nombreYApellido : null },
    { id: "auditData.lastModDateTime", label: t("mod_date"), format: ({ auditData }) => localTime(auditData.lastModDateTime) },
  ];

  const [elementsFilter, setElementsFilter] = useState({
    maxResults: 10,
    first: 0,
    orderBy: ["rolId"],
    ascending: [true],
  });
  const [roleOnEdit, setRoleOnEdit] = useState({});
  const [isAddEnabled, setIsAddEnabled] = useState(false);
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(false);
  useEffect(() => {
    setIsAddEnabled(
      userHasRequiredOperation(constantesOps.SEGURIDAD_ROLES_CREAR)
    );
    setIsEditEnabled(
      userHasRequiredOperation(constantesOps.SEGURIDAD_ROLES_ACTUALIZAR)
    );
    setIsDeleteEnabled(
      userHasRequiredOperation(constantesOps.SEGURIDAD_ROLES_ELIMINAR)
    );
    setIsHistoryEnabled(
      userHasRequiredOperation(
        constantesOps.SEGURIDAD_ROLES_HISTORIAL
      )
    );
  }, []);

  const handleSearch = useRef(null);


  return (
    <>
      <Grid justifyContent="space-between" container direction="row">
        <Grid item>
          <h3>{t("roles")}</h3>
        </Grid>

        {isAddEnabled && (
          <Grid item>
            <Link href="rol">
              <Button
                color="secondary"
                variant="contained"
                className="float-right"
              >
                {t("add")}
              </Button>
            </Link>
          </Grid>
        )}
      </Grid>
      <Grid container direction="row">
        <MessageComponent t={t} />
      </Grid>

      <SearchTable
        api={apiSeguridadClient}
        searchTotalPath={"/buscar/total"}
        searchPath={"/buscar"}
        basePath="/v1/roles"
        staticColumns={staticColumns}
        filterColumns={filterColumns}
        t={t}
        lng={lng}
        editEnabled={isEditEnabled}
        deleteEnabled={isDeleteEnabled}
        historyEnabled={isHistoryEnabled}
        handleSearchRef={handleSearch}
        editingObject={roleOnEdit}
        setEditingObject={setRoleOnEdit}
        filterElements={elementsFilter}
        setFilterElements={setElementsFilter}
        searchOnInit={true}
        idColumn={"rolId"}
        addMessage={addMessage}
        editLink={`/${lng}/p/rol`}
      />

    </>
  );
};