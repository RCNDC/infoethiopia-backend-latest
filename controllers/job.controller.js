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
        await uploadImage(req, res);
        if (req.file == undefined) {
            return res.status(400).json({ err: "Please upload a file!" });
        }
        const imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
        const { title, body, author } = req.body;
        return db.JobPost.create({
            title,
            headingImage: imageURI,
            body,
            author,
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
        let image = true;
        await uploadImage(req, res);
        if (req.file == undefined) {
            image = false;
        }
        const { title, body, author } = req.body;
        const { Id } = req.params;
        return db.JobPost.findOne({ where: { Id } }).then((result) => {
            if (!result) {
                return res.status(400).json({ err: "Error finding the job post" });
            }
            let imageURI = undefined;

            if (image) {
                // delete the previous image if it's updated
                try {
                    const oldImagePath = join(
                        __dirname,
                        `../uploads/images/${result.headingImage.split("images/")[1]}`
                    );
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (e) {
                    console.log("Error deleting old image", e.message);
                }
                imageURI = `${process.env.BASE_URL}/images/${req.file.filename}`;
            }
            return result
                .update({ title, headingImage: imageURI || result.headingImage, author, body })
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
        await uploadLicenceImage(req, res);
        if (!req.files.licence) {
            return res.json({ err: "Please upload the licence." });
        }
        let licenceURI = `${process.env.BASE_URL}/docs/${req.files.licence[0].filename}`;

        if (req.files.image == undefined) {
            return res.json({ err: "Please upload the heading image." });
        }
        let imageURI = `${process.env.BASE_URL}/images/${req.files.image[0].filename}`;
        const { title, body, author } = req.body;
        const Id = req.params.Id;
        return db.JobPost.create({
            title,
            headingImage: imageURI,
            body,
            author,
            licence: licenceURI,
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
        return result
            .update({ approved: true })
            .then((updated) => {
                return res.json({ message: "Job post successfully approved.", result: updated });
            })
            .catch((err) => {
                return res.status(400).json({ err: "Error approving the job post." });
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
