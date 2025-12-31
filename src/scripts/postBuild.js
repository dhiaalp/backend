const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const serverPath = path.join(process.cwd(), ".medusa", "server")

if (!fs.existsSync(serverPath)) {
  throw new Error(
    '.medusa/server directory not found. Medusa build likely failed.'
  )
}

const lockPath = path.join(process.cwd(), "pnpm-lock.yaml")
if (fs.existsSync(lockPath)) {
  fs.copyFileSync(lockPath, path.join(serverPath, "pnpm-lock.yaml"))
}

const envPath = path.join(process.cwd(), ".env")
if (fs.existsSync(envPath)) {
  fs.copyFileSync(envPath, path.join(serverPath, ".env"))
}

console.log("Installing production dependencies in .medusa/server...")
execSync("pnpm install --prod --frozen-lockfile", {
  cwd: serverPath,
  stdio: "inherit",
})
