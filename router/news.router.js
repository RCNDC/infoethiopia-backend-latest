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
  getNewsWithPage,
  getApprovedCompanyNews,
  getApprovedCompanyNewsWithPage,
  companyUpdateNews,
  companyDeleteNews,
  approveCompanyNews,
  rejectCompanyNews,
  getAllCompanyNewsForAdmin,
} = require("../controllers/news.controller");
route.post("/add-news", requireSignin, adminMiddleware, AddNews);
route.get("/get-news", getNews);
route.get("/get-news-with-page/:page/:limit", getNewsWithPage);
route.get("/get-approved-company-news", getApprovedCompanyNews);
route.get("/get-approved-company-news-with-page/:page/:limit", getApprovedCompanyNewsWithPage);
route.get("/get-user-news", getUserNews);
route.delete("/delete-news/:Id", requireSignin, adminMiddleware, deleteNews);
route.put("/update-news/:Id", requireSignin, adminMiddleware, updateNews);
route.put("/company-update-news/:Id", requireSignin, companyUpdateNews);
route.delete("/company-delete-news/:Id", requireSignin, companyDeleteNews);
route.put(
  "/admin-approve-news/:Id",
  requireSignin,
  adminMiddleware,
  adminApproveNews
);
route.post("/user-add-news/:Id", userAddNews);
route.put("/approve-company-news/:Id", requireSignin, adminMiddleware, approveCompanyNews);
route.put("/reject-company-news/:Id", requireSignin, adminMiddleware, rejectCompanyNews);
route.get("/admin/all-company-news", requireSignin, adminMiddleware, getAllCompanyNewsForAdmin);
module.exports = route;
