import { NextResponse } from 'next/server'
import { notFound } from 'next/navigation'
import acceptLanguage from 'accept-language'
import { fallbackLng, languages, cookieName } from './app/i18n/settings'
import * as constantesOps from "@/constants/operations";


acceptLanguage.languages(languages)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|img|favicon.ico|sw.js).*)']
}

const securedPaths = new Map([
  ["/p/operaciones", constantesOps.MENU_OPERACIONES],
  ["/p/configuraciones", constantesOps.MENU_CONFIGURACIONES],
  ["/p/usuarios", constantesOps.MENU_USUARIOS],
  ["/p/roles", constantesOps.MENU_ROLES],
  ["/p/rol", constantesOps.SEGURIDAD_ROLES_ACTUALIZAR],
  ["/p/plantillas", constantesOps.MENU_PLANTILLAS],
  ["/p/paises", constantesOps.MENU_PAISES],
  ["/p/inicio", constantesOps.AUTENTICADO],
  ["/p/bulk", constantesOps.BULKTASKS_FIND],
  ["/p/abm/proveedoresSimpleTable", constantesOps.AUTENTICADO],
  ["/p/abm/proveedoresSearchTable", constantesOps.AUTENTICADO],
  ["/p/abm/proveedor", constantesOps.AUTENTICADO],
  ["/p/perfil", constantesOps.AUTENTICADO],
]);

const isTokenValid = (token) => {
  if (!token) {
    return false; //No hay token
  }
  //False si el token está vencido
  let tokenData = JSON.parse(Buffer.from(token.split(".")[1], 'base64'));
  return Date.now() <= tokenData.exp * 1000;
};

const userHasRequiredOperationInStringArray = (requiredOperation, co) => {
  if (requiredOperation == null) {
    return true;
  }
  let currentOperations;
  if (co != null) {
    currentOperations = JSON.parse(co);
  }
  if (currentOperations != null) {
    return currentOperations.some(
      (operation) => operation == requiredOperation
    );
  }
  return false;
};

const userHasRequiredOperation = (req) => {

  if (!req.cookies.has("pageOps")) {
    return false;
  }

  let pathWithoutLang = req.nextUrl.pathname.substring(3);

  if (securedPaths.has(pathWithoutLang) && userHasRequiredOperationInStringArray(securedPaths.get(pathWithoutLang), req.cookies.get("pageOps").value)){
      return true;
  }

  return false;
}

export function middleware(req) {

  let lng
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName).value)
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng

  //Secured pages
  if (req.nextUrl.pathname.startsWith(`/${lng}/p/`)) {

    if (!req.cookies.has("jwt") || !isTokenValid(req.cookies.get("jwt").value)) {
      const response = NextResponse.redirect(new URL(`/${lng}/auth/login`, req.url))
      response.cookies.set("redirectUrl", req.nextUrl.pathname, "/");
      return response;
    } else if (!userHasRequiredOperation(req)) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // Redirect if lng in path is not supported
  if (
    !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer'))
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
    const response = NextResponse.next()
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return NextResponse.next()
}