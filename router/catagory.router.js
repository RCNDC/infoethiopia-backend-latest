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
route.get("/view-catagory/:Id", viewCompaniesList);

module.exports = route;
 