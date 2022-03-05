const express = require("express");
const route = express.Router();
const {
  requireSignin,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  AddNews,
  getNews,
  deleteNews,
  updateNews,
  userAddNews,
  adminApproveNews,
  getUserNews,
} = require("../controllers/news.controller");
route.post("/add-news", requireSignin, adminMiddleware, AddNews);
route.get("/get-news", getNews);
route.get("/get-user-news", getUserNews);
route.delete("/delete-news/:Id", requireSignin, adminMiddleware, deleteNews);
route.put("/update-news/:Id", requireSignin, adminMiddleware, updateNews);
route.put(
  "/admin-approve-news/:Id",
  requireSignin,
  adminMiddleware,
  adminApproveNews
);
route.post("/user-add-news/:Id", userAddNews);
module.exports = route;
