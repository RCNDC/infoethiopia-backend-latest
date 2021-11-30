const db = require("../models");
const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
exports.getAllAds = (req, res) => {
  return db.Ad.findAll({ include: db.AdImage })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.json({ err: "Error geting the ads. " });
    });
};
exports.deleteAd = async (req, res) => {
  try {
    const Id = req.params.Id;
    return db.Ad.findOne({ where: { Id } })
      .then((result) => {
        if (!result)
          return res.status(400).json({ err: "Error finding the ad." });
        let filePath = join(
          __dirname,
          `../../uploads/images/${result.imageURI.split("images")[1]}`
        );
        return result
          .destroy()
          .then(async () => {
            await fs.unlink(filePath, async (err) => {
              if (err) throw new Error(err);
              return;
            });
            return res.json({ message: "Ad successfully deleted." });
          })
          .catch((err) => {
            return res.status(400).json({ err: "Error deleting the ad" });
          });
      })
      .catch((err) => {
        return res.status(400).json({ err: "Error finding the ad." });
      });
  } catch (err) {
    console.log(err);
  }
};
exports.addAd = async (req, res) => {
  try {
    await uploadImage(req, res);
    if (req.file == undefined) {
      return res.status(400).json({ err: "Please upload an profile picture." });
    }
    let imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
    const { adSpace } = req.body;
    return db.Ad.create({ adSpace, imageURI })
      .then(() => {
        return res.json({ message: "Ad successfully added." });
      })
      .catch((err) => {
        return res.status(400).json({ err: "Error creating the ads. " });
      });
  } catch (err) {
    return res.status(400).json({ err: "Error creating the ads. " });
  }
};
exports.deleteAdSpace = (req, res) => {
  const Id = req.params.Id;
  return db.Ad.findOne({ where: { Id } })
    .then((result) => {
      if (!result)
        return res.status(400).json({ err: "Error finding the ad." });
      return result
        .destroy()
        .then(() => {
          return res.json({ message: "Ad successfully deleted." });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error deleting the ad" });
        });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the ad." });
    });
};
