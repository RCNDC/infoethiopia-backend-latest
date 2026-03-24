const multer = require("multer");
// const maxSize = 2 * 1024 * 1024;
const { extname } = require("path");
const util = require("util");
let storage = multer.diskStorage({
  // destination: "uploads/images/",
  destination: function (req, file, cb) {
    if (file.fieldname == "licence") {
      cb(null, "uploads/docs/");
    } else {
      cb(null, "uploads/images/");
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + extname(file.originalname));
  },
});

let uploadLicenceFile = multer({
  storage: storage,
  // limits: { fileSize: maxSize },
  fileFilter(req, file, cb) {
    if (
      file.fieldname == "image" &&
      !file.originalname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)
    ) {
      return cb(
        new Error(
          "Image format is not valid. Allowed: .jpg, .jpeg, .png, .webp, .avif, .gif, .svg"
        ),
        false
      );
    } else if (
      file.fieldname == "licence" &&
      !file.originalname.match(/\.(pdf|jpg|jpeg|png|webp|avif|gif|svg)$/i)
    ) {
      return cb(
        new Error("Licence format is not valid. Allowed: PDF or image files."),
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
