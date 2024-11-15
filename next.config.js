module.exports = {
  serverRuntimeConfig: {
    BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    SEGURIDAD_BACKEND_API_URL: process.env.NEXT_PUBLIC_SEGURIDAD_BACKEND_API_URL,
    BULK_BACKEND_API_URL: process.env.NEXT_PUBLIC_BULK_BACKEND_API_URL
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    BUILT_DATE: new Date().toLocaleString("es-UY", { year: 'numeric', month: '2-digit', day: '2-digit', hour: "2-digit", minute: "2-digit" }),
    AMBIENTE: process.env.NEXT_PUBLIC_AMBIENTE,
  },
  transpilePackages: ['mui-tel-input'],
};