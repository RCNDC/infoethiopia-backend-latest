const multer = require("multer");
// const maxSize = 2 * 1024 * 1024;
const { extname } = require("path");
const util = require("util");
let storage = multer.diskStorage({
  destination: "uploads/images/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + extname(file.originalname));
  },
});

let uploadFile = multer({
  storage: storage,
  // limits: { fileSize: maxSize },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(
        new Error(
          "Image format is not valid, Only .png, .jpg and .jpeg format allowed!"
        ),
        false
      );
    }
    return cb(null, true);
  },
}).single("image");

let uploadImage = util.promisify(uploadFile);
module.exports = uploadImage;
