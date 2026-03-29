const express = require("express");
const {
  preSignup,
  signup,
  signin,
  forgotPassword,
  signout,
  adminSignup,
  staffSignin,
  companySignin,
  adminForgetpassword,
  checkCompanyEmail,
  companySignup,
  sendVerificationCode,
  verifyCode,
  resetPassword,
  getAllStaffs,
  deleteStaff,
  updateStaffRole,
  companyResetPassword,
  googleSignin,
  getCompanyProfile,
  updateCompanyProfile,
} = require("../controllers/auth.controller");
const { requireSignin } = require("../controllers/auth.controller");
const {
  getAllRoles,
  createRole,
  editRole,
  deleteRole
} = require("../controllers/role.controller");
const {
  addMenu,
  getAllMenus,
  assignMenuToRole,
  getRoleMenus
} = require("../controllers/menu.controller");

const route = express.Router();

route.post("/pre-signup", preSignup);
route.post("/signup", signup);
route.post("/signin", signin);
route.post("/staff-signin", staffSignin);
route.post("/company-signin", companySignin);
route.put("/forgot-password", forgotPassword);
route.put("/verify-code", verifyCode);
route.put("/reset-password", resetPassword);
route.get("/signout", signout);
route.post("/admin-signup", adminSignup);
route.get("/admin-forget-password", adminForgetpassword);

// Staff Management
route.get("/staffs", getAllStaffs);
route.delete("/staff/:id", deleteStaff);
route.put("/staff/update-role", updateStaffRole);

// Role Management
route.get("/roles", getAllRoles);
route.post("/role", createRole);
route.put("/role/:id", editRole);
route.delete("/role/:id", deleteRole);

// Menu Management
route.get("/menus", getAllMenus);
route.post("/menu", addMenu);
route.post("/role-menus", assignMenuToRole);
route.get("/role-menus/:roleId", getRoleMenus);

route.post("/check-company-email", checkCompanyEmail);
route.post("/company-signup", companySignup);
route.post("/send-verification-code", sendVerificationCode);
route.post("/verify-code", verifyCode);
route.put("/company-reset-password", companyResetPassword);
route.post("/google-signin", googleSignin);
route.get("/company-profile", requireSignin, getCompanyProfile);
route.put("/company-profile", requireSignin, updateCompanyProfile);

module.exports = route;


