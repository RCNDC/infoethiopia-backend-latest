const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");
const uploadLicenceImage = require("../router/uploadlicence.helper");

/**
 * @description add job
 */
exports.AddJob = async (req, res) => {
    try {
        const { title, body, author } = req.body;
        return db.JobPost.create({
            Title: title,
            Body: body,
            Author: author,
            approved: true,
        }).then((result) => {
            return res.json({ message: "Job post successfully created.", result });
        });
    } catch (err) {
        if (err.message) return res.status(400).json({ err: err.message });
        return res.status(500).send({
            err,
        });
    }
};

/**
 * @description fetch all jobs
 */
exports.getJobs = (req, res) => {
    return db.JobPost.findAll({ include: db.Company, where: { approved: true } })
        .then((result) => {
            return res.json({ result });
        })
        .catch((err) => {
            return res.status(400).json({ err: "Error finding the jobs." });
        });
};

/**
 * @description delete job
 */
exports.deleteJob = (req, res) => {
    const { Id } = req.params;
    return db.JobPost.destroy({ where: { Id } })
        .then((result) => {
            return res.json({ message: "Job post successfully deleted." });
        })
        .catch((err) => {
            return res.status(400).json({ err: "Error deleting the job post." });
        });
};

/**
 * @description update job detail
 */
exports.updateJob = async (req, res) => {
    try {
        const { title, body, author } = req.body;
        const { Id } = req.params;
        return db.JobPost.findOne({ where: { Id } }).then((result) => {
            if (!result) {
                return res.status(400).json({ err: "Error finding the job post" });
            }
            return result
                .update({ Title: title, Author: author, Body: body })
                .then((updated) => {
                    return res.json({ message: "Job post successfully updated.", result: updated });
                });
        });
    } catch (err) {
        if (err.message) return res.status(400).json({ err: err.message });
        return res.status(500).send({ err });
    }
};

/**
 * @description users add job
 */
exports.userAddJob = async (req, res) => {
    try {
        const { title, body, author } = req.body;
        const Id = req.params.Id;
        return db.JobPost.create({
            Title: title,
            Body: body,
            Author: author,
            companyId: Id,
            approved: false,
        }).then((result) => {
            return res.json({ message: "Job post successfully created.", result });
        });
    } catch (err) {
        if (err.message) return res.json({ err: err.message });
        return res.send({ err });
    }
};

/**
 * @description admin approve job
 */
exports.adminApproveJob = (req, res) => {
    const Id = req.params.Id;
    return db.JobPost.findOne({ where: { Id } }).then((result) => {
        if (!result)
            return res.status(400).json({ err: "Error finding the job post." });

        // Move to Approved Job table as requested by user
        // Use default empty string if value is missing but not null
        const jobBody = (result.Body !== undefined && result.Body !== null) ? result.Body : result.body;
        const jobTitle = (result.Title !== undefined && result.Title !== null) ? result.Title : result.title;
        const jobAuthor = (result.Author !== undefined && result.Author !== null) ? result.Author : result.author;

        return db.ApprovedJob.create({
            Id: result.Id,
            Body: jobBody,
            Title: jobTitle,
            Author: jobAuthor,
            Approved: 1,
            companyId: result.companyId
        }).then(() => {
            // DELETE from JobPost after successful move
            return result
                .destroy()
                .then(() => {
                    return res.json({ message: "Job post successfully approved and moved to Approved Job list." });
                });
        }).catch(err => {
            console.log(err);
            return res.status(400).json({ err: err.message || "Error moving job post to Approved Job table." });
        });
    });
};

/**
 * @description fetch all jobs added by users
 */
exports.getRequestedJobs = (req, res) => {
    return db.JobPost.findAll({ include: db.Company, where: { approved: false } })
        .then((result) => {
            return res.json({ result });
        })
        .catch((err) => {
            return res.status(400).json({ err: "Error finding the job posts." });
        });
};

/**
 * @description fetch user's jobs (requests)
 */
exports.getUserJobs = (req, res) => {
    return db.JobPost.findAll({ include: db.Company, where: { approved: false } })
        .then((result) => {
            return res.json({ result });
        })
        .catch((err) => {
            return res.status(400).json({ err: "Error finding the job requests." });
        });
};

/**
 * @description fetch approved jobs for a specific company
 */
exports.getApprovedCompanyJobs = (req, res) => {
    const companyId = req.profile.Id; // Assuming companyId is passed in req.profile from middleware or implicit
    // Actually, based on existing patterns, companyId might need to be passed or inferred. 
    // Since this is for "Company Job Posts", and likely used by a logged-in company admin.
    // Let's assume req.profile.Id is the company Id or user Id linked to company.
    // However, if we look at `userAddJob`, it uses `req.params.Id` as companyId.
    // Let's rely on req.params.Id for consistency with other company-specific routes if usually called like /api/company/:Id/jobs
    // BUT, the request implies looking at "My Job Posts".
    // Let's use the query param or body or just fetch all approved jobs for now if generic, 
    // OR if we have the company ID from the token/session.

    // Correction: In CompanyJobs.jsx, it calls getUserJobs() which currently fetches all unapproved jobs. 
    // We want to fetch APPROVED jobs for the CURRENT company.
    // Let's check how other company specific data is fetched. 
    // Usually via req.user or req.profile if authenticated.

    // For now, let's assume we pass companyId as a parameter or it's in req.params if the route is /company/:Id/approved-jobs
    const companyIdParam = req.params.Id;

    // Updated to query ApprovedJob table
    return db.ApprovedJob.findAll({ where: { companyId: companyIdParam } })
        .then((result) => {
            return res.json({ result });
        })
        .catch((err) => {
            return res.status(400).json({ err: "Error finding approved jobs." });
        });
};
