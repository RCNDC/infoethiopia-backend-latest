const express = require("express");
const {
  addCatagory,
  viewSubCatagories,
  viewAllCatagories,
  viewMainCatagories,
  updateCatagory,
  deleteCatagory,
  viewCompaniesList,
  userViewSubCatagories,
  viewCompaniesListByName,
  viewAllCatagoriesWithChildren,
  viewCompaniesListWithPage,
  viewCompaniesListByNameWithPagination,
  totalMainCatagory,
  totalSubCatagories,
} = require("../controllers/catagory.controller");
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");

const route = express.Router();

route.post("/add-catagory", requireSignin, adminMiddleware, addCatagory);
route.delete(
  "/delete-catagory",
  requireSignin,
  adminMiddleware,
  deleteCatagory
);
route.put(
  "/update-catagory/:Id",
  requireSignin,
  adminMiddleware,
  updateCatagory
);
route.get("/view-main-catagories", viewMainCatagories);
route.post("/view-sub-catagories", viewSubCatagories);
route.get("/user-view-sub-catagories/:name", userViewSubCatagories);
route.get("/view-all-catagories", viewAllCatagories);
route.get("/view-all-catagories-with-children", viewAllCatagoriesWithChildren);
route.get("/view-catagory/:Id", viewCompaniesList);
route.get(
  "/view-company-in-catagory/:Id/:page/:limit",
  viewCompaniesListWithPage
);
route.get("/view-catagory-by-name/:Name", viewCompaniesListByName);
route.get(
  "/view-catagory-by-name-with-pagination/:Name/:page/:limit",
  viewCompaniesListByNameWithPagination
);
route.get("/total-main-catagories", totalMainCatagory);
route.get("/total-sub-catagories", totalSubCatagories);

module.exports = route;
