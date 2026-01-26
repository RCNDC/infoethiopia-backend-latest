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
    const imageURI = req.file ? `${process.env.BASE_URL}/images/${req.file.filename}` : null;
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

exports.getNewsWithPage = (req, res) => {
  const page = req.params.page;
  const limit = parseInt(req.params.limit);
  return db.News.findAll({
    limit,
    offset: limit * page,
    include: db.Company,
    where: { approved: true },
    order: [["createdAt", "DESC"]],
  })
    .then((result) => {
      return db.News.count({ where: { approved: true } }).then((records) => {
        return res.json({ result, count: records });
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the news." });
    });
};

/**
 * @description fetch all approved company news
 */
exports.getApprovedCompanyNews = (req, res) => {
  return db.ApprovedCompanyNews.findAll({ include: db.Company, where: { Approved: 1 } })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the company news." });
    });
};

exports.getApprovedCompanyNewsWithPage = (req, res) => {
  const page = req.params.page;
  const limit = parseInt(req.params.limit);
  return db.ApprovedCompanyNews.findAll({
    limit,
    offset: limit * page,
    include: db.Company,
    where: { Approved: 1 },
    order: [["createdAt", "DESC"]],
  })
    .then((result) => {
      return db.ApprovedCompanyNews.count({ where: { Approved: 1 } }).then((records) => {
        return res.json({ result, count: records });
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the company news." });
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
  // Try deleting from both or just one? Since this is for company news workflow, 
  // we primarily care about CompaniesNews (pending) or ApprovedCompanyNews.
  // We'll try to delete from CompaniesNews first, then ApprovedCompanyNews if not found.
  return db.CompaniesNews.destroy({ where: { Id } })
    .then((result) => {
      if (result) return res.json({ message: "News request successfully deleted." });

      return db.ApprovedCompanyNews.destroy({ where: { Id } })
        .then((result2) => {
          return res.json({ message: "News post successfully deleted." });
        });
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
      let imageURI = result.headingImage;

      if (image) {
        // delete the previous image if it's updated
        if (result.headingImage) {
          fs.unlink(
            join(
              __filename,
              `../../uploads/images/${result.headingImage.split("images")[1]}`
            ),
            (err) => {
              if (err) console.log("Unlink error:", err);
            }
          );
        }

        imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
      }
      return result
        .update({ title, headingImage: imageURI, author, body })
        .then(() => {
          return res.json({ message: "News successfully updated." });
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
 * @param {*} res
 * @returns {String}
 */
exports.userAddNews = async (req, res) => {
  try {
    const { title, body, author } = req.body;
    const Id = req.params.Id;
    return db.CompaniesNews.create({
      Title: title,
      Body: body,
      Author: author,
      companyID: Id,
      approved: false,
    }).then(() => {
      return res.json({ message: "News request successfully submitted for approval." });
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
  return db.CompaniesNews.findOne({ where: { Id } }).then((result) => {
    if (!result)
      return res.status(400).json({ err: "Error finding the news request." });

    return db.ApprovedCompanyNews.create({
      Id: result.Id,
      Title: result.Title || result.title,
      Body: result.Body || result.body,
      Author: result.Author || result.author,
      Approved: 1,
      companyId: result.companyID
    }).then(() => {
      return result.destroy().then(() => {
        return res.json({ message: "News successfully approved and moved to Approved News list." });
      });
    }).catch(err => {
      console.log(err);
      return res.status(400).json({ err: err.message || "Error moving news to Approved News table." });
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
  return db.CompaniesNews.findAll({ include: db.Company, where: { approved: false } })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the news requests." });
    });
};
