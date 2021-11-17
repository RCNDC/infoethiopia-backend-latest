const db = require("../models");

exports.getContactMethods = async (req, res) => {
  try {
    const Id = req.params.Id;
    const socialMedia = await db.SocialMedia.findAll({
      where: { companyId: Id },
    });
    const Fax = await db.Fax.findAll({ where: { companyId: Id } });
    const PhoneNumber = await db.PhoneNumber.findAll({
      where: { companyId: Id },
    });
    const OfficeNumber = await db.OfficeNumber.findAll({
      where: { companyId: Id },
    });

    return res.json({
      socialMedia,
      PhoneNumber,
      OfficeNumber,
      Fax,
    });
  } catch (err) {
    return res.status(400).json({ err });
  }
};
exports.deleteContactMethodRecord = (req, res) => {
  const Id = req.params.data.split("|")[1];
  const method = req.params.data.split("|")[0];

  switch (method) {
    case "social_media":
      return deleteSocialMedia(Id, res);
    case "fax":
      return deleteFaxNumber(Id, res);
    case "phone_no":
      return deletePhoneNumber(Id, res);
    case "office_no":
    case "Office_no":
      return deleteOfficeNumber(Id, res);
    default:
      return res.status(400).json({ err: "Couldn't find contact method" });
  }
};
exports.addContactMethodRecord = (req, res) => {
  const { method } = req.body;
  switch (method) {
    case "social_media":
      return addSocialMedia(req, res);
    case "fax":
      return addFaxNumber(req, res);
    case "phone_no":
      return addPhoneNumber(req, res);
    case "office_no":
    case "Office_no":
      return addOfficeNumber(req, res);
    default:
      return res.status(400).json({ err: "Couldn't find contact method" });
  }
};
exports.updateContactMethodRecord = (req, res) => {
  const { method } = req.body;
  switch (method) {
    case "social_media":
      return updateSocialMedia(req, res);
    case "fax":
      return updateFaxNumber(req, res);
    case "phone_no":
      return updatePhoneNumber(req, res);
    case "office_no":
    case "Office_no":
      return updateOfficeNumber(req, res);
    default:
      return res.status(400).json({ err: "Couldn't find contact method" });
  }
};
const deleteFaxNumber = (Id, res) => {
  return db.Fax.destroy({ where: { Id } })
    .then(() => {
      return res.json({ message: "Fax number successfully deleted." });
    })

    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the fax number." });
    });
};
const deleteSocialMedia = (Id, res) => {
  return db.SocialMedia.destroy({ where: { Id } })
    .then(() => {
      return res.json({
        message: "Social media account successfully deleted.",
      });
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ err: "Error deleting the social media account." });
    });
};
const deletePhoneNumber = (Id, res) => {
  return db.PhoneNumber.destroy({ where: { Id } })
    .then(() => {
      return res.json({
        message: "Phone number successfully deleted.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the phone number." });
    });
};
const deleteOfficeNumber = (Id, res) => {
  return db.OfficeNumber.destroy({ where: { Id } })
    .then(() => {
      return res.json({
        message: "Office number successfully deleted.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the office number." });
    });
};
const updateSocialMedia = (req, res) => {
  const Id = req.params.Id;
  const { social_media } = req.body;
  return db.SocialMedia.findOne({ where: { Id } })
    .then((result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the account." });
      }
      return result
        .update({ social_media })
        .then(() => {
          return res.json({
            message: "Social media account updated successfully.",
          });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error updating the account." });
        });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error finding the account." });
    });
};
const updateOfficeNumber = (req, res) => {
  const Id = req.params.Id;
  const { office_no } = req.body;
  return db.OfficeNumber.findOne({ where: { Id } })
    .then((result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the number." });
      }
      return result
        .update({ office_no })
        .then(() => {
          return res.json({
            message: "Office number successfully updated.",
          });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error updating the number." });
        });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error finding the number." });
    });
};
const updatePhoneNumber = (req, res) => {
  const Id = req.params.Id;
  const { phone_no } = req.body;
  return db.PhoneNumber.findOne({ where: { Id } })
    .then((result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the number." });
      }
      return result
        .update({ phone_no })
        .then(() => {
          return res.json({
            message: "Phone number successfully updated.",
          });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error updating the number." });
        });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error finding the number." });
    });
};
const updateFaxNumber = (req, res) => {
  const Id = req.params.Id;
  const { fax } = req.body;
  return db.Fax.findOne({ where: { Id } })
    .then((result) => {
      if (!result) {
        return res.status(400).json({ err: "Error finding the fax number." });
      }
      return result
        .update({ fax })
        .then(() => {
          return res.json({
            message: "fax number successfully updated.",
          });
        })
        .catch((err) => {
          return res
            .status(400)
            .json({ err: "Error updating the fax number." });
        });
    })
    .catch(() => {
      return res.status(400).json({ err: "Error finding the fax number." });
    });
};
const addSocialMedia = (req, res) => {
  const Id = req.params.Id;
  const { social_media } = req.body;
  console.log(social_media);
  return db.SocialMedia.create({
    social_media,
    companyId: Id,
  })
    .then(() => {
      return res.json({
        message: "Social media account successfully created.",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ err: "Error adding the account." });
    });
};
const addOfficeNumber = (req, res) => {
  const Id = req.params.Id;
  const { office_no } = req.body;
  return db.OfficeNumber.create({
    office_no,
    companyId: Id,
  })
    .then(() => {
      return res.json({
        message: "Office number successfully created.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error adding the office number." });
    });
};
const addPhoneNumber = (req, res) => {
  const Id = req.params.Id;

  const { phone_no } = req.body;
  return db.PhoneNumber.create({ phone_no, companyId: Id })
    .then(() => {
      return res.json({
        message: "Phone number successfully created.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error adding the phone number." });
    });
};
const addFaxNumber = (req, res) => {
  const Id = req.params.Id;
  const { fax } = req.body;
  return db.Fax.create({ fax, companyId: Id })
    .then(() => {
      return res.json({
        message: "Fax number successfully created.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error adding the fax number." });
    });
};
