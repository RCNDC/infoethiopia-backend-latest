const express = require("express");
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  getContactMethods,
  deleteContactMethodRecord,
  addContactMethodRecord,
  updateContactMethodRecord,
} = require("../controllers/contactList.controller");
const route = express.Router();
route.get(
  "/view-contact-methods/:Id",
  requireSignin,
  adminMiddleware,
  getContactMethods
);
route.delete(
  "/delete-contact-method/:data",
  requireSignin,
  adminMiddleware,
  deleteContactMethodRecord
);
route.put(
  "/modify-contact-method/:Id",
  requireSignin,
  adminMiddleware,
  updateContactMethodRecord
);
route.post(
  "/add-contact-method/:Id",
  requireSignin,
  adminMiddleware,
  addContactMethodRecord
);

module.exports = route;
