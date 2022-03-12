const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");
const { Op } = require("sequelize");
/**
 * @description add category
 * @param {*} req
 * @param {*} req.body
 * @param {String} req.body.name
 * @param {String} req.body.parent
 * @param {File} req.file
 * @param {*} res
 * @returns
 */
exports.addCatagory = async (req, res) => {
  try {
    await uploadImage(req, res);
    if (req.file == undefined) {
      return res.status(400).json({ err: "Please upload a file!" });
    }
    const { name, parent } = req.body;
    //if parent is equal to null we are adding a main category and a sub category if not null
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
    if (err.message) return res.status(400).json({ err: err.message });

    return res.status(500).send({
      err,
    });
  }
};
/**
 * @description delete category
 * @param {*} req
 * @param {*} req.body
 * @param {String} req.body.catagoryId
 * @param {*} res
 * @returns
 */
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
/**
 * @description update category detail
 * @param {*} req
 * @param {Object} req.body
 * @param {String} req.body.name
 * @param {String} req.body.parent
 * @param {Object} req.params
 * @param {File} req.file
 * @param {String} req.params.Id
 * @param {*} res
 * @returns
 */
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
          // delete the current image if it is updated
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
    if (err.message) return res.status(400).json({ err: err.message });

    return res.status(500).send({
      err,
    });
  }
};

/**
 * @description fetch all categories with parentId equals to null
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
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
      return res.json({ err: "Error finding catagories." });
    });
};
/**
 * @description fetch all categories
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
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
      console.log(err);
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
/**
 * @description fetch all categories with their sub categories
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.viewAllCatagoriesWithChildren = (req, res) => {
  return db.Catagory.findAll({
    include: {
      model: db.Catagory,
      as: "children",
    },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
/**
 * @description fetch all sub categories of a specific category
 * @param {Object} req
 * @param {Object} req.body
 * @param {String} req.body.Id
 * @param {*} res
 * @returns {Array}
 */
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
/**
 * @description users view all sub categories of a specific category by the category name
 * @param {Object} req
 * @param {Object} req.params
 * @param {String} req.params.name
 * @param {*} res
 * @returns {Array}
 */
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
/**
 * @description fetch all approved companies in a specific category
 * @param {Object} req
 * @param {Object} req.params
 * @param {String} req.params.Id
 * @param {*} res
 * @returns {Array}
 */
exports.viewCompaniesList = (req, res) => {
  const Id = req.params.Id;

  return db.Company.findAll({
    where: { [Op.and]: [{ approved: true }, { catagoryId: Id }] },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};

/**
 * @description users fetch all approved companies in a specific category with pagination
 * @param {Object} req
 * @param {Object} req.params
 * @param {String} req.params.Id
 * @param {String} req.params.page
 * @param {String} req.params.limit
 * @param {*} res
 * @returns {Array}
 */
exports.viewCompaniesListWithPage = (req, res) => {
  const Id = req.params.Id;
  const page = req.params.page;
  const limit = parseInt(req.params.limit);
  return db.Company.findAll({
    limit,
    offset: limit * page,
    include: [
      {
        model: db.PhoneNumber,
        where: {
          [Op.or]: [
            { phone_no: { [Op.ne]: "" } },
            { phone_no: { [Op.ne]: null } },
          ],
        },
      },
    ],

    where: { [Op.and]: [{ approved: true }, { catagoryId: Id }] },
  })
    .then((result) => {
      return db.Company.count({
        include: [
          {
            model: db.PhoneNumber,
            where: {
              [Op.or]: [
                { phone_no: { [Op.ne]: "" } },
                { phone_no: { [Op.ne]: null } },
              ],
            },
          },
        ],
        where: { [Op.and]: [{ approved: true }, { catagoryId: Id }] },
      }).then((records) => {
        return res.json({ result, count: records });
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
/**
 * @description fetch all approved companies in a specific category by using the category name
 * @param {Object} req
 * @param {Object} req.params
 * @param {String} req.params.Name
 * @param {*} res
 * @returns {Array}
 */
exports.viewCompaniesListByName = (req, res) => {
  const Name = req.params.Name;
  return db.Company.findAll({
    include: [
      {
        model: db.Catagory,
        where: {
          name: Name,
        },
      },
    ],
    where: { approved: true },
  })
    .then((result) => {
      console.log(result);
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
/**
 * @description users fetch all approved companies in a specific category with pagination  by using the category name
 * @param {Object} req
 * @param {Object} req.params
 * @param {String} req.params.Name
 * @param {String} req.params.page
 * @param {String} req.params.limit
 * @param {*} res
 * @returns {Array}
 */
exports.viewCompaniesListByNameWithPagination = (req, res) => {
  const Name = req.params.Name;
  const page = req.params.page;
  const limit = parseInt(req.params.limit);
  return db.Company.findAll({
    limit,
    offset: limit * page,
    include: [
      {
        model: db.PhoneNumber,
        where: {
          [Op.or]: [
            { phone_no: { [Op.ne]: "" } },
            { phone_no: { [Op.ne]: null } },
          ],
        },
      },

      {
        model: db.Catagory,
        where: {
          name: Name,
        },
      },
    ],
    where: { approved: true },
  })
    .then((result) => {
      return db.Company.count({
        include: [
          {
            model: db.Catagory,
            where: {
              name: Name,
            },
          },
          {
            model: db.PhoneNumber,
            where: {
              [Op.or]: [
                { phone_no: { [Op.ne]: "" } },
                { phone_no: { [Op.ne]: null } },
              ],
            },
          },
        ],
        where: { approved: true },
      }).then((records) => {
        return res.json({ result, count: records });
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding catagories." });
    });
};
/**
 * @description get total number of main categories
 * @param {*} req
 * @param {*} res
 * @returns {Int}
 */
exports.totalMainCatagory = (req, res) => {
  return db.Catagory.count({ where: { parentId: null } }).then((result) => {
    return res.json({ result });
  });
};
/**
 * @description get total number of sub categories
 * @param {*} req
 * @param {*} res
 * @returns {Int}
 */
exports.totalSubCatagories = (req, res) => {
  return db.Catagory.count({ where: { parentId: { [Op.ne]: null } } }).then(
    (result) => {
      return res.json({ result });
    }
  );
};
