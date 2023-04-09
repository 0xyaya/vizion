/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    PROJECT_ID: process.env.PROJECT_ID,
    API_KEY_SECRET: process.env.API_KEY_SECRET,
    MARKETPLACE_ADDRESS: process.env.MARKETPLACE_ADDRESS,
    COLLECTION_ADDRESS: process.env.COLLECTION_ADDRESS,
    GOUVERNANCE_ADDRESS: process.env.GOUVERNANCE_ADDRESS
  }
};

module.exports = nextConfig;
