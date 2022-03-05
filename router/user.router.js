const express = require("express");
const {
  requireSignin,
  authMiddleware,
  adminMiddleware,
} = require("../controllers/auth.controller");
const {
  updateProfilePicture,
  updateProfile,
  changePassword,
  preChangePassword,
  getAllUsers,
  deleteUser,
  viewProfile,
  totalUsers,
} = require("../controllers/user.controller");
const route = express.Router();
route.post("/change-profile-picture", requireSignin, updateProfilePicture);
route.put("/update-profile", requireSignin, updateProfile);
route.post(
  "/pre-change-password",
  requireSignin,
  authMiddleware,
  preChangePassword
);
route.put("/change-password", requireSignin, authMiddleware, changePassword);
route.get("/get-all-users", getAllUsers);
route.delete("/delete-user/:Id", requireSignin, adminMiddleware, deleteUser);
route.get("/view-profile", requireSignin, authMiddleware, viewProfile);
route.get("/total-users", totalUsers);
module.exports = route;
