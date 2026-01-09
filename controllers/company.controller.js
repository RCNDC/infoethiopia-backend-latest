const { join } = require("path");
const fs = require("fs");
const db = require("../models");
const uploadImage = require("../router/upload.helper");
const uploadLicenceImage = require("../router/uploadlicence.helper");
const { Op } = require("sequelize");
const _ = require("lodash");
const { default: slugify } = require("slugify");

/**
 * @description add company
 * @param {*} req
 * @param {File} req.file
 * @param {Object} req.body
 * @param {String} req.body.name
 * @param {String} req.body.description
 * @param {String} req.body.city
 * @param {String} req.body.state
 * @param {String} req.body.kebele
 * @param {Float} req.body.lat
 * @param {Float} req.body.long
 * @param {String} req.body.wereda
 * @param {String} req.body.subCity
 * @param {String} req.body.catagoryId
 * @param {String} req.body.web
 * @param {String} req.body.pobox
 * @param {String} req.body.email
 * @param {*} res
 * @returns {String}
 */
exports.addCompany = async (req, res) => {
  try {
    let image = true;

    await uploadImage(req, res);
    if (req.file == undefined) {
      image = false;
    }
    /**
     * create the company and if it was successfull create the address of it
     */
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
      web,
      pobox,
      email,
    } = req.body;
    let imageURI = undefined;
    if (image) imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;

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
          web,
          email,
          slug: slugify(name),
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
              pobox,
            })
              .then(() => {
                return res.json({ message: "Company successfully created." });
              })
              .catch((err) => {
                return res
                  .status(400)
                  .json({ err: "Error creating the company." });
              });
          })
          .catch((err) => {
            return res.status(400).json({ err: "Error creating the company." });
          });
      })
      .catch((err) => {
        return res.status(400).json({ err: "Error finding the company." });
      });
  } catch (err) {
    if (err.message) return res.status(400).json({ err: err.message });

    return res.status(500).send({
      err,
    });
  }
};

// exports.addCompanyFromFile = async (req, res) => {
//   let message = null;

//   await req.body.forEach((body, index) => {
//     const {
//       name,
//       description,
//       city,
//       state,
//       street,
//       kebele,
//       lat,
//       long,
//       wereda,
//       subCity,
//       phoneNumber,
//       officeNumber,
//       pobox,
//       web,
//       fax,
//       email,
//     } = body;

//     const point = { type: "Point", coordinates: [lat, long] };
//     return db.Company.findOne({ where: { name } })
//       .then((result) => {
//         if (result) {
//           message = {
//             err: `There is already a company with name ${name}.`,
//           };
//           return false;
//         }
//         return db.PhoneNumber.findOne({
//           where: { phone_no: phoneNumber.toString() },
//         })
//           .then((result) => {
//             if (result) {
//               message = {
//                 err: `There is already a company with name ${name}.`,
//               };
//               return false;
//             }
//             return db.Company.create({
//               name,
//               description,
//               web,
//               email,
//               slug: slugify(name),
//             })
//               .then((result) => {
//                 return db.Address.create({
//                   city,
//                   state,
//                   street_no: street,
//                   kebele,
//                   wereda,
//                   sub_city: subCity,
//                   location: point,
//                   companyId: result.Id,
//                   pobox,
//                 })
//                   .then(() => {
//                     return db.OfficeNumber.create({
//                       office_no: officeNumber.toString(),
//                       companyId: result.Id,
//                     })
//                       .then(() => {
//                         return db.PhoneNumber.create({
//                           phone_no: phoneNumber.toString(),
//                           companyId: result.Id,
//                         })
//                           .then(() => {
//                             return db.Fax.create({
//                               fax: fax.toString(),
//                               companyId: result.Id,
//                             })
//                               .then(() => {
//                                 message = {
//                                   message: "Companies successfully added.",
//                                 };
//                                 return;
//                               })
//                               .catch((err) => {
//                                 message = {
//                                   err: "Error adding the phone number.",
//                                 };
//                               });
//                           })
//                           .catch((err) => {
//                             message = { err: "Error adding the phone number." };
//                           });
//                       })
//                       .catch((err) => {
//                         message = { err: "Error adding the office number." };
//                       });
//                   })
//                   .catch((err) => {
//                     message = { err: `Error creating the company ${name}.` };
//                   });
//               })
//               .catch((err) => {
//                 message = { err: `Error creating the company ${name}.` };
//               });
//           })
//           .catch((err) => {
//             message = { err: "Error finding the company." };
//           });
//       })
//       .catch((err) => {
//         message = { err: "Error finding the company." };
//       });
//   });
//   // if (message.err != null) return res.status(400).json({ err: message.err });
//   return res.json({ message: "companies successfully created." });
// };

/**
 * @description add company from category page
 * @param {*} req
 * @param {File} req.file
 * @param {Object} req.params
 * @param {String} req.params.Id id of the category
 * @param {Array} req.body
 * @param {String} req.body.name
 * @param {String} req.body.description
 * @param {String} req.body.city
 * @param {String} req.body.state
 * @param {String} req.body.kebele
 * @param {Float} req.body.lat
 * @param {Float} req.body.long
 * @param {String} req.body.wereda
 * @param {String} req.body.subCity
 * @param {String} req.body.catagoryId
 * @param {String} req.body.web
 * @param {String} req.body.pobox
 * @param {String} req.body.email
 * @param {String} req.body.fax
 * @param {String} req.body.officeNumber
 * @param {String} req.body.phoneNumber
 * @param {*} res
 * @returns {String}
 */
exports.addCompanyForCatagory = async (req, res) => {
  let message = null;
  const Id = req.params.Id;

  await req.body.forEach((body, index) => {
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
      phoneNumber,
      officeNumber,
      pobox,
      web,
      fax,
      email,
    } = body;
    const point = { type: "Point", coordinates: [lat, long] };

    return db.Company.findOne({ where: { name } })
      .then((result) => {
        if (result) {
          message = {
            err: `There is already a company with name ${name}.`,
          };
          return false;
        }

        return db.Company.create({
          name,
          description,
          catagoryId: Id,
          web,
          email,
          slug: slugify(name),
        })
          .then(async (result) => {
            if (result) {
              await db.Address.create({
                city,
                state,
                street_no: street,
                kebele,
                wereda,
                sub_city: subCity,
                location: point,
                companyId: result.Id,
                pobox,
              });
              if (phoneNumber) {
                await db.PhoneNumber.create({
                  phone_no: phoneNumber,
                  companyId: result.Id,
                });
              }
              if (officeNumber) {
                await db.OfficeNumber.create({
                  office_no: officeNumber,
                  companyId: result.Id,
                });
              }
              if (fax) {
                await db.Fax.create({
                  fax,
                  companyId: result.Id,
                });
              }
            }
          })
          .catch((err) => {
            consoles.log(err);
            message = { err: `Error creating the company ${name}.` };
          });
      })
      .catch((err) => {
        message = { err: "Error finding the company." };
      });
  });
  return res.json({ message: "companies successfully created." });
};
/**
 * @description delete company
 * @param {*} req
 * @param {*} req.params
 * @param {Object} req.params.Id
 * @param {*} res
 * @returns
 */
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
/**
 * @description update company detail
 * @param {*} req
 * @param {File} req.file
 * @param {Object} req.params
 * @param {String} req.params.Id
 * @param {Object} req.body
 * @param {String} req.body.name
 * @param {String} req.body.description
 * @param {String} req.body.city
 * @param {String} req.body.state
 * @param {String} req.body.kebele
 * @param {Float} req.body.lat
 * @param {Float} req.body.long
 * @param {String} req.body.wereda
 * @param {String} req.body.subCity
 * @param {String} req.body.catagoryId
 * @param {String} req.body.web
 * @param {String} req.body.pobox
 * @param {String} req.body.email
 * @param {*} res
 * @returns {String}
 */
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
      pobox,
      email,
      web,
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
              // delete the previous company logo if it's updated
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
              web,
              email,
              slug: slugify(name),
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
                pobox,
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
    if (err.message) return res.status(400).json({ err: err.message });

    return res.status(400).json({ err });
  }
};
/**
 * @description fetch all companies list including their address, social medias, office numbers, phone numbers and news
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.viewAllCompany = (req, res) => {
  return db.Company.findAll({
    include: [
      { model: db.Address },
      { model: db.Catagory },
      { model: db.News },
      { model: db.OfficeNumber },
      { model: db.PhoneNumber },
      { model: db.SocialMedia },
      { model: db.Fax },
    ],
    where: { approved: true },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the companies." });
    });
};
/**
 * @description search company by it's slug
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.slug
 * @param {*} res
 * @returns {Object}
 */
exports.searchCompany = (req, res) => {
  const slug = req.params.slug;

  return db.Company.findOne({
    include: [
      { model: db.Catagory },
      { model: db.Fax },
      { model: db.OfficeNumber },
      { model: db.PhoneNumber },
      { model: db.SocialMedia },
      { model: db.Address },
      { model: db.News },
      { model: db.Service },
    ],
    where: { slug },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the company." });
    });
};
/**
 * @description search company by it's name
 * @param {*} req
 * @param {*} req.query
 * @param {String} req.query.slug
 * @param {*} res
 * @returns {Object}
 */
exports.searchCompaniesByName = (req, res) => {
  const { search } = req.query;
  return db.Company.findAll({
    include: [{ model: db.Catagory }],
    where: { name: { [Op.startsWith]: search } },
  })
    .then((result) => {
      return res.json({ result: search ? result : [] });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the company." });
    });
};
/**
 * @description search company by it's id
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.slug
 * @param {*} res
 * @returns {Object}
 */
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
      { model: db.News },
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
/**
 * @description save companies recently searched by call centers
 * @param {*} req
 * @param {*} req.body
 * @param {String} req.body.companyId
 * @param {String} req.body.callCenterId
 * @param {*} res
 * @returns {Object}
 */
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
              return res
                .status(400)
                .json({ err: "Error creating the history" });
            });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error deleting the history" });
        });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the record" });
    });
};
/**
 * @description fetch recently viewed companies by call center
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.Id //call center id
 * @param {*} res
 * @returns {Array}
 */
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
/**
 * @description fetch all companies list that are requested by users
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.getAllRequestedCompanies = (req, res) => {
  return db.Company.findAll({
    include: [
      { model: db.Address },
      { model: db.Catagory },
      { model: db.News },
      { model: db.OfficeNumber },
      { model: db.PhoneNumber },
      { model: db.SocialMedia },
      { model: db.Fax },
    ],
    where: { approved: false },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the companies." });
    });
};
/**
 * @description approve company requested by user
 * @param {*} req
 * @param {*} res
 * @returns {String}
 */
exports.approveRequestedCompanies = (req, res) => {
  const Id = req.params.Id;
  return db.Company.findOne({ where: { Id } })
    .then((result) => {
      if (!result)
        return res.status(400).json({ err: "Error finding the company." });
      return result
        .update({ approved: true })
        .then(() => {
          return res.json({ message: "Company has been approved." });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error updating the company." });
        });
    })
    .catch(() => {
      return res.status(400).json({ err: "Something's not right try again." });
    });
};
/**
 * @description user add company
 * @param {*} req
 * @param {Object} req.params
 * @param {Object} req.files
 * @param {File} req.files.licence
 * @param {File} req.files.image
 * @param {Object} req.body
 * @param {String} req.body.catagoryId id of the category
 * @param {String} req.body.name
 * @param {String} req.body.description
 * @param {String} req.body.city
 * @param {String} req.body.state
 * @param {String} req.body.kebele
 * @param {Float} req.body.lat
 * @param {Float} req.body.long
 * @param {String} req.body.wereda
 * @param {String} req.body.subCity
 * @param {String} req.body.catagoryId
 * @param {String} req.body.web
 * @param {String} req.body.pobox
 * @param {String} req.body.email
 * @param {String} req.body.fax
 * @param {String} req.body.officeNumber
 * @param {String} req.body.phoneNumber
 * @param {*} res
 * @returns {String}
 */
exports.userAddCompany = async (req, res) => {
  try {
    let image = true;
    await uploadLicenceImage(req, res);
    if (!req.files.licence) {
      return res.json({ err: "Please upload a file." });
    }
    let licenceURI = `${process.env.BASE_URL}/docs/${req.files.licence[0].filename}`;
    if (req.files.image == undefined) {
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
      phoneNumber,
      officeNumber,
      pobox,
      web,
      fax,
      email,
      // socialMedias,
      // services,
    } = req.body;
    let imageURI = undefined;
    if (image)
      imageURI = `${process.env.BASE_URL}/images/${req.files.image[0].filename}`;

    const point = { type: "Point", coordinates: [lat, long] };
    return db.Company.findOne({ where: { name } })
      .then((result) => {
        if (result) {
          return res.json({
            err: "There is already a company with this name.",
          });
        }
        return db.Company.create({
          name,
          description,
          catagoryId,
          logo: imageURI,
          approved: false,
          web,
          email,
          licence: licenceURI,
          slug: slugify(name),
        })
          .then(async (result) => {
            await db.Address.create({
              city,
              state,
              street_no: street,
              kebele,
              wereda,
              sub_city: subCity,
              location: point,
              companyId: result.Id,
              pobox,
            });
            if (phoneNumber) {
              await db.PhoneNumber.create({
                phone_no: phoneNumber,
                companyId: result.Id,
              });
            }

            if (officeNumber) {
              await db.OfficeNumber.create({
                office_no: officeNumber,
                companyId: result.Id,
              });
            }
            if (fax) {
              await db.Fax.create({
                fax,
                companyId: result.Id,
              });
            }
            //  if (JSON.parse(services).length > 0) {
            //    await db.Service.bulkCreate(
            //      _.map(JSON.parse(services), (o) =>
            //        _.extend({ companyId: result.Id }, o)
            //      )
            //    );
            //  }

            //  if (JSON.parse(socialMedias).length > 0) {
            //    await db.SocialMedia.bulkCreate(
            //      _.map(JSON.parse(socialMedias), (o) =>
            //        _.extend({ companyId: result.Id }, o)
            //      )
            //    );
            //  }
            return res.json({
              message:
                "Company successfully created, admin will approve it shortly.",
            });
          })
          .catch((err) => {
            console.log(err);
            return res.json({ err: "Error creating the company." });
          });
      })
      .catch((err) => {
        console.log(err);
        return res.json({ err: "Error finding the company." });
      });
  } catch (err) {
    if (err.message) return res.json({ err: err.message });

    return res.json({
      err,
    });
  }
};

/**
 * @description Add company from Forminator form submission
 * @param {*} req
 * @param {Object} req.body - Forminator form data
 * @param {String} req.body.select-1 - Category ID
 * @param {String} req.body.text-1 - Company Name
 * @param {String} req.body.textarea-1 - Company Details
 * @param {String} req.body.email-1 - Email Address
 * @param {String} req.body.url-1 - Website
 * @param {String} req.body.text-6 - P.O Box
 * @param {String} req.body.number-2 - Woreda
 * @param {String} req.body.text-2 - City
 * @param {String} req.body.text-3 - Sub City
 * @param {String} req.body.text-4 - State
 * @param {String} req.body.number-3 - Kebele
 * @param {String} req.body.text-5 - Street
 * @param {String} req.body.phone-1 - Phone Number
 * @param {String} req.body.phone-2 - Office Number
 * @param {String} req.body.number-4 - Fax Number
 * @param {File} req.body.upload-1 - Upload Logo
 * @param {File} req.body.upload-2 - Upload License
 * @param {*} res
 * @returns {String}
 */
exports.addCompanyFromForminator = async (req, res) => {
  try {
    // Map Forminator field names to our database fields
    const {
      'select-1': catagoryId,
      'text-1': name,
      'textarea-1': description,
      'email-1': email,
      'url-1': web,
      'text-6': pobox,
      'number-2': wereda,
      'text-2': city,
      'text-3': subCity,
      'text-4': state,
      'number-3': kebele,
      'text-5': street,
      'phone-1': phoneNumber,
      'phone-2': officeNumber,
      'number-4': fax,
      'upload-1': logo,
      'upload-2': licence,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ err: "Company name is required." });
    }

    // Check if company already exists
    const existingCompany = await db.Company.findOne({ where: { name } });
    if (existingCompany) {
      return res.status(400).json({
        err: "There is already a company with this name.",
      });
    }

    // Create company with approved: false for admin review
    const company = await db.Company.create({
      name,
      description: description || "",
      catagoryId: catagoryId || null,
      logo: logo || null,
      licence: licence || null,
      approved: false, // Pending admin approval
      web: web || "",
      email: email || "",
      slug: slugify(name),
    });

    // Create address record
    await db.Address.create({
      city: city || "",
      state: state || "",
      street_no: street || "",
      kebele: kebele || "",
      wereda: wereda || "",
      sub_city: subCity || "",
      location: null, // No coordinates from form
      companyId: company.Id,
      pobox: pobox || "",
    });

    // Create phone number if provided
    if (phoneNumber) {
      await db.PhoneNumber.create({
        phone_no: phoneNumber,
        companyId: company.Id,
      });
    }

    // Create office number if provided
    if (officeNumber) {
      await db.OfficeNumber.create({
        office_no: officeNumber,
        companyId: company.Id,
      });
    }

    // Create fax if provided
    if (fax) {
      await db.Fax.create({
        fax: fax.toString(),
        companyId: company.Id,
      });
    }

    return res.json({
      success: true,
      message:
        "Company request submitted successfully. Admin will review it shortly.",
    });
  } catch (err) {
    console.error("Forminator submission error:", err);
    return res.status(500).json({
      err: "Error processing company submission. Please try again.",
    });
  }
};

/**
 * @description user add company
 * @param {*} req
 * @param {Object} req.params
 * @param {Object} req.files
 * @param {File} req.files.licence
 * @param {File} req.files.image
 * @param {Object} req.params
 * @param {String} req.params.Id
 * @param {Array} req.body
 * @param {String} req.body.catagoryId id of the category
 * @param {String} req.body.name
 * @param {String} req.body.description
 * @param {String} req.body.city
 * @param {String} req.body.state
 * @param {String} req.body.kebele
 * @param {Float} req.body.lat
 * @param {Float} req.body.long
 * @param {String} req.body.wereda
 * @param {String} req.body.subCity
 * @param {String} req.body.catagoryId
 * @param {String} req.body.web
 * @param {String} req.body.pobox
 * @param {String} req.body.email
 * @param {*} res
 * @returns {String}
 */
exports.userUpdateCompany = async (req, res) => {
  try {
    let image = true;
    await uploadLicenceImage(req, res);
    if (!req.files.licence) {
      return res.json({ err: "Please upload a file." });
    }
    let licenceURI = `${process.env.BASE_URL}/docs/${req.files.licence[0].filename}`;

    if (req.files.image == undefined) {
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
      web,
      pobox,
      email,
    } = req.body;
    let imageURI = undefined;
    if (image)
      imageURI = `${process.env.BASE_URL}/images/${req.files.image[0].filename}`;

    const point = { type: "Point", coordinates: [lat, long] };
    const Id = req.params.Id;
    return db.Company.findOne({ where: { Id } }).then((result) => {
      const catagory = catagoryId || result.catagoryId;
      return db.TempCompanyFile.findOne({ where: { companyId: Id } }).then(
        async (result) => {
          if (result) {
            return result
              .update({
                catagoryId: catagory,
                logo: imageURI,
                companyId: Id,
                licence: licenceURI,
                name: name || undefined,
                description: description || undefined,
                web: web || undefined,
                email: email || undefined,
                city: city || undefined,
                state: state || undefined,
                street_no: street || undefined,
                kebele: kebele || undefined,
                wereda: wereda || undefined,
                sub_city: subCity || undefined,
                location: point || undefined,
                pobox: pobox || undefined,
              })
              .then(() => {
                return res.json({
                  message:
                    "Company successfully updated, admin will approve it shortly.",
                });
              })
              .catch((err) => {
                console.log(err);
                return res.json({ err: "Error creating the company." });
              });
          } else {
            /**
             * the updated details of the company are saved to a temporary table and saved to the company table when approved by the admin
             */
            return db.TempCompanyFile.create({
              name,
              description,
              catagoryId: catagory,
              logo: imageURI,
              web,
              email,
              city,
              state,
              street_no: street,
              kebele,
              wereda,
              sub_city: subCity,
              location: point,
              companyId: Id,
              pobox,
              licence: licenceURI,
            })
              .then(() => {
                return res.json({
                  message:
                    "Company successfully updated, admin will approve it shortly.",
                });
              })
              .catch((err) => {
                console.log(err);
                return res.json({ err: "Error creating the company." });
              });
          }
        }
      );
    });
  } catch (err) {
    if (err.message) return res.json({ err: err.message });
    return res.send({
      err,
    });
  }
};
/**
 * @description admin approve users update company request
 * @param {*} req
 * @param {*} req.params
 * @param {*} req.params.Id id of the company from the temporary table
 * @param {*} res
 * @returns
 */
exports.approveUpdateCompanyRequest = (req, res) => {
  const Id = req.params.Id;
  return db.TempCompanyFile.findOne({ where: { Id } })
    .then((tempResult) => {
      const {
        name,
        description,
        city,
        state,
        street_no,
        kebele,
        wereda,
        sub_city,
        pobox,
        web,
        email,
        companyId,
        catagoryId,
        licence,
        logo,
        location,
      } = tempResult;

      return db.Company.findOne({
        include: [{ model: db.Address }, { model: db.Catagory }],
        where: { Id: companyId },
      })
        .then((result) => {
          return result
            .update({
              name: name || undefined,
              slug: name ? slugify(name) : undefined,
              description: description || undefined,
              catagoryId: catagoryId || undefined,
              web: web || undefined,
              email: email || undefined,
              licence: licence || undefined,
              logo: logo || undefined,
            })
            .then(async () => {
              await result.Address.update({
                city: city || undefined,
                state: state || undefined,
                street_no: street_no || undefined,
                kebele: kebele || undefined,
                wereda: wereda || undefined,
                sub_city: sub_city || undefined,
                location: location || undefined,
                pobox: pobox || undefined,
              });

              return tempResult
                .destroy()
                .then(() => {
                  return res.json({ message: "Company successfully updated." });
                })
                .catch((err) => {
                  return res.status(400).json({ err });
                });
            })
            .catch((err) => {
              console.log(err);
              return res
                .status(400)
                .json({ err: `Error updating the company ${name}.` });
            });
        })
        .catch((err) => {
          return res.status(400).json({ err: "Error finding the company." });
        });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error approving the company." });
    });
};
/**
 * @description fetch all companies with update request from the user
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.getAllUpdateRequestedCompanies = (req, res) => {
  return db.TempCompanyFile.findAll({
    include: {
      model: db.Catagory,
    },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ err: "Error finding the companies." });
    });
};
/**
 * @description delete update company request from the temporary table
 * @param {*} req
 * @param {*} req.params
 * @param {String} req.params.Id
 * @param {*} res
 * @returns
 */
exports.deleteUpdateCompanyRequest = (req, res) => {
  const Id = req.params.Id;
  return db.TempCompanyFile.destroy({ where: { Id } })
    .then(() => {
      return res.json({
        message: "Company update request successfully deleted.",
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error deleting the request." });
    });
};
/**
 * @description admin update user update company request detail
 * @param {*} req
 * @param {File} req.file
 * @param {Object} req.params
 * @param {String} req.params.Id
 * @param {Array} req.body
 * @param {String} req.body.catagoryId id of the category
 * @param {String} req.body.name
 * @param {String} req.body.description
 * @param {String} req.body.city
 * @param {String} req.body.state
 * @param {String} req.body.kebele
 * @param {Float} req.body.lat
 * @param {Float} req.body.long
 * @param {String} req.body.wereda
 * @param {String} req.body.subCity
 * @param {String} req.body.catagoryId
 * @param {String} req.body.web
 * @param {String} req.body.pobox
 * @param {String} req.body.email
 * @param {*} res
 * @returns {String}
 */
exports.adminUpdateUserRequest = async (req, res) => {
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
      web,
      pobox,
      email,
    } = req.body;
    const Id = req.params.Id;
    const point = { type: "Point", coordinates: [lat, long] };

    return db.TempCompanyFile.findOne({ where: { name } })
      .then((result) => {
        if (result && result.Id != Id) {
          return res
            .status(400)
            .json({ err: "There is already a company with this name." });
        }
        return db.TempCompanyFile.findOne({
          where: { Id },
        }).then((result) => {
          if (!result) {
            return res.status(400).json({ err: "Couldn't find the company." });
          }
          let imageURI = undefined;
          if (image) {
            if (result.logo) {
              // delete previous logo if it's updated
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
              name: name || undefined,
              description: description || undefined,
              catagoryId: catagoryId || undefined,
              logo: imageURI || undefined,
              web: web || undefined,
              email: email || undefined,
              city: city || undefined,
              state: state || undefined,
              street_no: street || undefined,
              kebele: kebele || undefined,
              wereda: wereda || undefined,
              sub_city: subCity || undefined,
              location: point || undefined,
              companyId: result.companyId,
              pobox: pobox || undefined,
            })
            .then(() => {
              return res.json({ message: "Company successully updated." });
            });
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({ err: "Error finding the company." });
      });
  } catch (err) {
    console.log(err);

    if (err.message) return res.status(400).json({ err: err.message });

    return res.status(400).json({ err });
  }
};
/**
 * @description get total number of companies
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.getTotalCount = (req, res) => {
  return db.Company.count()
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.json({ err: "Error getting the total number of companies." });
    });
};
/**
 * @description fetch all companies with pagination
 * @param {Object} req
 * @param {Object} req.params
 * @param {String} req.params.page
 * @param {String} req.params.limit
 * @param {*} res
 * @returns {Array}
 */
exports.viewAllCompanyWithPage = (req, res) => {
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
    where: { approved: true },
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
        where: { approved: true },
      }).then((records) => {
        return res.json({ result, count: records });
      });
    })
    .catch((err) => {
      return res.status(400).json({ err: "Error finding the companies." });
    });
};

exports.totalCompany = (req, res) => {
  return db.Company.count().then((result) => {
    return res.json({ result });
  });
};

/**
 * @description filter companies by state, city and sub city
 * @param {Object} req
 * @param {Object} req.body
 * @param {String} req.body.city
 * @param {String} req.body.state
 * @param {String} req.body.sub_city
 * @param {Object} req.params
 * @param {String} req.params.page
 * @param {String} req.params.limit
 * @param {*} res
 * @returns {Array}
 */
exports.viewFilteredCompanyWithPage = (req, res) => {
  const page = req.params.page;
  const limit = parseInt(req.params.limit);
  let { city, state, sub_city } = req.body;

  let query = {};
  if (state) {
    query.state = state;
  }
  if (city) {
    query.city = city;
  }
  if (sub_city) {
    query.sub_city = sub_city;
  }
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
        model: db.Address,
        where: {
          [Op.and]: [query],
        },
      },
    ],
    where: { approved: true },
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
          {
            model: db.Address,
            where: {
              [Op.and]: [query],
            },
          },
        ],
        where: { approved: true },
      }).then((records) => {
        return res.json({ result, count: records });
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ err: "Error finding the companies." });
    });
};
/**
 * @description fetch all address
 * @param {*} req
 * @param {*} res
 * @returns {Array}
 */
exports.getAllAddress = (req, res) => {
  return db.Address.findAll({
    where: {
      [Op.or]: [
        {
          [Op.or]: [{ city: { [Op.ne]: "" } }, { city: { [Op.ne]: null } }],
        },
        {
          [Op.or]: [
            { sub_city: { [Op.ne]: "" } },
            { sub_city: { [Op.ne]: null } },
          ],
        },
        {
          [Op.or]: [{ state: { [Op.ne]: "" } }, { state: { [Op.ne]: null } }],
        },
      ],
    },
  })
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      console.error(err);
      return res.status(400).json({ err: "Error finding the addresses." });
    });
};
