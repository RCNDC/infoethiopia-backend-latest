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
  // addCompanyFromFile,
  addCompanyForCatagory,
  userAddCompany,
  addCompanyFromForminator,
  getAllRequestedCompanies,
  adminUpdateUserRequest,
  approveRequestedCompanies,
  userUpdateCompany,
  getAllUpdateRequestedCompanies,
  approveUpdateCompanyRequest,
  deleteUpdateCompanyRequest,
  getTotalCount,
  viewAllCompanyWithPage,
  totalCompany,
  viewFilteredCompanyWithPage,
  getAllAddress,
  searchCompaniesByName,
} = require("../controllers/company.controller");
route.post("/add-company", requireSignin, adminMiddleware, addCompany);
route.post("/user-add-company", userAddCompany);
route.post("/add-company-from-forminator", addCompanyFromForminator);
// route.post(
//   "/add-company-from-file",
//   requireSignin,
//   adminMiddleware,
//   addCompanyFromFile
// );
route.post(
  "/add-company-for-catagory/:Id",
  requireSignin,
  adminMiddleware,
  addCompanyForCatagory
);
route.delete(
  "/delete-company/:Id",
  requireSignin,
  adminMiddleware,
  deleteCompany
);
route.put("/update-company/:Id", requireSignin, adminMiddleware, updateCompany);
route.put(
  "/update-requested-company/:Id",
  requireSignin,
  adminMiddleware,
  adminUpdateUserRequest
);
route.put("/user-update-company/:Id", userUpdateCompany);
route.get("/view-all-company", viewAllCompany);
route.get("/view-all-company-with-page/:page/:limit", viewAllCompanyWithPage);
route.put(
  "/view-filtered-company-with-page/:page/:limit",
  viewFilteredCompanyWithPage
);
route.get("/search-company/:slug", searchCompany);
route.get("/search-companies-by-name/name", searchCompaniesByName);
route.get("/company-details/:Id", searchCompanyById);
route.post("/add-search-history", saveRecentCompany);
route.get("/view-recent-search-history/:Id", viewRecentCompany);
route.get("/get-all-requested-companies", getAllRequestedCompanies);
route.get(
  "/get-all-updated-requested-companies",
  getAllUpdateRequestedCompanies
);
route.delete(
  "/deleted-requested-companies/:Id",
  requireSignin,
  adminMiddleware,
  deleteCompany
);
route.delete(
  "/deleted-update-requested-companies/:Id",
  requireSignin,
  adminMiddleware,
  deleteUpdateCompanyRequest
);
route.put(
  "/approve-requested-company/:Id",
  requireSignin,
  adminMiddleware,
  approveRequestedCompanies
);
route.put(
  "/approve-update-requested-company/:Id",
  requireSignin,
  adminMiddleware,
  approveUpdateCompanyRequest
);
route.get("/get-total-count-of-company", getTotalCount);
route.get("/total-company", totalCompany);
route.get("/all-addresses", getAllAddress);

module.exports = route;
