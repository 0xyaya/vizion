/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PROJECT_ID: process.env.PROJECT_ID,
    API_KEY_SECRET: process.env.API_KEY_SECRET
  }
};

module.exports = nextConfig;
