const express = require("express");
const {
  preSignup,
  signup,
  signin,
  forgotPassword,
  signout,
  adminSignup,
  staffSignin,
  adminForgetpassword,
} = require("../controllers/auth.controller");
const route = express.Router();

route.post("/pre-signup", preSignup);
route.post("/signup", signup);
route.post("/signin", signin);
route.post("/staff-signin", staffSignin);
route.put("/forgot-password", forgotPassword);
route.get("/signout", signout);
route.post("/admin-signup", adminSignup);
route.get("/admin-forget-password", adminForgetpassword);

module.exports = route;
