import getConfig from 'next/config';
import { NextResponse } from "next/server";
const publicRuntimeConfig = getConfig().publicRuntimeConfig ?? {};

export async function GET(request, context) {
    return NextResponse.json(publicRuntimeConfig[context.params.CODIGO] ?? '', { status: 200 });
  }
   