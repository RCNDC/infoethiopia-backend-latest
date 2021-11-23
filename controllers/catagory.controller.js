const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");

exports.addCatagory = async (req, res) => {
  try {
    await uploadImage(req, res);
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    const { name, parent } = req.body;

    const parentId = parent != "null" ? parent : null;
    const imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;

    return db.Catagory.findOne({ where: { name } }).then((result) => {
      if (result) {
        return res
          .status(400)
          .json({ err: "There is already a catagory with this name." });
      }
      return db.Catagory.create({
        name,
        image: imageURI,
        parentId,
      }).then(() => {
        return res.json({ message: "Catagory successfully created." });
      });
    });
  } catch (err) {
    return res.status(500).send({
      err,
    });
  }
};

exports.deleteCatagory = (req, res) => {
  const { catagoryId } = req.body;
  return db.Catagory.destroy({ where: { Id: catagoryId } })
    .then(() => {
      return res.json({ message: "Catagory successfully deleted." });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the catagory." });
    });
};
exports.updateCatagory = async (req, res) => {
  try {
    let image = true;
    await uploadImage(req, res);
    if (req.file == undefined) {
      image = false;
    }
    const { name, parent } = req.body;
    const { Id } = req.params;
    const parentId = parent != "null" ? parent : null;
    return db.Catagory.findOne({ where: { name } }).then((result) => {
      if (result && result.Id != Id) {
        return res
          .status(400)
          .json({ err: "There is already a catagory with this name." });
      }
      return db.Catagory.findOne({
        where: { Id },
      }).then(async (result) => {
        if (!result) {
          return res.status(400).json({ err: "Error finding the catagory" });
        }
        let imageURI = undefined;

        if (image) {
          fs.unlink(
            join(
              __filename,
              `../../uploads/images/${result.image.split("images")[1]}`
            ),
            (err) => {
              if (err) throw new Error(err);
            }
          );

          imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
        }
        return result.update({ name, image: imageURI, parentId }).then(() => {
          return res.json({ message: "Catagory successfully updated." });
        });
      });
    });
  } catch (err) {
    return res.status(500).send({
      err,
    });
  }
};
exports.viewMainCatagories = (req, res) => {
  return db.Catagory.findAll({
    include: [
      { model: db.Company },
      {
        model: db.Catagory,
        as: "children",
        include: {
          model: db.Catagory,
          as: "children",
          include: { model: db.Catagory, as: "children" },
        },
      },
    ],
    where: { parentId: null },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
exports.viewAllCatagories = (req, res) => {
  return db.Catagory.findAll({
    include: {
      model: db.Catagory,
      as: "parent",
      include: {
        model: db.Catagory,
        as: "parent",
        include: {
          model: db.Catagory,
          as: "parent",
          include: { model: db.Catagory, as: "parent" },
        },
      },
    },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
exports.viewSubCatagories = (req, res) => {
  const { Id } = req.body;
  return db.Catagory.findAll({
    where: { parentId: Id },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
exports.userViewSubCatagories = (req, res) => {
  const { name } = req.params;
  return db.Catagory.findAll({
    include: [
      { model: db.Company },
      {
        model: db.Catagory,
        as: "children",
        include: {
          model: db.Catagory,
          as: "children",
          include: { model: db.Catagory, as: "children" },
        },
      },
    ],
    where: { name },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
exports.viewCompaniesList = (req, res) => {
  const Id = req.params.Id;
  return db.Catagory.findOne({
    include: [
      { model: db.Company },
      {
        model: db.Catagory,
        as: "children",
        include: [ 
          { model: db.Company },
          {
            model: db.Catagory,
            as: "children",
            include: { model: db.Company },
          },
        ],
      },
    ],
    where: { Id },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
exports.viewCompaniesListByName = (req, res) => {
  const Name = req.params.Name;
  return db.Catagory.findOne({
    include: [
      { model: db.Company },
      {
        model: db.Catagory,
        as: "children",
        include: [
          { model: db.Company },
          {
            model: db.Catagory,
            as: "children",
            include: { model: db.Company },
          },
        ],
      },
    ],
    where: { Name },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
