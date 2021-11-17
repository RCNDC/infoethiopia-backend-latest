const { join } = require("path");
const fs = require("fs");
const db = require("../models");

const uploadImage = require("../router/upload.helper");
exports.addCompany = async (req, res) => {
  try {
    await uploadImage(req, res);
    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }
    const {
      name,
      description,
      city,
      state,
      street,
      kebele,
      lat,
      long,
      wereda,
      subCity,
      catagoryId,
    } = req.body;

    const imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;

    const point = { type: "Point", coordinates: [lat, long] };
    return db.Company.findOne({ where: { name } })
      .then((result) => {
        if (result) {
          return res
            .status(400)
            .json({ err: "There is already a company with this name." });
        }
        return db.Company.create({
          name,
          description,
          catagoryId,
          logo: imageURI,
        })
          .then((result) => {
            return db.Address.create({
              city,
              state,
              street_no: street,
              kebele,
              wereda,
              sub_city: subCity,
              location: point,
              companyId: result.Id,
            })
              .then(() => {
                return res.json({ message: "Company successfully created." });
              })
              .catch((err) => {
                console.log(err);
                return res
                  .status(400)
                  .json({ err: "Error creating the company." });
              });
          })
          .catch((err) => {
            console.log(err);
            return res.status(400).json({ err: "Error creating the company." });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({ err: "Error finding the company." });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      err,
    });
  }
};
exports.addCompanyFromFile = async (req, res) => {
  let message = null;

  for (let index = 0; index < req.body.length; index++) {
    const body = req.body[index];
    // req.body.forEach((body) => {
    const {
      name,
      description,
      city,
      state,
      street,
      kebele,
      lat,
      long,
      wereda,
      subCity,
    } = body;
    const point = { type: "Point", coordinates: [lat, long] };
    return db.Company.findOne({ where: { name } })
      .then((result) => {
        if (result) {
          message = res.status(400).json({
            err: `There is already a company with name ${name}.`,
          });
        }
        return db.Company.create({
          name,
          description,
        })
          .then((result) => {
            return db.Address.create({
              city,
              state,
              street_no: street,
              kebele,
              wereda,
              sub_city: subCity,
              location: point,
              companyId: result.Id,
            })
              .then(() => {
                message = res.json({
                  message: "Company successfully created.",
                });
              })
              .catch((err) => {
                message = res
                  .status(400)
                  .json({ err: `Error creating the company ${name}.` });
              });
          })
          .catch((err) => {
            message = res
              .status(400)
              .json({ err: `Error creating the company ${name}.` });
          });
      })
      .catch((err) => {
        message = res.status(400).json({ err: "Error finding the company." });
      });
  }
  return message;
};
exports.deleteCompany = (req, res) => {
  const Id = req.params.Id;
  return db.Company.destroy({ where: { Id } })
    .then(() => {
      return res.json({ message: "Company successfully deleted." });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the company." });
    });
};
exports.updateCompany = async (req, res) => {
  try {
    let image = true;
    await uploadImage(req, res);
    if (req.file == undefined) {
      image = false;
    }
    const {
      name,
      description,
      city,
      state,
      street,
      kebele,
      lat,
      long,
      wereda,
      subCity,
      catagoryId,
    } = req.body;
    const Id = req.params.Id;
    const point = { type: "Point", coordinates: [lat, long] };

    return db.Company.findOne({ where: { name } })
      .then((result) => {
        if (result && result.Id != Id) {
          return res
            .status(400)
            .json({ err: "There is already a company with this name." });
        }
        return db.Company.findOne({
          include: { model: db.Address },
          where: { Id },
        }).then((result) => {
          if (!result) {
            return res.status(400).json({ err: "Couldn't find the company." });
          }
          let imageURI = undefined;
          if (image) {
            if (result.logo) {
              fs.unlink(
                join(
                  __filename,
                  `../../uploads/images/${result.logo.split("images")[1]}`
                ),
                (err) => {
                  if (err) throw new Error(err);
                }
              );
            }
            imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
          }
          return result
            .update({
              name,
              description,
              logo: imageURI,
              catagoryId,
            })
            .then(() => {
              return result.Address.update({
                city,
                state,
                street_no: street,
                kebele,
                wereda,
                sub_city: subCity,
                location: point,
              }).then(() => {
                return res.json({ message: "Company successully updated." });
              });
            });
        });
      })
      .catch((err) => {
        message = res.status(400).json({ err: "Error finding the company." });
      });
  } catch (err) {
    return res.status(400).json({ err });
  }
};

exports.viewAllCompany = (req, res) => {
  return db.Company.findAll({
    include: [{ model: db.Address }, { model: db.Catagory }],
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the companies." });
    });
};
exports.searchCompany = (req, res) => {
  const name = req.params.name;
  return db.Company.findOne({
    include: [
      { model: db.Catagory },
      { model: db.Fax },
      { model: db.OfficeNumber },
      { model: db.Address },
    ],
    where: { name },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the company." });
    });
};
exports.searchCompanyById = (req, res) => {
  const Id = req.params.Id;
  return db.Company.findOne({
    include: [
      { model: db.Catagory },
      { model: db.Fax },
      { model: db.OfficeNumber },
      { model: db.PhoneNumber },
      { model: db.SocialMedia },
      { model: db.Address },
    ],
    where: { Id },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the companies." });
    });
};
exports.saveRecentCompany = (req, res) => {
  const { companyId, callCenterId } = req.body;
  return db.RecentCompany.findOne({
    where: { companyId },
  })
    .then((result) => {
      if (!result) {
        return db.RecentCompany.create({ companyId, callCenterId })
          .then(() => {
            return;
          })
          .catch((err) => {
            console.log(err);
            return res.status(400).json({ err: "Error creating the history" });
          });
      }
      return result
        .destroy()
        .then(() => {
          return db.RecentCompany.create({ companyId: Id })
            .then(() => {
              return;
            })
            .catch((err) => {
              console.log(err);
              return res
                .status(400)
                .json({ err: "Error creating the history" });
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({ err: "Error deleting the history" });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ err: "Error finding the record" });
    });
};
exports.viewRecentCompany = (req, res) => {
  const { Id } = req.params;
  return db.RecentCompany.findAll({
    include: db.Company,
    order: db.sequelize.literal("createdAt DESC"),
    where: { callCenterId: Id },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the companies." });
    });
};
