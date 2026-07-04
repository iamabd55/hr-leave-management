import type { NextConfig } from "next";

// API requests to /api/** are handled by the Route Handler at
// src/app/api/[...path]/route.ts which proxies to https://localhost:7125
// with rejectUnauthorized: false for the .NET self-signed dev certificate.
const nextConfig: NextConfig = {};

export default nextConfig;
