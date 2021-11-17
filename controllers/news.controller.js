const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");

exports.AddNews = async (req, res) => {
  try {
    await uploadImage(req, res);
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
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
    console.log(err);
    return res.status(500).send({
      err,
    });
  }
};
exports.getNews = (req, res) => {
  return db.News.findAll()
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      
      return res.status(400).json({ err: "Error finding the news." });
    });
};
exports.deleteNews = (req, res) => {
  const { Id } = req.params;
  console.log("id",Id)
  return db.News.destroy({ where: { Id } })
    .then((result) => {
      return res.json({ message: "News successfully deleted." });
    })
    .catch((err) => {
      console.log(err)
      return res.status(400).json({ err: "Error deleting the news." });
    });
};
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
    return res.status(500).send({
      err,
    });
  }
};
