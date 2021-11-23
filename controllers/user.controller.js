const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const transporter = nodemailer.createTransport({
  host: "rcndc.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS,
  },
});
exports.updateProfilePicture = async (req, res) => {
  try {
    await uploadImage(req, res);
    console.log(req.file);
    if (req.file == undefined) {
      return res.status(400).json({ err: "Please upload an profile picture." });
    }
    const Id = req.user.Id;

    return db.User.findOne({
      where: { Id },
    }).then(async (result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the user" });
      }

      if (result.profilePicture) {
        fs.unlink(
          join(
            __filename,
            `../../uploads/images/${result.profilePicture.split("images")[1]}`
          ),
          (err) => {
            if (err) throw new Error(err);
          }
        );
      }

      let profileURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
      return result.update({ profilePicture: profileURI }).then(() => {
        return res.json({ result });
      });
    });
  } catch (err) {
    return res.status(500).send({
      err,
    });
  }
};
exports.updateProfile = (req, res) => {
  const { firstName, lastName, middleName, phone_no } = req.body;
  const Id = req.user.Id;

  return db.User.findOne({ where: { Id } })
    .then((result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the user." });
      }
      return result
        .update({ firstName, lastName, middleName, phone_no })
        .then(() => {
          return res.json({ message: "Profile successfully updated." });
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({ err: "Error updating the profile." });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ err: "Error updating the profile." });
    });
};
exports.preChangePassword = async (req, res) => {
  const user = req.profile;

  const { email } = req.body;
  if (user.email == email) {
    let code = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);
    const info = await transporter.sendMail({
      from: process.env.GMAIL, // sender address
      to: email, // list of receivers
      subject: "Change password account verification", // Subject line
      text: `Wellcome, This is the verification code: ${code}`, // plain text body
      html: `<style>@import url('https://fonts.googleapis.com/css2?family=Cabin&display=swap');</style>
<div style="border: 1px solid rgba(244,151,3,.8); border-radius: 5px; padding: 30px;">&nbsp; &nbsp;&nbsp; &nbsp;
  <div style="text-align: center; font-family: 'Cabin', sans-serif; margin: auto;">
    <img style="display: block; margin-left: auto; margin-right: auto;" src="https://apiinfoethiopia.rcndc.com/images/logo.png" alt="" height="150">
    <div style="color: #143d59; font-size: 14px; margin: 20px;">
      <strong>
        <strong>
          <span style="letter-spacing: 4px;">THANKS FOR CHOOSING US!</span>
        </strong>
      </strong>
    </div>
    <div style="margin: 0px 60px 20px; height: 0.2px; background-color: rgba(244,151,3,.8);">&nbsp;</div>
    <div style="color: #143d59; font-size: 20px; margin: 20px 0px 30px;">Wellcome.</div>
    <span style="color: #143d59;">
      <span style="font-size: 20px; ">This is your verification code: ${code}.</span>
    </span>
  </div>
</div>`,
    });

    if (info.accepted.length > 0) {
      return user
        .update({ code })
        .then(() => {
          return res.json({
            message: `Change password verification code is sent to ${email}, Check you account. `,
          });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Something went wrong." });
        });
    } else {
      return res
        .status(400)
        .json({ err: "Error sending the verification code." });
    }
  } else {
    return res
      .status(400)
      .json({ err: "Enter the email you registered with. " });
  }
};
exports.changePassword = async (req, res) => {
  let { password, code } = req.body;

  const user = req.profile;
  password = await bcrypt.hash(password, 12);

  if (user.code == code) {
    return user.update({ code: null, password }).then((user) => {
      return res.json({
        message: "You have changed your password successfully.",
      });
    });
  } else {
    return res.status(400).json({ err: "Incorrect verification code" });
  }
};
exports.getAllUsers = (req, res) => {
  return db.User.findAll()
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err });
    });
};
exports.deleteUser = (req, res) => {
  const Id = req.params.Id;
  return db.User.destroy({ where: { Id } })
    .then(() => {
      return res.json({
        message: "You have successfully deleted the user.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the user." });
    });
};
exports.viewProfile = (req, res) => {
  return res.json({ profile: req.profile });
};
