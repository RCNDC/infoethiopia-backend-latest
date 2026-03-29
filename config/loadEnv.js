const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "..");
const envName = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
const envPath = path.join(rootDir, envName);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config({ path: path.join(rootDir, ".env") });
}

