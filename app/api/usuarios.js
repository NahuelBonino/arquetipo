import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../helpers/session";
import getConfig from "next/config";
import serverUtils from "@/utils/server.utils";

const { serverRuntimeConfig } = getConfig();

const url_solicitudes = serverRuntimeConfig.SEGURIDAD_BACKEND_API_URL;

export const usuarios = async (req, res) => {
  try {
    const { ofertaId, edicionId } = req.query;


    res.status(200).send(response);
  } catch (error) {
    console.error("Error handling solicitudes:", error);
    res.status(500).json({ error: `Internal Server Error - ${error}` });
  }
};
