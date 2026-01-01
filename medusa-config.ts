import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

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
}

if (process.env.MINIO_ENDPOINT && process.env.MINIO_ACCESS_KEY && process.env.MINIO_SECRET_KEY && process.env.MINIO_BUCKET) {
  const useSSL = process.env.MINIO_USE_SSL === "true"
  const publicHost = process.env.MINIO_PUBLIC_HOST
  const port = process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : undefined

  modules.file = {
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/file-s3",
          id: "minio",
          options: {
            endpoint: process.env.MINIO_ENDPOINT,
            access_key_id: process.env.MINIO_ACCESS_KEY,
            secret_access_key: process.env.MINIO_SECRET_KEY,
            bucket: process.env.MINIO_BUCKET,
            region: process.env.MINIO_REGION || "us-east-1",
            ...(port ? { port } : {}),
            ...(useSSL ? { secure: true } : {}),
            ...(publicHost ? { file_url: `https://${publicHost}` } : {}),
          },
        },
      ],
    },
  }
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
