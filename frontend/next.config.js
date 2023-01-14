/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Expose server enviornment variables to the JavaScript bundle seen by the browser (variable is assigned in the container)
    CLIENT_API_BASE_URL: process.env.CLIENT_API_BASE_URL,
  }
}

module.exports = nextConfig
