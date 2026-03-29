const { join } = require("path");
const fs = require("fs");
const uploadImage = require("../router/upload.helper");
const db = require("../models");
const { sendMail, buildStatusEmail, buildApplicantUpdateEmail } = require("../utils/mailer");
const uploadLicenceImage = require("../router/uploadlicence.helper");

const toPlain = (record) => (record && typeof record.toJSON === "function" ? record.toJSON() : record);
const JOB_APPLICANT_STATUSES = {
    submitted: "submitted",
    reviewing: "reviewing",
    accepted: "accepted",
    rejected: "rejected",
};
const EMPLOYMENT_TYPES = new Set(["full-time", "part-time"]);
const WORK_MODES = new Set(["hybrid", "onsite", "remote"]);
const normalizeText = (value) => {
    const trimmed = String(value || "").trim();
    return trimmed ? trimmed : null;
};

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
            where: { jobPostId: jobIds, archivedAt: null },
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

const getApplicantAccessContext = async (requesterId, applicantId) => {
    const applicant = await db.JobApplicant.findOne({
        where: { Id: applicantId },
        include: [{ model: db.JobPost }],
    });
    if (!applicant || !applicant.JobPost) {
        return { applicant: null, job: null, company: null, staff: null };
    }

    const staff = await db.Staff.findOne({ where: { Id: requesterId } });
    if (staff) {
        const company = applicant.JobPost.companyId
            ? await db.Company.findOne({ where: { Id: applicant.JobPost.companyId } })
            : null;
        return { applicant, job: applicant.JobPost, company, staff };
    }

    const dashboardUser = await db.CompanyDashboard.findOne({ where: { Id: requesterId } });
    if (!dashboardUser) {
        return { applicant: null, job: null, company: null, staff: null };
    }

    const company = await db.Company.findOne({
        where: { email: dashboardUser.email },
        order: [["createdAt", "DESC"]],
    });
    if (!company || applicant.JobPost.companyId !== company.Id) {
        return { applicant: null, job: null, company: null, staff: null };
    }

    return { applicant, job: applicant.JobPost, company, staff: null };
};

const sendApplicantLifecycleEmail = async ({
    applicant,
    company,
    job,
    status,
    subject,
    message,
}) => {
    const normalizedStatus = String(status || "").trim().toLowerCase();
    const emailSubject = normalizeText(subject)
        || (normalizedStatus === JOB_APPLICANT_STATUSES.rejected
            ? `Update on your application for ${job.Title || "this role"}`
            : normalizedStatus === JOB_APPLICANT_STATUSES.accepted
                ? `Next steps for ${job.Title || "this role"}`
                : `Update on your application for ${job.Title || "this role"}`);
    const emailMessage = normalizeText(message);

    await sendMail({
        from: "InfoEthiopia Jobs <job@infoethiopia.net>",
        to: applicant.email,
        subject: emailSubject,
        html: buildApplicantUpdateEmail({
            applicantName: applicant.fullName,
            companyName: company?.name || job.Author || "the company",
            jobTitle: job.Title || "this role",
            status: normalizedStatus,
            message: emailMessage,
        }),
        replyTo: company?.email || "contact@infoethiopia.net",
    });

    await applicant.update({
        companyMessage: emailMessage || applicant.companyMessage,
        lastEmailSubject: emailSubject,
        lastEmailSentAt: new Date(),
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
        const {
            fullName,
            email,
            phone,
            currentCompany,
            employmentType,
            workCountry,
            workCity,
            workMode,
            workPeriod,
            roleTitle,
            education,
            licensesAndCertifications,
            skills,
        } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({ err: "Full name and email are required." });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ err: "Please provide a valid email address." });
        }

        const normalizedEmploymentType = normalizeText(employmentType)?.toLowerCase() || null;
        const normalizedWorkMode = normalizeText(workMode)?.toLowerCase() || null;
        if (normalizedEmploymentType && !EMPLOYMENT_TYPES.has(normalizedEmploymentType)) {
            return res.status(400).json({ err: "Employment type must be full-time or part-time." });
        }
        if (normalizedWorkMode && !WORK_MODES.has(normalizedWorkMode)) {
            return res.status(400).json({ err: "Work mode must be hybrid, onsite, or remote." });
        }
        if (!normalizeText(currentCompany) || !normalizedEmploymentType || !normalizeText(workCountry)
            || !normalizeText(workCity) || !normalizedWorkMode || !normalizeText(workPeriod)
            || !normalizeText(roleTitle) || !normalizeText(education) || !normalizeText(skills)) {
            return res.status(400).json({
                err: "Current company, employment type, work country, work city, work mode, work period, role, education, and skills are required.",
            });
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
            phone: normalizeText(phone),
            currentCompany: normalizeText(currentCompany),
            employmentType: normalizedEmploymentType,
            workCountry: normalizeText(workCountry),
            workCity: normalizeText(workCity),
            workMode: normalizedWorkMode,
            workPeriod: normalizeText(workPeriod),
            roleTitle: normalizeText(roleTitle),
            education: normalizeText(education),
            licensesAndCertifications: normalizeText(licensesAndCertifications),
            skills: normalizeText(skills),
            applicationStatus: JOB_APPLICANT_STATUSES.submitted,
            statusUpdatedAt: new Date(),
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
            where: { jobPostId: job.Id, archivedAt: null },
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
 * @description get a single applicant and mark as reviewing when the company opens details
 */
exports.getJobApplicantDetails = async (req, res) => {
    try {
        const requesterId = req.user?.Id;
        const { applicantId } = req.params;
        const context = await getApplicantAccessContext(requesterId, applicantId);
        if (!context.applicant || !context.job) {
            return res.status(403).json({ err: "Not authorized to view this applicant." });
        }
        if (context.applicant.archivedAt && !context.staff) {
            return res.status(404).json({ err: "Applicant not found." });
        }

        if (context.applicant.applicationStatus === JOB_APPLICANT_STATUSES.submitted) {
            await context.applicant.update({
                applicationStatus: JOB_APPLICANT_STATUSES.reviewing,
                reviewedAt: context.applicant.reviewedAt || new Date(),
                statusUpdatedAt: new Date(),
            });
            try {
                await sendApplicantLifecycleEmail({
                    applicant: context.applicant,
                    company: context.company,
                    job: context.job,
                    status: JOB_APPLICANT_STATUSES.reviewing,
                });
            } catch (mailErr) {
                console.error("Applicant reviewing email failed:", mailErr);
            }
        }

        return res.json({
            applicant: toPlain(context.applicant),
            job: {
                Id: context.job.Id,
                Title: context.job.Title,
            },
        });
    } catch (err) {
        console.error("Get Job Applicant Detail Error:", err);
        return res.status(500).json({ err: "Error fetching applicant details." });
    }
};

/**
 * @description update applicant status and send status emails for accepted/rejected
 */
exports.updateJobApplicantStatus = async (req, res) => {
    try {
        const requesterId = req.user?.Id;
        const { applicantId } = req.params;
        const { status, emailSubject, emailMessage, companyMessage } = req.body || {};
        const normalizedStatus = String(status || "").trim().toLowerCase();

        if (![JOB_APPLICANT_STATUSES.reviewing, JOB_APPLICANT_STATUSES.accepted, JOB_APPLICANT_STATUSES.rejected].includes(normalizedStatus)) {
            return res.status(400).json({ err: "Invalid applicant status." });
        }

        const context = await getApplicantAccessContext(requesterId, applicantId);
        if (!context.applicant || !context.job) {
            return res.status(403).json({ err: "Not authorized to update this applicant." });
        }
        if (context.applicant.archivedAt && !context.staff) {
            return res.status(400).json({ err: "Archived applicants cannot be updated." });
        }

        const updatePayload = {
            applicationStatus: normalizedStatus,
            statusUpdatedAt: new Date(),
            companyMessage: normalizeText(companyMessage) || context.applicant.companyMessage,
        };
        if (!context.applicant.reviewedAt) {
            updatePayload.reviewedAt = new Date();
        }

        await context.applicant.update(updatePayload);

        if ([JOB_APPLICANT_STATUSES.accepted, JOB_APPLICANT_STATUSES.rejected].includes(normalizedStatus)) {
            await sendApplicantLifecycleEmail({
                applicant: context.applicant,
                company: context.company,
                job: context.job,
                status: normalizedStatus,
                subject: emailSubject,
                message: emailMessage || companyMessage,
            });
        }

        return res.json({
            message: `Applicant marked as ${normalizedStatus}.`,
            applicant: toPlain(context.applicant),
        });
    } catch (err) {
        console.error("Update Job Applicant Status Error:", err);
        return res.status(500).json({ err: "Error updating applicant status." });
    }
};

/**
 * @description send a custom email to an applicant
 */
exports.sendJobApplicantEmail = async (req, res) => {
    try {
        const requesterId = req.user?.Id;
        const { applicantId } = req.params;
        const { subject, message } = req.body || {};
        const emailSubject = normalizeText(subject);
        const emailMessage = normalizeText(message);

        if (!emailSubject || !emailMessage) {
            return res.status(400).json({ err: "Email subject and message are required." });
        }

        const context = await getApplicantAccessContext(requesterId, applicantId);
        if (!context.applicant || !context.job) {
            return res.status(403).json({ err: "Not authorized to email this applicant." });
        }
        if (context.applicant.archivedAt && !context.staff) {
            return res.status(400).json({ err: "Archived applicants cannot be emailed from the dashboard." });
        }

        await sendApplicantLifecycleEmail({
            applicant: context.applicant,
            company: context.company,
            job: context.job,
            status: context.applicant.applicationStatus,
            subject: emailSubject,
            message: emailMessage,
        });

        return res.json({
            message: "Email sent to applicant successfully.",
            applicant: toPlain(context.applicant),
        });
    } catch (err) {
        console.error("Send Job Applicant Email Error:", err);
        return res.status(500).json({ err: "Error sending applicant email." });
    }
};

/**
 * @description soft-delete applicant from company dashboard after rejection
 */
exports.archiveJobApplicant = async (req, res) => {
    try {
        const requesterId = req.user?.Id;
        const { applicantId } = req.params;
        const context = await getApplicantAccessContext(requesterId, applicantId);
        if (!context.applicant || !context.job) {
            return res.status(403).json({ err: "Not authorized to archive this applicant." });
        }
        if (context.applicant.applicationStatus !== JOB_APPLICANT_STATUSES.rejected) {
            return res.status(400).json({ err: "Applicants can only be removed from the dashboard after rejection." });
        }
        if (context.applicant.archivedAt) {
            return res.json({ message: "Applicant already removed from the dashboard." });
        }

        await context.applicant.update({
            archivedAt: new Date(),
            statusUpdatedAt: new Date(),
        });

        return res.json({ message: "Applicant removed from the dashboard." });
    } catch (err) {
        console.error("Archive Job Applicant Error:", err);
        return res.status(500).json({ err: "Error removing applicant from dashboard." });
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
