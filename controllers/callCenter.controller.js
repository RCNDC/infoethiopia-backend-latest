const db = require("../models");
const bcrypt = require("bcrypt");
let generator = require("generate-password");

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

  let username = generator.generate({
    length: 4,
    numbers: true,
  });
  username = `${firstName}-${username}`;
  let pass = generator.generate({
    length: 8,
    numbers: true,
  });
  password = await bcrypt.hash(pass, 12);
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
exports.viewCallCenters = (req, res) => {
  return db.Staff.findAll({ where: { role: 2 } })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err });
    });
};
