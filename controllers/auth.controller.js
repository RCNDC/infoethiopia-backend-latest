const jwt = require("jsonwebtoken");
const expressJ = require("express-jwt");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const db = require("../models");
const { sendMail, buildResetCodeEmail } = require("../utils/mailer");
const {
  UPLOADS_ROOT,
  getLocalUploadPath,
  safeDeleteFiles,
} = require("../utils/uploadPaths");
const uploadLicenceImage = require("../router/uploadlicence.helper");
const slugify = require("slugify");
let generator = require("generate-password");
const transporter = nodemailer.createTransport({
  host: "infoethiopia.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS,
  },
  logger: false,
  debug: false,
});

const normalizedEmailWhere = (emailValue) =>
  db.sequelize.where(
    db.sequelize.fn("LOWER", db.sequelize.fn("TRIM", db.sequelize.col("email"))),
    emailValue
  );

const TOKEN_TTL_MS = 6 * 60 * 60 * 1000;
const getTokenCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: TOKEN_TTL_MS,
  };
};

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

  try {
    if (!email || !password || !firstName) {
      return res.status(400).json({ err: "Email, password and first name are required." });
    }

    // Check if staff already exists
    const existing = await db.Staff.findOne({
      where: { [Op.or]: [{ email }, { username: username || email }] },
    });
    if (existing) {
      return res.status(400).json({ err: "Staff with this email/username already exists." });
    }

    // hash the password
    const pass = await bcrypt.hash(password, 12);
    return db.Staff.create({
      firstName,
      lastName: lastName || "",
      middleName: middleName || "",
      phone: phone || "",
      username: username || email,
      password: pass,
      roleId: req.body.roleId || null,
      email,
      city: city || "",
      wereda: wereda || "",
      subCity: subCity || "",
    })
      .then((result) => {
        result.dataValues.password = undefined;
        return res.json({ result, message: "Staff account created successfully." });
      })
      .catch((err) => {
        console.error("Staff Creation Error:", err);
        return res.status(400).json({ err: "Error creating staff account." });
      });
  } catch (err) {
    console.error("Admin Signup Error:", err);
    return res.status(500).json({ err: "Internal server error" });
  }
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
            res.cookie("token", token, getTokenCookieOptions());
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
 * @description staff login (UPDATED: Supports email or username)
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.username
 * @param {string} req.body.password
 * @returns {object} object that holds staff's information and login token
 */
exports.staffSignin = async (req, res) => {
  const { username, password } = req.body;

  return db.Staff.findOne({
    where: { [Op.or]: [{ username: username }, { email: username }] },
  })
    .then(async (result) => {
      if (result) {
        const validPassword = await bcrypt.compare(password, result.password);

        if (validPassword) {
          const token = jwt.sign({ Id: result.Id }, process.env.LOGIN_SECRET, {
            expiresIn: "6h",
          });
          result.dataValues.password = undefined;
          res.cookie("token", token, getTokenCookieOptions());
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
          err: "Staff with this email/username does not exist.",
        });
      }
    })
    .catch((err) => {
      console.error("Staff Signin Error:", err);
      return res.status(500).json({ err: err.message || "Internal server error" });
    });
};

/**
 * @description company user login (uses CompanyDashboard table)
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @returns {object} object that holds user's information and login token
 */
exports.companySignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ err: "Email and password are required." });
    }

    const user = await db.CompanyDashboard.findOne({
      where: normalizedEmailWhere(normalizedEmail),
    });

    if (!user) {
      const request = await db.CompanyRequest.findOne({
        where: normalizedEmailWhere(normalizedEmail),
      });
      if (request) {
        if (request.status === "rejected") {
          return res.status(403).json({
            err: "Your company signup request was rejected. Please contact support.",
          });
        }
        return res.status(403).json({
          err: "Your company signup request is pending approval.",
        });
      }
      const approvedCompany = await db.Company.findOne({
        where: normalizedEmailWhere(normalizedEmail),
      });
      if (approvedCompany) {
        const temporaryPassword = generator.generate({
          length: 22,
          numbers: true,
          symbols: true,
          uppercase: true,
          lowercase: true,
          strict: true,
        });
        const temporaryHash = await bcrypt.hash(temporaryPassword, 12);
        try {
          await db.CompanyDashboard.create({
            name: approvedCompany.name || "Company",
            description: approvedCompany.description || "",
            email: normalizedEmail,
            password: temporaryHash,
            logo: approvedCompany.logo || "",
          });
        } catch (provisionErr) {
          if (provisionErr.name !== "SequelizeUniqueConstraintError") {
            console.error("Auto-provision company dashboard user failed:", provisionErr);
          }
        }
        return res.status(403).json({
          err: "Your company is approved but login profile was missing. It is now created. Please use Forgot Password once, then sign in.",
        });
      }
      return res.status(400).json({
        err: "Company with this email does not exist.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        err: "Password is incorrect.",
      });
    }

    const token = jwt.sign({ Id: user.Id }, process.env.LOGIN_SECRET, {
      expiresIn: "6h",
    });

    user.dataValues.password = undefined;
    user.dataValues.code = undefined;
    // Set role to 0 to indicate company user (for sidebar menu)
    user.dataValues.role = 0;

    res.cookie("token", token, getTokenCookieOptions());
    return res.status(200).json({ user: { ...user.dataValues }, token });
  } catch (err) {
    console.error("Company Signin Error:", err);
    return res.status(500).json({ err: err.message || "Internal server error" });
  }
};

/**
 * @description this function clears the cookie
 * @param {*} req
 * @param {*} res
 * @returns {String}
 */
exports.signout = (req, res) => {
  res.clearCookie("token", getTokenCookieOptions());
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
 * @description send 6-digit verification code to the user/staff email
 * @param {Object} req
 * @param {Object} req.body
 * @param {String} req.body.email
 * @param {*} res
 * @returns {String}
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Check Staff first since this is the dashboard backend
    const staff = await db.Staff.findOne({ where: { email } });
    const company = !staff ? await db.CompanyDashboard.findOne({ where: { email } }) : null;
    const user = (!staff && !company) ? await db.User.findOne({ where: { email } }) : null;
    const target = staff || company || user;

    if (!target) {
      return res.json({
        err: "Account not found with this email in our staff or user records.",
      });
    }

    const code = (Math.floor(Math.random() * 900000) + 100000).toString(); // 6 digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.PasswordResetCode.create({
      email,
      code,
      expiresAt,
      used: false,
    });

    const info = await sendMail({
      from: `InfoEthiopia Support <${process.env.GMAIL}>`,
      to: email,
      subject: "Password Reset Verification Code",
      html: buildResetCodeEmail(code),
    });

    if (info.accepted.length > 0) {
      return res.json({
        message: `Verification code sent to ${email}.`,
      });
    } else {
      return res.json({
        err: "could not send the code to the email, Try again.",
      });
    }
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ err: "something is not right, try again." });
  }
};

/**
 * @description verify the 6-digit code (Generic for User/Staff)
 */
exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const record = await db.PasswordResetCode.findOne({
      where: { email: normalizedEmail, code, used: false },
      order: [["createdAt", "DESC"]],
    });
    if (!record || record.expiresAt < new Date()) {
      return res.json({ err: "Invalid or expired verification code." });
    }
    return res.json({ message: "Code verified successfully." });
  } catch (err) {
    return res.status(500).json({ err: "Error verifying code." });
  }
};

/**
 * @description reset password using verified code (Generic for User/Staff)
 */
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const record = await db.PasswordResetCode.findOne({
      where: { email, code, used: false },
      order: [["createdAt", "DESC"]],
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ err: "Invalid or expired verification code." });
    }

    const staff = await db.Staff.findOne({ where: { email } });
    const company = !staff ? await db.CompanyDashboard.findOne({ where: { email } }) : null;
    const user = (!staff && !company) ? await db.User.findOne({ where: { email } }) : null;

    const target = staff || company || user;
    const model = staff ? db.Staff : (company ? db.CompanyDashboard : db.User);

    if (!target) {
      return res.status(400).json({ err: "Invalid request. Account not found." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await model.update({ password: hashed }, { where: { email } });
    await record.update({ used: true });

    return res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ err: "Error resetting password." });
  }
};

exports.getAllStaffs = async (req, res) => {
  try {
    const staffs = await db.Staff.findAll({
      include: [{ model: db.Role, as: "assignedRole" }],
      attributes: { exclude: ["password"] }
    });
    return res.json({ data: staffs });
  } catch (err) {
    console.error("Get Staffs Error:", err);
    return res.status(500).json({ err: "Error fetching staffs" });
  }
};

exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    await db.Staff.destroy({ where: { Id: id } });
    return res.json({ message: "Staff deleted successfully" });
  } catch (err) {
    return res.status(500).json({ err: "Error deleting staff" });
  }
};

exports.updateStaffRole = async (req, res) => {
  const { staffId, roleId } = req.body;
  try {
    await db.Staff.update({ roleId }, { where: { Id: staffId } });
    return res.json({ message: "Staff role updated successfully" });
  } catch (err) {
    return res.status(500).json({ err: "Error updating staff role" });
  }
};

/**
 * @description send the new password to the admin email account
 * (Keeping this for admin legacy or removing if no longer needed, 
 * but user said generic code is better)
 */
exports.adminForgetpassword = async (req, res) => {
  // We can redirect this to the main forgotPassword flow if wanted, 
  // but keeping for now as is.
  try {
    const email = process.env.ADMIN_EMAIL;
    let password = generator.generate({
      length: 8,
      numbers: true,
    });
    const pass = await bcrypt.hash(password, 12);
    const info = await transporter.sendMail({
      from: process.env.GMAIL,
      to: email,
      subject: "Admin forget password",
      text: `Welcome, Use this password to login: ${password}`,
      html: `<h3>Welcome, Use this password to login: ${password}</h3>`,
    });
    if (info.accepted.length > 0) {
      return db.Staff.findOne({ where: { username: "admin" } })
        .then((result) => {
          if (!result) return res.status(400).json({ err: "Error finding the user." });
          return result.update({ password: pass }).then(() => {
            return res.json({ message: `Your new password is sent to ${email}.` });
          });
        });
    } else {
      return res.status(400).json({ err: "could not send the code." });
    }
  } catch (err) {
    return res.status(400).json({ err: "Something went wrong." });
  }
};


/**
 * @description check if company email exists in Companies table
 */
exports.checkCompanyEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const company = await db.Company.findOne({ where: { email } });
    if (company) {
      return res.json({ exists: true, company });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    return res.status(500).json({ err: "Error checking company email" });
  }
};

/**
 * @description company signup - saves only to companyRequests table (pending approval)
 */
exports.companySignup = async (req, res) => {
    try {
      if (req.is("multipart/form-data")) {
        try {
          await uploadLicenceImage(req, res);
        } catch (uploadErr) {
          console.error("Company signup upload error:", uploadErr);
          return res.status(400).json({ err: uploadErr.message || "File upload failed." });
        }
      }

      const {
        email,
        password,
        name,
        description,
        web,
        pobox,
        woreda,
        city,
        subCity,
        state,
        kebele,
        street,
        phone,
        officePhone,
        fax,
        catagoryId,
        customCategory,
        customSubCategory,
      } = req.body;
      const normalizedEmail = String(email || "").trim().toLowerCase();

      const logo = req.files && req.files.image
        ? `${process.env.BASE_URL}/images/${req.files.image[0].filename}`
        : req.body.logo;
      const licence = req.files && req.files.licence
        ? `${process.env.BASE_URL}/docs/${req.files.licence[0].filename}`
        : null;

      if (!name || !normalizedEmail || !password || !city || !phone || !officePhone || !catagoryId) {
        return res.status(400).json({
          err: "Name, email, password, category, city, personal phone, and office phone are required.",
        });
      }
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ err: "Please provide a valid company email." });
      }

      if (!licence) {
        return res.status(400).json({ err: "Company licence file is required." });
      }

      const numericOnly = (value) =>
        value === undefined || value === null || value === "" || /^\d+$/.test(String(value));
      const textOnly = (value) =>
        value === undefined || value === null || value === "" || /^[A-Za-z\s]+$/.test(String(value));

      if (!numericOnly(phone)) {
        return res.status(400).json({ err: "Personal phone must contain numbers only." });
      }
      if (!numericOnly(officePhone)) {
        return res.status(400).json({ err: "Office phone must contain numbers only." });
      }
      if (!numericOnly(fax)) {
        return res.status(400).json({ err: "Fax must contain numbers only." });
      }
      if (!numericOnly(pobox)) {
        return res.status(400).json({ err: "P.O. Box must contain numbers only." });
      }
      if (!numericOnly(woreda)) {
        return res.status(400).json({ err: "Woreda must contain numbers only." });
      }
      if (!textOnly(city)) {
        return res.status(400).json({ err: "City must contain text only." });
      }
      if (!textOnly(subCity)) {
        return res.status(400).json({ err: "Sub city must contain text only." });
      }
      if (!textOnly(state)) {
        return res.status(400).json({ err: "State must contain text only." });
      }
      if (!textOnly(kebele)) {
        return res.status(400).json({ err: "Kebele must contain text only." });
      }

      const selectedCatagory = await db.Catagory.findOne({ where: { Id: catagoryId } });
      if (!selectedCatagory) {
        return res.status(400).json({ err: "Selected category is invalid." });
      }

      const selectedCategoryName = String(selectedCatagory.name || "").trim().toLowerCase();
      const isOtherCategory = selectedCategoryName === "other" || selectedCategoryName === "others";
      const trimmedCustomCategory = customCategory ? String(customCategory).trim() : "";
      const trimmedCustomSubCategory = customSubCategory ? String(customSubCategory).trim() : "";
      if (isOtherCategory && !trimmedCustomSubCategory) {
        return res.status(400).json({
          err: "Please provide custom sub category for Other.",
        });
      }

      const existing = await db.CompanyDashboard.findOne({
        where: normalizedEmailWhere(normalizedEmail),
      });
      if (existing) {
        return res.json({ err: "Company already registered for dashboard access." });
      }

      const existingRequest = await db.CompanyRequest.findOne({
        where: normalizedEmailWhere(normalizedEmail),
      });
      if (existingRequest) {
        return res.json({ err: "A company request with this email already exists." });
      }

      const hashedLabel = await bcrypt.hash(password, 12);
      const customCategoryNote =
        isOtherCategory
          ? `Custom Category: ${trimmedCustomCategory || selectedCatagory.name} | Custom Sub Category: ${trimmedCustomSubCategory}`
          : "";
      const mergedDescription = [description || "", customCategoryNote]
        .filter(Boolean)
        .join("\n\n");

      await db.CompanyRequest.create({
        name,
        description: mergedDescription || null,
        email: normalizedEmail,
        web: web || null,
        catagoryId,
        logo: logo || null,
        licence,
        slug: slugify(name),
        city,
        state: state || null,
        street: street || null,
        kebele: kebele || null,
        woreda: woreda || null,
        subCity: subCity || null,
        pobox: pobox || null,
        phone,
        officePhone,
        fax: fax || null,
        password: hashedLabel,
        status: "pending",
      });

      return res.json({
        message: "Signup request submitted successfully. Please wait for approval before signing in.",
      });
    } catch (err) {
      console.error("Company Signup Error:", err);
      return res.status(500).json({
      err: err.message || "Error during company registration.",
      details: err.errors?.[0]?.message,
    });
  }
};

/**
 * @description send 6-digit verification code for company forgot password
 */
exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const staff = await db.Staff.findOne({ where: normalizedEmailWhere(normalizedEmail) });
    const company = !staff
      ? await db.CompanyDashboard.findOne({ where: normalizedEmailWhere(normalizedEmail) })
      : null;
    const target = staff || company;

    if (!target) {
      return res.json({ err: "Account not found with this email." });
    }

    const code = (Math.floor(Math.random() * 900000) + 100000).toString(); // 6 digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.PasswordResetCode.create({
      email: normalizedEmail,
      code,
      expiresAt,
      used: false,
    });

    const info = await sendMail({
      from: `InfoEthiopia Support <${process.env.GMAIL}>`,
      to: normalizedEmail,
      subject: "Password Reset Verification Code",
      html: buildResetCodeEmail(code),
    });

    if (info.accepted.length > 0) {
      return res.json({ message: `Verification code sent to ${normalizedEmail}.` });
    } else {
      return res.json({ err: "Could not send verification code." });
    }
  } catch (err) {
    console.error("Send Code Error:", err);
    return res.status(500).json({ err: "Error sending verification code." });
  }
};

/**
 * @description verify the 6-digit code for company (Already exists, but generic one also works)
 */
// Exports generic verifyCode above
// exports.verifyCode = ...

/**
 * @description reset password using the verified email and code (Generic one above covers this)
 */
// exports.companyResetPassword = ...
exports.companyResetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const record = await db.PasswordResetCode.findOne({
      where: { email: normalizedEmail, code, used: false },
      order: [["createdAt", "DESC"]],
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ err: "Invalid or expired verification code." });
    }

    const company = await db.CompanyDashboard.findOne({
      where: normalizedEmailWhere(normalizedEmail),
    });

    if (!company) {
      return res.status(400).json({ err: "Invalid request. Company account not found." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await company.update({ password: hashed });
    await record.update({ used: true });

    return res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Company Reset Password Error:", err);
    return res.status(500).json({ err: "Error resetting password." });
  }
};

/**
 * @description Google OAuth signin for company users
 * Verifies Google ID token, then checks if email exists in CompanyDashboard
 */
exports.googleSignin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ err: "Google ID token is required." });
  }
  try {
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const emailVerified = payload.email_verified;

    if (!email) {
      return res.status(400).json({ err: "Could not retrieve email from Google account." });
    }
    if (!emailVerified) {
      return res.status(400).json({ err: "Google account email is not verified." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if company with this email exists in our dashboard
    const user = await db.CompanyDashboard.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      const request = await db.CompanyRequest.findOne({ where: { email: normalizedEmail } });
      if (request) {
        if (request.status === "rejected") {
          return res.status(403).json({
            err: "Your company signup request was rejected. Please contact support.",
          });
        }
        return res.status(403).json({
          err: "Your company signup request is pending approval.",
        });
      }
      return res.status(400).json({
        err: "No approved company dashboard account found with this Google email.",
      });
    }

    const token = jwt.sign({ Id: user.Id }, process.env.LOGIN_SECRET, {
      expiresIn: "6h",
    });

    user.dataValues.password = undefined;
    user.dataValues.code = undefined;
    user.dataValues.role = 0;

    res.cookie("token", token, getTokenCookieOptions());
    return res.status(200).json({ user: { ...user.dataValues }, token });
  } catch (err) {
    console.error("Google Signin Error:", err);
    return res.status(400).json({ err: "Invalid Google token or authentication failed." });
  }
};

const getCompanyContextByEmail = async (email) => {
  const company = await db.Company.findOne({
    where: { email },
    order: [["createdAt", "DESC"]],
  });

  if (!company) {
    return {
      company: null,
      address: null,
      phoneRecord: null,
      officeRecord: null,
      faxRecord: null,
    };
  }

  const [address, phoneRecord, officeRecord, faxRecord] = await Promise.all([
    db.Address.findOne({ where: { companyId: company.Id } }),
    db.PhoneNumber.findOne({
      where: { companyId: company.Id },
      order: [["createdAt", "DESC"]],
    }),
    db.OfficeNumber.findOne({
      where: { companyId: company.Id },
      order: [["createdAt", "DESC"]],
    }),
    db.Fax.findOne({
      where: { companyId: company.Id },
      order: [["createdAt", "DESC"]],
    }),
  ]);

  return { company, address, phoneRecord, officeRecord, faxRecord };
};

const buildCompanyProfilePayload = ({
  dashboardUser,
  company,
  address,
  phoneRecord,
  officeRecord,
  faxRecord,
}) => {
  return {
    companyId: company ? company.Id : null,
    name: company?.name || dashboardUser?.name || "",
    description: company?.description || dashboardUser?.description || "",
    email: dashboardUser?.email || company?.email || "",
    web: company?.web || "",
    pobox: address?.pobox || "",
    woreda: address?.wereda || "",
    city: address?.city || "",
    subCity: address?.sub_city || "",
    state: address?.state || "",
    kebele: address?.kebele || "",
    street: address?.street_no || "",
    phone: phoneRecord?.phone_no || "",
    officePhone: officeRecord?.office_no || "",
    fax: faxRecord?.fax || "",
    logo: company?.logo || dashboardUser?.logo || "",
    licence: company?.licence || "",
  };
};

/**
 * @description Fetch company profile with all signup fields for company dashboard users
 */
exports.getCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.Id;
    const dashboardUser = await db.CompanyDashboard.findOne({ where: { Id: userId } });
    if (!dashboardUser) {
      return res.status(400).json({ err: "Company account not found." });
    }

    const context = await getCompanyContextByEmail(dashboardUser.email);
    const profile = buildCompanyProfilePayload({
      dashboardUser,
      ...context,
    });

    return res.json({ profile });
  } catch (err) {
    console.error("Get Company Profile Error:", err);
    return res.status(500).json({ err: "Error fetching company profile." });
  }
};

/**
 * @description Update company profile with all signup fields
 */
exports.updateCompanyProfile = async (req, res) => {
  let transaction = null;
  let committed = false;
  const uploadedFiles = [];
  try {
    if (req.is("multipart/form-data")) {
      try {
        await uploadLicenceImage(req, res);
      } catch (uploadErr) {
        return res.status(400).json({ err: uploadErr.message || "File upload failed." });
      }
    }

    if (req.files && req.files.image && req.files.image[0]) {
      uploadedFiles.push(path.resolve(UPLOADS_ROOT, "images", req.files.image[0].filename));
    }
    if (req.files && req.files.licence && req.files.licence[0]) {
      uploadedFiles.push(path.resolve(UPLOADS_ROOT, "docs", req.files.licence[0].filename));
    }

    const fail = async (status, message) => {
      if (uploadedFiles.length) {
        await safeDeleteFiles(uploadedFiles);
      }
      return res.status(status).json({ err: message });
    };

    const userId = req.user.Id;
    const dashboardUser = await db.CompanyDashboard.findOne({ where: { Id: userId } });
    if (!dashboardUser) {
      return fail(400, "Company account not found.");
    }

    const {
      name,
      description,
      email,
      oldPassword,
      newPassword,
      confirmNewPassword,
      web,
      pobox,
      woreda,
      city,
      subCity,
      state,
      kebele,
      street,
      phone,
      officePhone,
      fax,
    } = req.body;

    const normalizedEmail = String(email || dashboardUser.email || "")
      .trim()
      .toLowerCase();
    const emailRegex = /\S+@\S+\.\S+/;
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      return fail(400, "A valid company email is required.");
    }

    if (!name || !city || !phone || !officePhone) {
      return fail(400, "Name, email, city, personal phone, and office phone are required.");
    }

    const numericOnly = (value) =>
      value === undefined || value === null || value === "" || /^\d+$/.test(String(value));
    const textOnly = (value) =>
      value === undefined || value === null || value === "" || /^[A-Za-z\s]+$/.test(String(value));

    if (!numericOnly(phone)) {
      return fail(400, "Personal phone must contain numbers only.");
    }
    if (!numericOnly(officePhone)) {
      return fail(400, "Office phone must contain numbers only.");
    }
    if (!numericOnly(fax)) {
      return fail(400, "Fax must contain numbers only.");
    }
    if (!numericOnly(pobox)) {
      return fail(400, "P.O. Box must contain numbers only.");
    }
    if (!numericOnly(woreda)) {
      return fail(400, "Woreda must contain numbers only.");
    }
    if (!textOnly(city)) {
      return fail(400, "City must contain text only.");
    }
    if (!textOnly(subCity)) {
      return fail(400, "Sub city must contain text only.");
    }
    if (!textOnly(state)) {
      return fail(400, "State must contain text only.");
    }
    if (!textOnly(kebele)) {
      return fail(400, "Kebele must contain text only.");
    }

    const trimmedOldPassword = oldPassword ? String(oldPassword).trim() : "";
    const trimmedNewPassword = newPassword ? String(newPassword).trim() : "";
    const trimmedConfirmPassword = confirmNewPassword ? String(confirmNewPassword).trim() : "";
    const hasPasswordChangeInput = Boolean(
      trimmedOldPassword || trimmedNewPassword || trimmedConfirmPassword
    );

    if (hasPasswordChangeInput) {
      if (!trimmedOldPassword || !trimmedNewPassword || !trimmedConfirmPassword) {
        return fail(400, "Old password, new password, and retype new password are required.");
      }
      if (trimmedNewPassword.length < 6) {
        return fail(400, "New password must be at least 6 characters.");
      }
      if (trimmedNewPassword !== trimmedConfirmPassword) {
        return fail(400, "New password and retype new password do not match.");
      }
      if (trimmedOldPassword === trimmedNewPassword) {
        return fail(400, "New password must be different from old password.");
      }

      const validOldPassword = await bcrypt.compare(
        trimmedOldPassword,
        dashboardUser.password || ""
      );
      if (!validOldPassword) {
        return fail(400, "Old password is incorrect.");
      }
    }

    const context = await getCompanyContextByEmail(dashboardUser.email);
    if (!context.company) {
      return fail(400, "Approved company profile not found for this account.");
    }

    const existingDashboardEmail = await db.CompanyDashboard.findOne({
      where: {
        email: normalizedEmail,
        Id: { [Op.ne]: dashboardUser.Id },
      },
    });
    if (existingDashboardEmail) {
      return fail(400, "That email is already used by another company account.");
    }

    const existingCompanyEmail = await db.Company.findOne({
      where: {
        email: normalizedEmail,
        Id: { [Op.ne]: context.company.Id },
      },
    });
    if (existingCompanyEmail) {
      return fail(400, "That email is already used by another company profile.");
    }

    const hasNewLogoUpload = Boolean(req.files && req.files.image && req.files.image[0]);
    const hasNewLicenceUpload = Boolean(req.files && req.files.licence && req.files.licence[0]);
    const previousCompanyLogo = context.company.logo || null;
    const previousDashboardLogo = dashboardUser.logo || null;
    const previousLicence = context.company.licence || null;

    const logo =
      hasNewLogoUpload
        ? `${process.env.BASE_URL}/images/${req.files.image[0].filename}`
        : req.body.logo || context.company.logo || dashboardUser.logo || null;
    const licence =
      hasNewLicenceUpload
        ? `${process.env.BASE_URL}/docs/${req.files.licence[0].filename}`
        : req.body.licence || context.company.licence || null;

    transaction = await db.sequelize.transaction();

    await context.company.update(
      {
        name,
        description: description !== undefined ? description : context.company.description,
        web: web !== undefined ? web : context.company.web,
        email: normalizedEmail,
        logo,
        licence,
        slug: name ? slugify(name) : context.company.slug,
      },
      { transaction }
    );

    const addressPayload = {
      city,
      state: state || null,
      street_no: street || null,
      kebele: kebele || null,
      wereda: woreda || null,
      sub_city: subCity || null,
      pobox: pobox || null,
    };

    if (context.address) {
      await context.address.update(addressPayload, { transaction });
    } else {
      await db.Address.create(
        {
          ...addressPayload,
          location: { type: "Point", coordinates: [0, 0] },
          companyId: context.company.Id,
        },
        { transaction }
      );
    }

    if (context.phoneRecord) {
      await context.phoneRecord.update({ phone_no: phone }, { transaction });
    } else {
      await db.PhoneNumber.create(
        { phone_no: phone, companyId: context.company.Id },
        { transaction }
      );
    }

    if (context.officeRecord) {
      await context.officeRecord.update({ office_no: officePhone }, { transaction });
    } else {
      await db.OfficeNumber.create(
        { office_no: officePhone, companyId: context.company.Id },
        { transaction }
      );
    }

    const normalizedFax = fax === undefined || fax === null ? "" : String(fax).trim();
    if (normalizedFax) {
      if (context.faxRecord) {
        await context.faxRecord.update({ fax: normalizedFax }, { transaction });
      } else {
        await db.Fax.create({ fax: normalizedFax, companyId: context.company.Id }, { transaction });
      }
    } else if (context.faxRecord) {
      await context.faxRecord.destroy({ transaction });
    }

    const dashboardUpdatePayload = {
      name,
      description: description !== undefined ? description : dashboardUser.description,
      email: normalizedEmail,
      logo,
    };
    if (hasPasswordChangeInput) {
      dashboardUpdatePayload.password = await bcrypt.hash(trimmedNewPassword, 12);
    }

    await dashboardUser.update(dashboardUpdatePayload, { transaction });
    await transaction.commit();
    committed = true;

    await safeDeleteFiles([
      hasNewLogoUpload && previousCompanyLogo !== logo ? getLocalUploadPath(previousCompanyLogo) : null,
      hasNewLogoUpload && previousDashboardLogo !== logo ? getLocalUploadPath(previousDashboardLogo) : null,
      hasNewLicenceUpload && previousLicence !== licence ? getLocalUploadPath(previousLicence) : null,
    ]);

    const refreshed = await getCompanyContextByEmail(dashboardUser.email);
    const profile = buildCompanyProfilePayload({
      dashboardUser,
      ...refreshed,
    });

    dashboardUser.dataValues.password = undefined;
    dashboardUser.dataValues.role = 0;
    return res.json({
      message: "Profile updated successfully.",
      user: { ...dashboardUser.dataValues },
      profile,
    });
  } catch (err) {
    if (transaction && !committed) {
      await transaction.rollback();
    }
    if (!committed && uploadedFiles.length) {
      await safeDeleteFiles(uploadedFiles);
    }
    console.error("Update Company Profile Error:", err);
    return res.status(500).json({ err: "Error updating company profile." });
  }
};
