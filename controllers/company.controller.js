const { join } = require("path");
const fs = require("fs");
const db = require("../models");
const uploadImage = require("../router/upload.helper");
const uploadLicenceImage = require("../router/uploadlicence.helper");
const { Op } = require("sequelize");

const { default: slugify } = require("slugify");
exports.addCompany = async (req, res) => {
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
exports.addCompanyFromFile = async (req, res) => {
  let message = null;

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
        return db.PhoneNumber.findOne({
          where: { phone_no: phoneNumber.toString() },
        })
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
                    return db.OfficeNumber.create({
                      office_no: officeNumber.toString(),
                      companyId: result.Id,
                    })
                      .then(() => {
                        return db.PhoneNumber.create({
                          phone_no: phoneNumber.toString(),
                          companyId: result.Id,
                        })
                          .then(() => {
                            return db.Fax.create({
                              fax: fax.toString(),
                              companyId: result.Id,
                            })
                              .then(() => {
                                message = {
                                  message: "Companies successfully added.",
                                };
                                return;
                              })
                              .catch((err) => {
                                message = {
                                  err: "Error adding the phone number.",
                                };
                              });
                          })
                          .catch((err) => {
                            message = { err: "Error adding the phone number." };
                          });
                      })
                      .catch((err) => {
                        message = { err: "Error adding the office number." };
                      });
                  })
                  .catch((err) => {
                    message = { err: `Error creating the company ${name}.` };
                  });
              })
              .catch((err) => {
                message = { err: `Error creating the company ${name}.` };
              });
          })
          .catch((err) => {
            message = { err: "Error finding the company." };
          });
      })
      .catch((err) => {
        message = { err: "Error finding the company." };
      });
  });
  // if (message.err != null) return res.status(400).json({ err: message.err });
  return res.json({ message: "companies successfully created." });
};
exports.addCompanyForCatagory = async (req, res) => {
  let message = null;
  const Id = req.params.Id;
  console.log(req.body);
  //for (let index = 0; index < req.body.length; index++) {
  await req.body.forEach((body, index) => {
    //const body = req.body[index];
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
        // return db.PhoneNumber.findOne({
        //   where: { phone_no: phoneNumber.toString() },
        // })
        //   .then((result) => {
        //     if (result) {
        //       message = {
        //         err: `There is already a company with name ${name}.`,
        //       };
        //       return false;
        //     }
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
        // })
        // .catch((err) => {
        //   message = { err: "Error finding the company." };
        // });
      })
      .catch((err) => {
        message = { err: "Error finding the company." };
      });
  });
  // if (message.err != null) return res.status(400).json({ err: message.err });
  return res.json({ message: "companies successfully created." });
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
            return res.json({
              message:
                "Company successfully created, admin will approve it shortly.",
            });
          })
          .catch((err) => {
            return res.json({ err: "Error creating the company." });
          });
      })
      .catch((err) => {
        return res.json({ err: "Error finding the company." });
      });
  } catch (err) {
    if (err.message) return res.json({ err: err.message });

    return res.json({
      err,
    });
  }
};
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
exports.getTotalCount = (req, res) => {
  return db.Company.count()
    .then((result) => {
      return res.json({ result });
    })
    .catch((err) => {
      return res.json({ err: "Error getting the total number of companies." });
    });
};
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
exports.viewFilteredCompanyWithPage = (req, res) => {
  const page = req.params.page;
  const limit = parseInt(req.params.limit);
  let { city, state, sub_city } = req.body;

  console.log(state, city, sub_city);

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
