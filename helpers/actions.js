"use server"

import { apiSeguridadClient } from "@/lib/apiClient";

export async function getRoles(roleFilter) {
  try {
    console.log("ENTRA")
    let roles = await apiSeguridadClient.get("/v1/roles/buscar", {
      params: roleFilter,
    });
    console.log(roles);
    roles = roles.filter((r) => r.rolPk !== 1);
    return roles;
  } catch (error) {
    console.log(error);
  }
}
