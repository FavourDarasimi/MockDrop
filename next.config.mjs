/** @type {import('next').NextConfig} */
const nextConfig = {
  // ioredis speaks raw TCP, so every route that touches Redis must run on the
  // Node runtime. Marking it here documents the constraint; each route also
  // declares `export const runtime = "nodejs"` so it survives a config change.
  serverExternalPackages: ["ioredis"],
};

export default nextConfig;
