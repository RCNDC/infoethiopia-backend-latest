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
} = require("../controllers/news.controller");
route.post("/add-news", requireSignin, adminMiddleware, AddNews);
route.get("/get-news", getNews);
route.delete("/delete-news/:Id", requireSignin, adminMiddleware, deleteNews);
route.put("/update-news/:Id", requireSignin, adminMiddleware, updateNews);
module.exports = route;
