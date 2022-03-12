const jwt = require("jsonwebtoken");
const expressJ = require("express-jwt");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const db = require("../models");
let generator = require("generate-password");
const transporter = nodemailer.createTransport({
  host: "infoethiopia.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS,
  },
  logger: true,
  debug: true,
});

/**
 * @description pre signup
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.firstName
 * @param {string} req.body.lastName
 * @param {string} req.body.middleName
 * @param {string} req.body.phone_no
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @returns {String}
 */
exports.preSignup = async (req, res) => {
  try {
    const { firstName, lastName, middleName, phone_no, email, password } =
      req.body;
    //look for a user with the same email or phone_no

    const user = await db.User.findOne({
      where: {
        [Op.or]: [{ email: email || null }, { phone_no: phone_no || null }],
      },
    });

    if (user && user.activate == true) {
      return res.json({ err: "Email already been taken" });
    } else {
      if (user && user.activate == false) {
        // if exists and the account is not activated delete the record
        user.destroy();
      }
      // generate a four digit number
      let code = (Math.floor(Math.random() * 10000) + 10000)
        .toString()
        .substring(1);

      // hass the password
      const pass = await bcrypt.hash(password, 12);

      // send the verification code to the user email
      const info = await transporter.sendMail({
        from: process.env.GMAIL, // sender address
        to: email, // list of receivers
        subject: "Account activation", // Subject line
        text: `Wellcome, This is the Activation code: ${code}`, // plain text body
        html: `<style>@import url('https://fonts.googleapis.com/css2?family=Cabin&display=swap');</style>
<div style="border: 1px solid rgba(244,151,3,.8); border-radius: 5px; padding: 30px;">&nbsp; &nbsp;&nbsp; &nbsp;
  <div style="text-align: center; font-family: 'Cabin', sans-serif; margin: auto;">
    <img style="display: block; margin-left: auto; margin-right: auto;" src="https://api.infoethiopia.net/images/logo.png" alt="" height="150">
    <div style="color: #143d59; font-size: 14px; margin: 20px;">
      <strong>
        <span style="letter-spacing: 4px;">THANKS FOR SIGNING UP!</span>
      </strong>
    </div>
    <div style="margin: 0px 60px 20px; height: 0.2px; background-color: rgba(244,151,3,.8);">&nbsp;</div>
    <div style="color: #143d59; font-size: 20px; margin: 20px 0px 30px;">Wellcome.</div>
    <span style="color: #143d59;">
      <span style="font-size: 20px;">This is your activation code: ${code}.</span>
    </span>
  </div>
</div>`,
      });

      if (info.accepted.length > 0) {
        // if the email is sent successfully create the user
        return db.User.create({
          phone_no: phone_no || "",
          firstName,
          lastName,
          middleName,
          email: email || "",
          password: pass,
          code,
        })
          .then((user) => {
            return res.json({
              message: `Account activation link has been sent to ${email}. Link expires in 10min. `,
            });
          })
          .catch((err) => {
            console.log(err);
            return res.json({ err: "Error creating the user, try again." });
          });
      } else {
        return res.json({
          err: "Could not send the activation code, Try again. ",
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.json({ err: "Something's not right, try again." });
  }
};
/**
 * @description admin signup
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.firstName
 * @param {string} req.body.lastName
 * @param {string} req.body.middleName
 * @param {string} req.body.phone_no
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @param {string} req.body.city
 * @param {string} req.body.wereda
 * @param {string} req.body.subCity
 * @returns {object}
 */
exports.adminSignup = async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    password,
    username,
    phone,
    email,
    city,
    wereda,
    subCity,
  } = req.body;
  // hash the password
  const pass = await bcrypt.hash(password, 12);
  return db.Staff.create({
    firstName,
    lastName,
    middleName,
    phone,
    username,
    password: pass,
    role: 1,
    email,
    city,
    wereda,
    subCity,
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err });
    });
};
/**
 * @description after user registered the user sends the activation code and email ro activate their account
 * @param {Object} req
 * @param {Object} req.body
 * @param {String} req.body.code
 * @param {String} req.body.email
 * @returns {String}
 */
exports.signup = async (req, res) => {
  const { code, email } = req.body;
  if (code) {
    /**
     *  search for the user with the email and code
     *  if user exists activate the account and change code to null
     */
    const user = await db.User.findOne({
      where: { [Op.and]: [{ code }, { email }] },
    });
    if (user) {
      return user
        .update({ code: null, activate: true })
        .then((result) => {
          const token = jwt.sign(
            { Id: result.Id },
            process.env.LOGIN_SECRET,
            {}
          );

          result.dataValues.profilePicture;
          result.dataValues.code = undefined;
          result.dataValues.password = undefined;
          return res.json({ user: { ...result.dataValues }, token });
        })
        .catch((err) => {
          return res.json({ err: "Error activating the account." });
        });
    } else {
      return res.json({
        err: "Invalid/Expired activation code, Register again. ",
      });
    }
  } else {
    return res.json({
      err: "Something went wrong. Try again.",
    });
  }
};
/**
 * @description user login
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.username
 * @param {string} req.body.password
 * @returns {object} object that holds user's information and login token
 */
exports.signin = (req, res) => {
  const { username, password } = req.body;

  var regexEmail = /\S+@\S+\.\S+/;
  // check if the email is valid
  const validEmail = regexEmail.test(username);
  if (!validEmail) {
    parseInt(username);
  }

  return db.User.findOne({
    where: {
      [Op.or]: [
        { email: username },
        { phone_no: validEmail ? null : username },
      ],
    },
  })
    .then(async (result) => {
      if (result) {
        if (result.activate == 1) {
          // check to see if the password match
          const validPassword = await bcrypt.compare(password, result.password);

          if (validPassword) {
            // after the user is autenticated, sign a token and return it along with the admin info
            const token = jwt.sign(
              { Id: result.Id },
              process.env.LOGIN_SECRET,
              {}
            );
            result.dataValues.profilePicture;
            result.dataValues.code = undefined;
            result.dataValues.password = undefined;
            res.cookie("token", token, {});
            return res.json({ user: { ...result.dataValues }, token });
          } else {
            // if password don't match
            return res.json({
              err: "Password is incorrect",
            });
          }
        } else {
          // if the account hasn't been activated
          return res.json({ err: "Activate your account before you login. " });
        }
      } else {
        // if the username don't match

        return res.json({
          err: "User with this email does not exist. ",
        });
      }
    })
    .catch((err) => {
      return res.json({ err });
    });
};
/**
 * @description staff login
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.username
 * @param {string} req.body.password
 * @returns {object} object that holds staff's information and login token
 */
exports.staffSignin = async (req, res) => {
  const { username, password } = req.body;

  return db.Staff.findOne({ where: { username } })
    .then(async (result) => {
      if (result) {
        const validPassword = await bcrypt.compare(password, result.password);

        if (validPassword) {
          const token = jwt.sign({ Id: result.Id }, process.env.LOGIN_SECRET, {
            expiresIn: "6h",
          });
          result.dataValues.password = undefined;
          res.cookie("token", token, { expiresIn: "6h" });
          return res
            .status(200)
            .json({ user: { ...result.dataValues }, token });
        } else {
          return res.status(400).json({
            err: "Password is incorrect",
          });
        }
      } else {
        return res.status(400).json({
          err: "Staff with this username does not exist.",
        });
      }
    })
    .catch((err) => {
      return err;
    });
};
/**
 * @description this function clears the cookie
 * @param {*} req
 * @param {*} res
 * @returns {String}
 */
exports.signout = (req, res) => {
  res.clearCookie("token");
  return res.json({
    msg: "Signout success!",
  });
};
/**
 * middleware from express-jwt to check if the token is valid and is not expired
 * in return it appends the variable the token has been signed with in the req.user object
 */
exports.requireSignin = expressJ({
  secret: process.env.LOGIN_SECRET,
  algorithms: ["HS256"],
});
/**
 * @description this function checks if the user exists or not in the user table
 * @param {Object} req
 * @param {Object} req.user
 * @param {String} req.user.Id
 * @param {*} res
 * @param {Function} next
 * @returns
 */
exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user.Id;
  return db.User.findOne({ where: { Id: authUserId } })
    .then((user) => {
      if (!user) {
        return res.json({
          err: "User not found",
        });
      }
      //if the user exists it appends the user detail in the request as a profile object
      req.profile = user;
      next();
    })
    .catch((err) => {
      return res.json({ err });
    });
};
/**
 * @description this function checks if the staff exists or not in the staff table
 * @param {Object} req
 * @param {Object} req.user
 * @param {String} req.user.Id
 * @param {*} res
 * @param {Function} next
 * @returns
 */
exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user.Id;
  return db.Staff.findOne({ where: { Id: adminUserId } })
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          err: "User not found",
        });
      } else if (user && user.role == 2) {
        return res.status(400).json({
          err: "You are not authorized.",
        });
      }
      //if the user exists it appends the user detail in the request as a profile object
      req.profile = user;
      next();
    })
    .catch((err) => {
      return res.status(400).json({ err });
    });
};
/**
 * @description send the new password to the user email
 * @param {Object} req
 * @param {Object} req.body
 * @param {String} req.body.email
 * @param {*} res
 * @returns {String}
 */
exports.forgotPassword = (req, res) => {
  try {
    const { email } = req.body;
    return db.User.findOne({ where: { email } })
      .then(async (result) => {
        if (result) {
          // generate an eigth character long password
          let password = generator.generate({
            length: 8,
            numbers: true,
          });
          pass = await bcrypt.hash(password, 12);
          // send to the email account
          const info = await transporter.sendMail({
            from: process.env.GMAIL, // sender address
            to: email, // list of receivers
            subject: "Forget password", // Subject line
            text: `Welcome, Use this password to login: ${password}`, // plain text body

            html: `<style>@import url('https://fonts.googleapis.com/css2?family=Cabin&display=swap');</style>
<div style="border: 1px solid rgba(244,151,3,.8); border-radius: 5px; padding: 30px;">&nbsp; &nbsp;&nbsp; &nbsp;
  <div style="text-align: center; font-family: 'Cabin', sans-serif; margin: auto;">
    <img style="display: block; margin-left: auto; margin-right: auto;" src="https://api.infoethiopia.net/images/logo.png" alt="" height="150">
    <div style="color: #143d59; font-size: 14px; margin: 20px;">
      <strong> 
      <strong>
        <span style=" letter-spacing: 4px;">THANKS FOR CHOOSING US!</span></strong>
       
      </strong>
    </div>
    <div style="margin: 0px 60px 20px; height: 0.2px; background-color: rgba(244,151,3,.8);">&nbsp;</div>
    <div style="color: #143d59; font-size: 20px; margin: 20px 0px 30px;">Wellcome.</div>
    <span style="color: #143d59;">  
    <span style="font-size: 20px; ">Use this password to login: ${password}.</span>
    </span>
  </div>
</div>`,
          });

          if (info.accepted.length > 0) {
            // update the password with the new generated one
            return db.User.update({ password: pass }, { where: { email } })
              .then(() => {
                return res.json({
                  message: `Your new password is sent to ${email}. Check your email.`,
                });
              })
              .catch((err) => {
                return res.json({ err });
              });
          } else {
            return res.json({
              err: "could not send the code to the email, Try again.",
            });
          }
        } else {
          return res.json({
            err: "User not found, try with email you have registerd with.",
          });
        }
      })
      .catch((err) => {
        return res.json({ err: "Something went wrong, Try again." });
      });
  } catch (err) {
    return res.json({ err: "something is not right, try again." });
  }
};
/**
 * @description send the new password to the admin email account
 * @param {Object} req
 * @param {Object} req.body
 * @param {String} req.body.email
 * @param {*} res
 * @returns {String}
 */
exports.adminForgetpassword = async (req, res) => {
  try {
    // get the admin account from the environment variables
    const email = process.env.ADMIN_EMAIL;
    // generate an eigth character long password
    let password = generator.generate({
      length: 8,
      numbers: true,
    });
    pass = await bcrypt.hash(password, 12);
    // send the new password to the admin email
    const info = await transporter.sendMail({
      from: process.env.GMAIL, // sender address
      to: email, // list of receivers
      subject: "Admin forget password", // Subject line
      text: `Welcome, Use this password to login: ${password}`, // plain text body

      html: `<style>@import url('https://fonts.googleapis.com/css2?family=Cabin&display=swap');</style>
<div style="border: 1px solid rgba(244,151,3,.8); border-radius: 5px; padding: 30px;">&nbsp; &nbsp;&nbsp; &nbsp;
  <div style="text-align: center; font-family: 'Cabin', sans-serif; margin: auto;">
    <img style="display: block; margin-left: auto; margin-right: auto;" src="https://api.infoethiopia.net/images/logo.png" alt="" height="150">
    <div style="color: #143d59; font-size: 14px; margin: 20px;">
      <strong> 
      <strong>
        <span style=" letter-spacing: 4px;">THANKS FOR CHOOSING US!</span></strong>
       
      </strong>
    </div>
    <div style="margin: 0px 60px 20px; height: 0.2px; background-color: rgba(244,151,3,.8);">&nbsp;</div>
    <div style="color: #143d59; font-size: 20px; margin: 20px 0px 30px;">Wellcome.</div>
    <span style="color: #143d59;">  
    <span style="font-size: 20px; ">Use this password to login: ${password}.</span>
    </span>
  </div>
</div>`,
    });
    if (info.accepted.length > 0) {
      return db.Staff.findOne({ where: { username: "admin" } })
        .then((result) => {
          if (!result)
            return res.status(400).json({ err: "Error finding the user." });
          return result
            .update({ password: pass })
            .then(() => {
              return res.json({
                message: `Your new password is sent to ${email}. Check your email.`,
              });
            })
            .catch((err) => {
              return res.status(400).json({ err });
            });
        })
        .catch((err) => {
          return res.status(400).json({ err });
        });
    } else {
      return res
        .status(400)
        .json({ err: "could not send the code to the email, Try again." });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ err: "Something went wrong. " });
  }
};
