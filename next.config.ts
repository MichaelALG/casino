/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Advertencia: Esto permite la compilación si hay errores de TS.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
