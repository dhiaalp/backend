import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.BACKEND_PUBLIC_URL ||
  process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ||
  "http://localhost:9000"

const MINIO_ENDPOINT =
  process.env.MINIO_ENDPOINT || process.env.MINIO_PUBLIC_ENDPOINT
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
const MINIO_BUCKET = process.env.MINIO_BUCKET

const modules: Record<string, any> = {
  auth: {
    resolve: "@medusajs/medusa/auth",
    options: {
      providers: [
        {
          resolve: "@medusajs/auth-emailpass",
          id: "emailpass",
        },
      ],
    },
  },
  file: {
    resolve: "@medusajs/file",
    options: {
      providers: [
        ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY
          ? [
              {
                resolve: "./src/modules/minio-file",
                id: "minio",
                options: {
                  endPoint: MINIO_ENDPOINT,
                  accessKey: MINIO_ACCESS_KEY,
                  secretKey: MINIO_SECRET_KEY,
                  bucket: MINIO_BUCKET,
                },
              },
            ]
          : [
              {
                resolve: "@medusajs/file-local",
                id: "local",
                options: {
                  upload_dir: "static",
                  backend_url: `${BACKEND_URL}/static`,
                },
              },
            ]),
      ],
    },
  },
}

if (process.env.STRIPE_API_KEY) {
  modules.payment = {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/payment-stripe",
          id: "stripe",
          options: {
            apiKey: process.env.STRIPE_API_KEY,
          },
        },
      ],
    },
  }
}

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "*",
      adminCors: process.env.ADMIN_CORS || "*",
      authCors: process.env.AUTH_CORS || "*",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: modules as any,
})
