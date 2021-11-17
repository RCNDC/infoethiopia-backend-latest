const db = require("../models");

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
