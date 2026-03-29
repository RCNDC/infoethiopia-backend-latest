const multer = require("multer");
const { extname } = require("path");
const util = require("util");
const { resolveUploadDir } = require("../utils/uploadPaths");

const maxAssetSize = 10 * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const allowedLicenceMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "licence") {
      cb(null, resolveUploadDir("docs"));
    } else {
      cb(null, resolveUploadDir("images"));
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + extname(file.originalname));
  },
});

let uploadLicenceFile = multer({
  storage: storage,
  limits: { fileSize: maxAssetSize, files: 2 },
  fileFilter(req, file, cb) {
    if (
      file.fieldname === "image" && (
        !file.originalname.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)
        || !allowedImageMimeTypes.has(String(file.mimetype || "").toLowerCase())
      )
    ) {
      return cb(
        new Error(
          "Image format is not valid. Allowed: .jpg, .jpeg, .png, .webp, .avif, .gif up to 10MB."
        ),
        false
      );
    } else if (
      file.fieldname === "licence" && (
        !file.originalname.match(/\.(pdf|jpg|jpeg|png|webp|avif|gif)$/i)
        || !allowedLicenceMimeTypes.has(String(file.mimetype || "").toLowerCase())
      )
    ) {
      return cb(
        new Error("Licence format is not valid. Allowed: PDF, JPG, JPEG, PNG, WEBP, AVIF, GIF up to 10MB."),
        false
      );
    }
    return cb(null, true);
  },
}).fields([
  {
    name: "licence",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 1,
  },
]);
let uploadLicenceImage = util.promisify(uploadLicenceFile);

module.exports = uploadLicenceImage;
