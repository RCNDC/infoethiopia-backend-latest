const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");
const { sendMail, buildStatusEmail } = require("../utils/mailer");
const multer = require("multer");
const uploadLicenceImage = require("../router/uploadlicence.helper");

const buildImageUrl = (filename) => {
  const base = (process.env.BASE_URL || "").replace(/\/+$/, "");
  if (!base) return `/api/images/${filename}`;
  return `${base}/api/images/${filename}`;
};

const normalizeHeadingImageUrl = (url) => {
  if (!url) return url;
  if (url.includes("/api/images/")) return url;
  if (url.includes("/images/")) return url.replace("/images/", "/api/images/");
  return url;
};

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
    const imageURI = req.file ? buildImageUrl(req.file.filename) : null;
    const { title, body, author } = req.body;
    return db.News.create({
      title,
      headingImage: imageURI,
      body,
      author,
      approved: true,
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
  return db.News.findAll({ where: { approved: true }, order: [["createdAt", "DESC"]] })
    .then((result) => {
      const normalized = result.map((item) => {
        const data = item.toJSON ? item.toJSON() : item;
        return { ...data, headingImage: normalizeHeadingImageUrl(data.headingImage) };
      });
      return res.json({ result: normalized });
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
    where: { approved: true },
    order: [["createdAt", "DESC"]],
  })
    .then((result) => {
      const normalized = result.map((item) => {
        const data = item.toJSON ? item.toJSON() : item;
        return { ...data, headingImage: normalizeHeadingImageUrl(data.headingImage) };
      });
      return db.News.count({ where: { approved: true } }).then((records) => {
        return res.json({ result: normalized, count: records });
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
  return db.CompaniesNews.findAll({
    include: db.Company,
    where: { approved: true },
    order: [["createdAt", "DESC"]],
  })
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
  return db.CompaniesNews.findAll({
    limit,
    offset: limit * page,
    include: db.Company,
    where: { approved: true },
    order: [["createdAt", "DESC"]],
  })
    .then((result) => {
      return db.CompaniesNews.count({ where: { approved: true } }).then(
        (records) => {
          return res.json({ result, count: records });
        }
      );
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the company news." });
    });
};

/**
 * @description disapprove/delete news
 * @param {*} req
 * @param {*} res
 * @returns {String}
 */
exports.deleteNews = async (req, res) => {
  const { Id } = req.params;
  try {
    // Try News table first (general news)
    let news = await db.News.findOne({ where: { Id } });
    if (news) {
      await news.destroy();
      return res.json({ message: "News successfully deleted." });
    }

    // Try CompaniesNews table (company requests)
    news = await db.CompaniesNews.findOne({ where: { Id } });
    if (!news) {
      return res.status(400).json({ err: "News post not found." });
    }

    const company = await db.Company.findOne({
      where: { Id: news.companyID },
    });

    if (company && company.email) {
      try {
        await sendMail({
          from: "InfoEthiopia News <news@infoethiopia.net>",
          to: company.email,
          subject: "News Post Disapproved",
          html: buildStatusEmail({
            type: "news",
            approved: false,
            title: news.Title || news.title,
            companyName: company.name,
          }),
          replyTo: "contact@infoethiopia.net",
        });
      } catch (mailErr) {
        console.error("News disapproval email failed:", mailErr);
      }
    }

    await news.update({ approved: false, status: "rejected" });
    return res.json({ message: "News request rejected/disapproved." });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ err: "Error processing the request." });
  }
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
    return db.News.findOne({ where: { Id } }).then(async (result) => {
      if (!result) {
        // Check if it's a company news item
        const companyNews = await db.CompaniesNews.findOne({ where: { Id } });
        if (companyNews) {
          // If editing company news, we should probably update that table
          await companyNews.update({
            Title: title,
            Body: body,
            Author: author,
          });
          return res.json({ message: "Company news successfully updated." });
        }
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

        imageURI = buildImageUrl(req.file.filename);
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
    await uploadImage(req, res);
    const { title, body, author, companyEmail, companyName, companyDescription, companyLogo } = req.body;

    // Safety check to prevent crash on null values
    if (!title || !body || !author) {
      return res.status(400).json({ err: "Title, Body and Author are required." });
    }

    const Id = req.params.Id;
    let companyId = null;

    if (companyEmail) {
      const normalizedEmail = String(companyEmail).trim().toLowerCase();
      const [company] = await db.Company.findOrCreate({
        where: { email: normalizedEmail },
        defaults: {
          name: companyName || normalizedEmail,
          description: companyDescription || null,
          logo: companyLogo || null,
          email: normalizedEmail,
          approved: true,
        },
      });
      companyId = company.Id;
    } else if (Id && Id !== "self") {
      companyId = Id;
    }

    const imageURI = req.file ? buildImageUrl(req.file.filename) : null;

    return db.CompaniesNews.create({
      Title: title,
      Body: body,
      Author: author,
      companyID: companyId,
      headingImage: imageURI,
      approved: null,
      status: "pending",
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
exports.adminApproveNews = async (req, res) => {
  const { Id } = req.params;
  try {
    const result = await db.CompaniesNews.findOne({ where: { Id } });
    if (!result) {
      return res.status(400).json({ err: "Error finding the news request." });
    }

    // Mark as approved in the same table
    await result.update({ approved: true, status: "approved" });

    const company = await db.Company.findOne({
      where: { Id: result.companyID },
    });
    if (company && company.email) {
      try {
        await sendMail({
          from: "InfoEthiopia News <news@infoethiopia.net>",
          to: company.email,
          subject: "News Post Approved",
          html: buildStatusEmail({
            type: "news",
            approved: true,
            title: result.Title || result.title,
            companyName: company.name,
          }),
          replyTo: "contact@infoethiopia.net",
        });
      } catch (mailErr) {
        console.error("News approval email failed:", mailErr);
      }
    }

    return res.json({
      message: "News successfully approved.",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      err: err.message || "Error approving news.",
    });
  }
};

/**
 * @description fetch all news added by users
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getUserNews = async (req, res) => {
  try {
    const { email } = req.query;
    if (email) {
      const company = await db.Company.findOne({ where: { email } });
      if (!company) return res.json({ result: [] });
      const result = await db.CompaniesNews.findAll({
        where: { companyID: company.Id },
        order: [["createdAt", "DESC"]],
      });
      return res.json({ result });
    }

    // Admin view: only pending (approved is null)
    const result = await db.CompaniesNews.findAll({
      include: db.Company,
      where: { approved: null },
      order: [["createdAt", "DESC"]],
    });
    return res.json({ result });
  } catch (err) {
    return res.status(400).json({ err: "Error finding the news requests." });
  }
};

/**
 * @description company update news (pending company news)
 */
exports.companyUpdateNews = async (req, res) => {
  try {
    const { title, body, author, companyEmail } = req.body;
    const { Id } = req.params;
    if (!companyEmail) {
      return res.status(400).json({ err: "Company email is required." });
    }

    const company = await db.Company.findOne({ where: { email: companyEmail } });
    if (!company) {
      return res.status(400).json({ err: "Company not found." });
    }

    const news = await db.CompaniesNews.findOne({ where: { Id, companyID: company.Id } });
    if (!news) {
      return res.status(400).json({ err: "News post not found." });
    }

    await news.update({
      Title: title,
      Body: body,
      Author: author,
      approved: null,
      status: "pending",
    });

    return res.json({ message: "News post updated." });
  } catch (err) {
    return res.status(500).json({ err: "Error updating news post." });
  }
};

/**
 * @description company delete news (hard delete)
 */
exports.companyDeleteNews = async (req, res) => {
  const { Id } = req.params;
  const { email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({ err: "Company email is required." });
    }
    const company = await db.Company.findOne({ where: { email } });
    if (!company) {
      return res.status(400).json({ err: "Company not found." });
    }

    const news = await db.CompaniesNews.findOne({ where: { Id, companyID: company.Id } });
    if (!news) {
      return res.status(400).json({ err: "News post not found." });
    }

    await news.destroy();
    return res.json({ message: "News post deleted." });
  } catch (err) {
    return res.status(500).json({ err: "Error deleting news post." });
  }
};

/**
 * @description Admin approve company news - updates status to "approved"
 */
exports.approveCompanyNews = (req, res) => {
  const Id = req.params.Id;
  return db.CompaniesNews.update(
    { status: "approved", approved: true },
    { where: { Id } }
  )
    .then(() => {
      return res.json({ message: "News approved successfully." });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error approving news." });
    });
};

/**
 * @description Admin reject company news - updates status to "rejected"
 */
exports.rejectCompanyNews = (req, res) => {
  const Id = req.params.Id;
  return db.CompaniesNews.update(
    { status: "rejected", approved: false },
    { where: { Id } }
  )
    .then(() => {
      return res.json({ message: "News rejected successfully." });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error rejecting news." });
    });
};

/**
 * @description Get ALL company news for admin review (regardless of status)
 */
exports.getAllCompanyNewsForAdmin = (req, res) => {
  return db.CompaniesNews.findAll({
    include: db.Company,
    order: [["createdAt", "DESC"]],
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error fetching company news." });
    });
};


