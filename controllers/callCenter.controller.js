const db = require("../models");
const bcrypt = require("bcrypt");
let generator = require("generate-password");

/**
 * @description add a new call center
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.firstName
 * @param {string} req.body.lastName
 * @param {string} req.body.middleName
 * @param {string} req.body.phone
 * @param {string} req.body.email
 * @param {string} req.body.city
 * @param {string} req.body.wereda
 * @param {string} req.body.subCity
 * @param {*} res
 * @returns {object}
 */
exports.addCallCenter = async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    email,
    phone,
    city,
    wereda,
    subCity,
  } = req.body;
  //generate username for the call center
  let username = generator.generate({
    length: 4,
    numbers: true,
  });
  // generate password for the call center
  username = `${firstName}-${username}`;
  let pass = generator.generate({
    length: 8,
    numbers: true,
  });
  // hash the password
  password = await bcrypt.hash(pass, 12);

  //create call center
  return db.Staff.findOne({ where: { email } })
    .then((result) => {
      if (result) return res.status(400).json({ err: "Email already exists." });
      return db.Staff.create({
        firstName,
        lastName,
        middleName,
        email,
        phone,
        city,
        wereda,
        subCity,
        username,
        password,
        role: 2,
      })
        .then(() => {
          return res.json({
            message: `Seller successfully created. Your password is ${pass}`,
          });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error adding a call center." });
        });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the call center." });
    });
};

/**
 * @description delete the call center
 * @param {*} req
 * @param {*} req.body
 * @param {String} req..callCenterId
 * @param {*} res
 * @returns
 */
exports.deleteCallCenter = (req, res) => {
  const { callcenterId } = req.body;

  return db.Staff.destroy({ where: { Id: callcenterId } })
    .then(() => {
      return res.json({
        message: "You have successfully deleted the call center.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the call center." });
    });
};
/**
 * @description update call center details
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.firstName
 * @param {string} req.body.lastName
 * @param {string} req.body.middleName
 * @param {string} req.body.phone
 * @param {string} req.body.email
 * @param {string} req.body.city
 * @param {string} req.body.wereda
 * @param {string} req.body.subCity
 * @param {string} req.body.username
 * @param {string} req.body.password
 * @param {string} req.body.Id
 * @param {*} res
 * @returns {object}
 */
exports.updatecallCenter = async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    email,
    phone,
    city,
    wereda,
    subCity,
    username,
    password,
    Id,
  } = req.body;
  let pass = undefined;
  let user = username || "";
  if (password) pass = await bcrypt.hash(password, 12);
  return db.Staff.findOne({ where: { username: user } })
    .then((record) => {
      if (!record) {
        return db.Staff.update(
          {
            firstName,
            lastName,
            middleName,
            email,
            phone,
            city,
            wereda,
            subCity,
            username,
            password: pass,
          },
          { where: { Id } }
        )
          .then(() => {
            return res.json({
              message: "You have successfully updated a call center.",
            });
          })
          .catch((err) => {
            return res
              .status(400)
              .json({ err: "Error updating the call center." });
          });
      } else {
        return res.status(400).json({ err: "Username taken." });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ err: "Error finding the call center." });
    });
};
/**
 * @description fetch all call centers
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.viewCallCenters = (req, res) => {
  return db.Staff.findAll({ where: { role: 2 } })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err });
    });
};
