const express = require("express");
const {
  addCallCenter,
  deleteCallCenter,
  updatecallCenter,
  viewCallCenters,
} = require("../controllers/callCenter.controller");
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const route = express.Router();
route.post("/add-call-center", requireSignin, adminMiddleware, addCallCenter);
route.delete(
  "/delete-call-center",
  requireSignin,
  adminMiddleware,
  deleteCallCenter
);
route.put(
  "/update-call-center",
  requireSignin,
  adminMiddleware,
  updatecallCenter
);
route.get("/get-all-call-centers", viewCallCenters);
module.exports = route;
