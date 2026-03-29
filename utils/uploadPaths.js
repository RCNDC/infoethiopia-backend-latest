const fs = require("fs");
const path = require("path");

const UPLOADS_ROOT = path.resolve(__dirname, "..", "uploads");

const ensureDirectory = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
};

const resolveUploadDir = (...segments) =>
  ensureDirectory(path.join(UPLOADS_ROOT, ...segments));

const getLocalUploadPath = (assetPath) => {
  const raw = String(assetPath || "").trim();
  if (!raw) return null;

  let pathname = raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      pathname = new URL(raw).pathname;
    } catch (err) {
      pathname = raw;
    }
  }

  const normalizedPath = pathname.replace(/\\/g, "/");
  const withoutApiPrefix = normalizedPath.replace(/^\/api\//i, "/");
  const relativePath = withoutApiPrefix.replace(/^\/+/, "");
  if (!relativePath.startsWith("images/") && !relativePath.startsWith("docs/")) {
    return null;
  }

  const resolved = path.resolve(UPLOADS_ROOT, relativePath);
  const uploadsRootWithSlash = UPLOADS_ROOT.endsWith(path.sep)
    ? UPLOADS_ROOT
    : `${UPLOADS_ROOT}${path.sep}`;
  if (!resolved.toLowerCase().startsWith(uploadsRootWithSlash.toLowerCase())) {
    return null;
  }

  return resolved;
};

const safeDeleteFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("Failed to delete file:", filePath, err.message);
    }
  }
};

const safeDeleteFiles = async (paths) => {
  const uniquePaths = [...new Set((paths || []).filter(Boolean))];
  await Promise.all(uniquePaths.map((filePath) => safeDeleteFile(filePath)));
};

module.exports = {
  UPLOADS_ROOT,
  ensureDirectory,
  resolveUploadDir,
  getLocalUploadPath,
  safeDeleteFile,
  safeDeleteFiles,
};

