const express = require("express");
const {
  getAllAds,
  addAd,
  deleteAd,
} = require("../controllers/ad.controller");
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const route = express.Router();
// endpoint to get all ads
route.get("/get-all-ads", getAllAds);
// endpoint to add ads
route.post("/add-ad", requireSignin, adminMiddleware, addAd);
// endpoint to delete ads
route.delete("/delete-ad/:Id", requireSignin, adminMiddleware, deleteAd);

module.exports = route;
