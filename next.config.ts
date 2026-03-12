/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Advertencia: Esto permite que la compilación continúe incluso si
    // hay errores de ESLint. Útil para demos rápidos.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Advertencia: Esto permite la compilación si hay errores de TS.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
