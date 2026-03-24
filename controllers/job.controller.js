const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");
const { sendMail, buildStatusEmail } = require("../utils/mailer");
const uploadLicenceImage = require("../router/uploadlicence.helper");

const toPlain = (record) => (record && typeof record.toJSON === "function" ? record.toJSON() : record);

const attachApplicantCounts = async (jobs) => {
    const records = Array.isArray(jobs) ? jobs : [];
    if (!records.length || !db.JobApplicant) {
        return records.map((item) => ({ ...toPlain(item), applicantCount: 0 }));
    }

    const jobIds = records.map((item) => item.Id).filter(Boolean);
    if (!jobIds.length) {
        return records.map((item) => ({ ...toPlain(item), applicantCount: 0 }));
    }

    let rows = [];
    try {
        rows = await db.JobApplicant.findAll({
            attributes: [
                "jobPostId",
                [db.sequelize.fn("COUNT", db.sequelize.col("Id")), "count"],
            ],
            where: { jobPostId: jobIds },
            group: ["jobPostId"],
            raw: true,
        });
    } catch (err) {
        if (err?.original?.code === "ER_NO_SUCH_TABLE") {
            return records.map((item) => ({ ...toPlain(item), applicantCount: 0 }));
        }
        throw err;
    }

    const countMap = rows.reduce((acc, row) => {
        acc[row.jobPostId] = Number(row.count || 0);
        return acc;
    }, {});

    return records.map((item) => {
        const plain = toPlain(item);
        return {
            ...plain,
            applicantCount: countMap[plain.Id] || 0,
        };
    });
};

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
            approved: true, // Assuming direct add is approved
            status: "approved"
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
 * @description fetch all jobs (public view, approved only)
 */
exports.getJobs = async (req, res) => {
    try {
        const result = await db.JobPost.findAll({ include: db.Company, where: { approved: true } });
        const withCounts = await attachApplicantCounts(result);
        return res.json({ result: withCounts });
    } catch (err) {
        return res.status(400).json({ err: "Error finding the jobs." });
    }
};

/**
 * @description delete job / disapprove
 */
exports.deleteJob = async (req, res) => {
    const { Id } = req.params;
    try {
        const job = await db.JobPost.findOne({ where: { Id } });
        if (!job) {
            return res.status(400).json({ err: "Error finding the job post." });
        }

        // If it was already approved or pending, we reject it (set to 0/false)
        const company = await db.Company.findOne({ where: { Id: job.companyId } });
        if (company && company.email) {
            try {
                await sendMail({
                    from: "InfoEthiopia Jobs <job@infoethiopia.net>",
                    to: company.email,
                    subject: "Job Post Disapproved",
                    html: buildStatusEmail({
                        type: "job",
                        approved: false,
                        title: job.Title || job.title,
                        companyName: company.name,
                    }),
                    replyTo: "contact@infoethiopia.net",
                });
            } catch (mailErr) {
                console.error("Job disapproval email failed:", mailErr);
            }
        }

        await job.update({ approved: false, status: "rejected" });
        return res.json({ message: "Job post rejected/disapproved." });
    } catch (err) {
        return res.status(400).json({ err: "Error processing the job post." });
    }
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
        const { title, body, author, companyEmail, companyName, companyDescription, companyLogo } = req.body;
        const Id = req.params.Id;

        let companyId = Id;
        if (companyEmail) {
            const normalizedEmail = String(companyEmail).trim().toLowerCase();
            const [company] = await db.Company.findOrCreate({
                where: { email: normalizedEmail },
                defaults: {
                    name: companyName || normalizedEmail,
                    description: companyDescription || null,
                    logo: companyLogo || null,
                    email: normalizedEmail,
                    approved: true,
                },
            });
            companyId = company.Id;
        }
        return db.JobPost.create({
            Title: title,
            Body: body,
            Author: author,
            companyId: companyId,
            approved: null, // Initially null (pending)
            status: "pending",
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
exports.adminApproveJob = async (req, res) => {
    const { Id } = req.params;
    try {
        const result = await db.JobPost.findOne({ where: { Id } });
        if (!result) {
            return res.status(400).json({ err: "Error finding the job post." });
        }

        // Approve in place
        await result.update({ approved: true, status: "approved" });

        const company = await db.Company.findOne({ where: { Id: result.companyId } });
        if (company && company.email) {
            try {
                await sendMail({
                    from: "InfoEthiopia Jobs <job@infoethiopia.net>",
                    to: company.email,
                    subject: "Job Post Approved",
                    html: buildStatusEmail({
                        type: "job",
                        approved: true,
                        title: result.Title || result.title,
                        companyName: company.name,
                    }),
                    replyTo: "contact@infoethiopia.net",
                });
            } catch (mailErr) {
                console.error("Job approval email failed:", mailErr);
            }
        }

        return res.json({ message: "Job post successfully approved." });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ err: err.message || "Error approving job post." });
    }
};

/**
 * @description fetch all jobs added by users (Pending for Admin)
 */
exports.getRequestedJobs = async (req, res) => {
    try {
        const result = await db.JobPost.findAll({ include: db.Company, where: { approved: null } });
        const withCounts = await attachApplicantCounts(result);
        return res.json({ result: withCounts });
    } catch (err) {
        return res.status(400).json({ err: "Error finding the job posts." });
    }
};

/**
 * @description fetch user's jobs (requests)
 */
exports.getUserJobs = async (req, res) => {
    try {
        const { email } = req.query;
        if (email) {
            const company = await db.Company.findOne({ where: { email } });
            if (!company) return res.json({ result: [] });
            const result = await db.JobPost.findAll({
                where: { companyId: company.Id },
                order: [["createdAt", "DESC"]],
            });
            const withCounts = await attachApplicantCounts(result);
            return res.json({ result: withCounts });
        }

        // Admin view: only pending
        const result = await db.JobPost.findAll({
            include: db.Company,
            where: { approved: null },
            order: [["createdAt", "DESC"]],
        });
        const withCounts = await attachApplicantCounts(result);
        return res.json({ result: withCounts });
    } catch (err) {
        return res.status(400).json({ err: "Error finding the job requests." });
    }
};

/**
 * @description fetch approved jobs for a specific company
 */
exports.getApprovedCompanyJobs = async (req, res) => {
    const companyIdParam = req.params.Id;
    if (!companyIdParam) {
        return res.status(400).json({ err: "Company Id is required." });
    }

    try {
        const result = await db.JobPost.findAll({ where: { companyId: companyIdParam, approved: true } });
        const withCounts = await attachApplicantCounts(result);
        return res.json({ result: withCounts });
    } catch (err) {
        return res.status(400).json({ err: "Error finding approved jobs." });
    }
};

/**
 * @description Admin approve job post - updates status to "approved"
 */
exports.approveJob = (req, res) => {
    const Id = req.params.Id;
    return db.JobPost.update(
        { status: "approved", approved: true },
        { where: { Id } }
    )
        .then(() => {
            return res.json({ message: "Job approved successfully." });
        })
        .catch((err) => {
            return res.status(400).json({ err: "Error approving job." });
        });
};

/**
 * @description Admin reject job post - updates status to "rejected"
 */
exports.rejectJob = (req, res) => {
    const Id = req.params.Id;
    return db.JobPost.update(
        { status: "rejected", approved: false },
        { where: { Id } }
    )
        .then(() => {
            return res.json({ message: "Job rejected successfully." });
        })
        .catch((err) => {
            return res.status(400).json({ err: "Error rejecting job." });
        });
};

/**
 * @description Get ALL job posts for admin review (regardless of status)
 */
exports.getAllJobsForAdmin = async (req, res) => {
    try {
        const result = await db.JobPost.findAll({
            include: db.Company,
            order: [["createdAt", "DESC"]],
        });
        const withCounts = await attachApplicantCounts(result);
        return res.json({ result: withCounts });
    } catch (err) {
        return res.status(400).json({ err: "Error fetching job posts." });
    }
};

/**
 * @description apply for an approved job post
 */
exports.applyForJob = async (req, res) => {
    try {
        const { Id } = req.params;
        const { fullName, email, phone, cvLink, cvFileId, cvMessageId } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({ err: "Full name and email are required." });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ err: "Please provide a valid email address." });
        }

        const job = await db.JobPost.findOne({
            where: { Id, approved: true, status: "approved" },
        });
        if (!job) {
            return res.status(400).json({ err: "Job post not found or not approved." });
        }

        const existingApplicant = await db.JobApplicant.findOne({
            where: { jobPostId: job.Id, email: normalizedEmail },
        });
        if (existingApplicant) {
            return res.status(400).json({ err: "You already applied for this job with this email." });
        }

        const applicant = await db.JobApplicant.create({
            fullName: String(fullName).trim(),
            email: normalizedEmail,
            phone: phone ? String(phone).trim() : null,
            cvLink: cvLink ? String(cvLink).trim() : null,
            cvFileId: cvFileId ? String(cvFileId).trim() : null,
            cvMessageId: cvMessageId ? String(cvMessageId).trim() : null,
            jobPostId: job.Id,
        });

        return res.json({
            message: "Application submitted successfully.",
            applicant: {
                Id: applicant.Id,
                fullName: applicant.fullName,
                email: applicant.email,
                phone: applicant.phone,
            },
        });
    } catch (err) {
        console.error("Apply Job Error:", err);
        return res.status(500).json({ err: "Error submitting job application." });
    }
};

/**
 * @description get applicants for a specific job post (owner company or admin)
 */
exports.getJobApplicants = async (req, res) => {
    try {
        const { Id } = req.params;
        const requesterId = req.user?.Id;

        const staff = await db.Staff.findOne({ where: { Id: requesterId } });
        let job = null;

        if (staff) {
            job = await db.JobPost.findOne({ where: { Id } });
        } else {
            const dashboardUser = await db.CompanyDashboard.findOne({ where: { Id: requesterId } });
            if (!dashboardUser) {
                return res.status(403).json({ err: "Not authorized to view applicants." });
            }

            const company = await db.Company.findOne({
                where: { email: dashboardUser.email },
                order: [["createdAt", "DESC"]],
            });
            if (!company) {
                return res.status(400).json({ err: "Company not found for this account." });
            }

            job = await db.JobPost.findOne({ where: { Id, companyId: company.Id } });
        }

        if (!job) {
            return res.status(404).json({ err: "Job post not found." });
        }

        const applicants = await db.JobApplicant.findAll({
            where: { jobPostId: job.Id },
            order: [["createdAt", "DESC"]],
        });

        return res.json({
            job: {
                Id: job.Id,
                Title: job.Title,
                approved: job.approved,
                status: job.status,
            },
            count: applicants.length,
            applicants: applicants.map((item) => toPlain(item)),
        });
    } catch (err) {
        console.error("Get Job Applicants Error:", err);
        return res.status(500).json({ err: "Error fetching job applicants." });
    }
};

/**
 * @description company update job (for company dashboard users)
 */
exports.companyUpdateJob = async (req, res) => {
    try {
        const { title, body, author, companyEmail } = req.body;
        const { Id } = req.params;
        if (!companyEmail) {
            return res.status(400).json({ err: "Company email is required." });
        }

        const company = await db.Company.findOne({ where: { email: companyEmail } });
        if (!company) {
            return res.status(400).json({ err: "Company not found." });
        }

        const job = await db.JobPost.findOne({ where: { Id, companyId: company.Id } });
        if (!job) {
            return res.status(400).json({ err: "Job post not found." });
        }

        await job.update({
            Title: title,
            Body: body,
            Author: author,
            approved: null,
            status: "pending",
        });

        return res.json({ message: "Job post updated and resubmitted for approval." });
    } catch (err) {
        return res.status(500).json({ err: "Error updating job post." });
    }
};

/**
 * @description company delete job (hard delete for company dashboard users)
 */
exports.companyDeleteJob = async (req, res) => {
    const { Id } = req.params;
    const { email } = req.query;
    try {
        if (!email) {
            return res.status(400).json({ err: "Company email is required." });
        }
        const company = await db.Company.findOne({ where: { email } });
        if (!company) {
            return res.status(400).json({ err: "Company not found." });
        }

        const job = await db.JobPost.findOne({ where: { Id, companyId: company.Id } });
        if (!job) {
            return res.status(400).json({ err: "Job post not found." });
        }

        await job.destroy();
        return res.json({ message: "Job post deleted." });
    } catch (err) {
        return res.status(500).json({ err: "Error deleting job post." });
    }
};
