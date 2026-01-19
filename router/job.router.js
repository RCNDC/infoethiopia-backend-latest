const express = require("express");
const route = express.Router();
const {
    requireSignin,
    adminMiddleware,
} = require("../controllers/auth.controller");
const {
    AddJob,
    getJobs,
    deleteJob,
    updateJob,
    userAddJob,
    adminApproveJob,
    getRequestedJobs,
} = require("../controllers/job.controller");

route.post("/add-job", requireSignin, adminMiddleware, AddJob);
route.get("/get-jobs", getJobs);
route.get("/get-requested-jobs", requireSignin, adminMiddleware, getRequestedJobs);
route.delete("/delete-job/:Id", requireSignin, adminMiddleware, deleteJob);
route.put("/update-job/:Id", requireSignin, adminMiddleware, updateJob);
route.put(
    "/admin-approve-job/:Id",
    requireSignin,
    adminMiddleware,
    adminApproveJob
);
route.post("/user-add-job/:Id", userAddJob);

module.exports = route;
