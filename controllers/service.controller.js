const db = require("../models");
/**
 * @description fetch all service of a specific company
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} res
 * @returns
 */
exports.viewService = (req, res) => {
  const Id = req.params.Id;
  return db.Service.findAll({ where: { companyId: Id } })
    .then((result) => {
      return res.json({ result });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error finding the services." });
    });
};
/**
 * @description delete companies service
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} res
 * @returns
 */
exports.deleteService = (req, res) => {
  const Id = req.params.Id;
  return db.Service.destroy({ where: { Id } })
    .then((result) => {
      return res.json({ message: "Service successfully deleted." });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error deleting the services." });
    });
};
/**
 * @description update companies service detail
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} req.body
 * @param {String} req.body.name
 * @param {*} res
 * @returns
 */
exports.updateService = (req, res) => {
  const Id = req.params.Id;
  const { name } = req.body;
  return db.Service.findOne({ where: { Id } })
    .then((result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the services." });
      }
      return result
        .update({ name })
        .then((result) => {
          return res.json({ message: "Service successfully updated." });
        })
        .catch(() => {
          return res.status(400).json({ err: "Error updating the services." });
        });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error updating the services." });
    });
};
/**
 * @description add service to a apecific company
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} req.body
 * @param {String} req.body.name
 * @param {*} res
 * @returns
 */
exports.addservice = (req, res) => {
  const Id = req.params.Id;
  const { name } = req.body;
  return db.Service.create({ name, companyId: Id })
    .then((result) => {
      return res.json({ message: "Service successfully added." });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error adding the services." });
    });
};
