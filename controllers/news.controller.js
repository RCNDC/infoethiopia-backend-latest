const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");
const multer = require("multer");
const uploadLicenceImage = require("../router/uploadlicence.helper");

/**
 * @description add news
 * @param {*} req
 * @param {File} req.file
 * @param {*} req.body
 * @param {String} req.body.title
 * @param {String} req.body.body
 * @param {String} req.body.author
 * @param {*} res
 * @returns {String}
 */
exports.AddNews = async (req, res) => {
  try {
    await uploadImage(req, res);
    if (req.file == undefined) {
      return res.status(400).json({ err: "Please upload a file!" });
    }
    const imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
    const { title, body, author } = req.body;
    return db.News.create({
      title,
      headingImage: imageURI,
      body,
      author,
    }).then(() => {
      return res.json({ message: "News successfully created." });
    });
  } catch (err) {
    if (err.message) return res.status(400).json({ err: err.message });
    return res.status(500).send({
      err,
    });
  }
};

/**
 * @description fetch all news
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.getNews = (req, res) => {
  return db.News.findAll({ include: db.Company, where: { approved: true } })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the news." });
    });
};

/**
 * @description delete news
 * @param {*} req
 * @param {*} res
 * @returns {String}
 */
exports.deleteNews = (req, res) => {
  const { Id } = req.params;
  console.log("id", Id);
  return db.News.destroy({ where: { Id } })
    .then((result) => {
      return res.json({ message: "News successfully deleted." });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ err: "Error deleting the news." });
    });
};
/**
 * @description update news detail
 * @param {*} req
 * @param {File} req.file
 * @param {*} req.body
 * @param {String} req.body.title
 * @param {String} req.body.body
 * @param {String} req.body.author
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} res
 * @returns {String}
 */
exports.updateNews = async (req, res) => {
  try {
    let image = true;
    await uploadImage(req, res);
    if (req.file == undefined) {
      image = false;
    }
    const { title, body, author } = req.body;
    const { Id } = req.params;
    return db.News.findOne({ where: { Id } }).then((result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the news" });
      }
      let imageURI = undefined;

      if (image) {
        // delete the previous image if it's updated
        fs.unlink(
          join(
            __filename,
            `../../uploads/images/${result.headingImage.split("images")[1]}`
          ),
          (err) => {
            if (err) throw new Error(err);
          }
        );

        imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
      }
      return result
        .update({ title, headingImage: imageURI, author, body })
        .then(() => {
          return res.json({ message: "Catagory successfully updated." });
        });
    });
  } catch (err) {
    if (err.message) return res.status(400).json({ err: err.message });

    return res.status(500).send({
      err,
    });
  }
};
/**
 * @description users add news
 * @param {*} req
 * @param {Object} req.files
 * @param {File} req.files.licence
 * @param {File} req.files.image
 * @param {*} req.body
 * @param {String} req.body.title
 * @param {String} req.body.body
 * @param {String} req.body.author
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} res
 * @returns {String}
 */
exports.userAddNews = async (req, res) => {
  try {
    await uploadLicenceImage(req, res);
    if (!req.files.licence) {
      return res.json({ err: "Please upload the licence." });
    }
    let licenceURI = `${process.env.BASE_URL}/docs/${req.files.licence[0].filename}`;

    if (req.files.image == undefined) {
      return res.json({ err: "Please upload the heading image." });
    }
    let imageURI = `${process.env.BASE_URL}/images/${req.files.image[0].filename}`;
    const { title, body, author } = req.body;
    const Id = req.params.Id;
    return db.News.create({
      title,
      headingImage: imageURI,
      body,
      author,
      licence: licenceURI,
      companyId: Id,
      approved: false,
    }).then(() => {
      return res.json({ message: "News successfully created." });
    });
  } catch (err) {
    if (err.message) return res.json({ err: err.message });
    return res.send({
      err,
    });
  }
};
/**
 * @description admin approve news added by the users
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} res
 * @returns
 */
exports.adminApproveNews = (req, res) => {
  const Id = req.params.Id;
  return db.News.findOne({ where: { Id } }).then((result) => {
    if (!result)
      return res.status(400).json({ err: "Error finding the news." });
    return result
      .update({ approved: true })
      .then(() => {
        return res.json({ message: "News successfully approved." });
      })
      .catch((err) => {
        return res.status(400).json({ err: "Error approving the news." });
      });
  });
};
/**
 * @description fetch all news added by users
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getUserNews = (req, res) => {
  return db.News.findAll({ include: db.Company, where: { approved: false } })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the news." });
    });
};
