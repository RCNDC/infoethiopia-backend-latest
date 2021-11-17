const express = require("express");
const route = express.Router();
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  addCompany,
  deleteCompany,
  updateCompany,
  viewAllCompany,
  searchCompany,
  searchCompanyById,
  saveRecentCompany,
  viewRecentCompany,
  addCompanyFromFile,
} = require("../controllers/company.controller");
route.post("/add-company",
//  requireSignin,
//   adminMiddleware,
   addCompany);
route.post(
  "/add-company-from-file",
  requireSignin,
  adminMiddleware,
  addCompanyFromFile
);
route.delete(
  "/delete-company/:Id",
  requireSignin,
  adminMiddleware,
  deleteCompany
);
route.put("/update-company/:Id", requireSignin, adminMiddleware, updateCompany);
route.get("/view-all-company", viewAllCompany);
route.get("/search-company/:name", searchCompany);
route.get("/company-details/:Id", searchCompanyById);
route.post("/add-search-history", saveRecentCompany);
route.get("/view-recent-search-history/:Id", viewRecentCompany);

module.exports = route;
