const multer = require("multer");
const { extname } = require("path");
const util = require("util");
const { resolveUploadDir } = require("../utils/uploadPaths");

const maxImageSize = 5 * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

let storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, resolveUploadDir("images"));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + extname(file.originalname));
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxImageSize, files: 1 },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)
      || !allowedImageMimeTypes.has(String(file.mimetype || "").toLowerCase())
    ) {
      return cb(
        new Error(
          "Image format is not valid. Allowed: .jpg, .jpeg, .png, .webp, .avif, .gif up to 5MB."
        ),
        false
      );
    }
    return cb(null, true);
  },
}).single("image");

let uploadImage = util.promisify(uploadFile);
module.exports = uploadImage;
