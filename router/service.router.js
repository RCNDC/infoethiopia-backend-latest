const express = require("express");
const route = express.Router();
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  addservice,
  updateService,
  viewService,
  deleteService,
} = require("../controllers/service.controller");
route.post("/add-service/:Id", requireSignin, adminMiddleware, addservice);
route.put("/update-service/:Id", requireSignin, adminMiddleware, updateService);
route.get("/view-services/:Id", viewService);
route.delete(
  "/delete-service/:Id",
  requireSignin,
  adminMiddleware,
  deleteService
);

module.exports = route;
