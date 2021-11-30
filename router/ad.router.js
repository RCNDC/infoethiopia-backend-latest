const express = require("express");
const {
  getAllAds,
  addAd,
  deleteAd,
  deleteAdSpace,
} = require("../controllers/ad.controller");
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const route = express.Router();
route.get("/get-all-ads", getAllAds);
route.post("/add-ad", requireSignin, adminMiddleware, addAd);
route.delete("/delete-ad/:Id", requireSignin, adminMiddleware, deleteAd);
route.delete("/delete-ad-space/:Id", requireSignin, adminMiddleware, deleteAdSpace);
module.exports=route