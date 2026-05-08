/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Instrui o Next.js a gerar a pasta 'out' com arquivos estáticos
  output: 'export',

  // 2. Desativa a otimização de imagens nativa do servidor
  images: {
    unoptimized: true,
  },
};

export default nextConfig;