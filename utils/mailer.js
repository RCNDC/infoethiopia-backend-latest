const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "infoethiopia.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS,
  },
});

const LOGO_URL =
  "https://news.infoethiopia.net/wp-content/uploads/2026/01/infoEthiopiaLogo.714b715b-removebg-preview.png";

const baseTemplate = (title, bodyHtml, preheaderText = "") => `
  <div style="font-family: 'Cabin', Arial, sans-serif; background:#f5f7fb; padding:24px;">
    <!-- Hidden Preheader Text for Email Preview -->
    <span style="display:none!important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; max-height:0; max-width:0; overflow:hidden; mso-hide:all;">
      ${preheaderText}
      &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </span>
    
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#143d59,#f49703); color:#fff; padding:20px 24px; display:flex; align-items:center; gap:12px;">
        <img src="${LOGO_URL}" alt="Info Ethiopia" style="height:48px; width:auto; display:block; background:#ffffff; padding:4px 6px; border-radius:6px;" />
        <div>
          <h2 style="margin:0; font-size:18px; font-weight:700;">${title}</h2>
        </div>
      </div>
      <div style="padding:24px; color:#1f2937; font-size:14px; line-height:1.6;">
        ${bodyHtml}
        <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />
        <div style="font-size:12px; color:#6b7280;">
          <div style="font-weight:600; color:#111827;">Contact</div>
          <div>+251925002580 / +251943141717</div>
          <div>contact@infoethiopia.net</div>
        </div>
      </div>
    </div>
  </div>
`;

const buildResetCodeEmail = (code) => {
  // This is what shows up in the inbox preview (Subject + this text)
  const preheader = `We received a request to reset your password. Your Verification code: ${code}. This code expires in 10 minutes. Contact +251925002580`;

  const body = `
    <p style="font-size:15px; margin-bottom:8px;">Your verification code:</p>
    <div style="display:inline-block; padding:12px 18px; border-radius:10px; background:#0f172a; color:#fff; font-size:22px; letter-spacing:6px; font-weight:700;">${code}</div>
    <p style="margin-top:16px;">This code expires in <strong>10 minutes</strong>.</p>
  `;

  return baseTemplate(
    "Password Reset Verification Code",
    body,
    preheader
  );
};

const buildStatusEmail = ({ type, approved, title, companyName }) => {
  let label = "Submission";
  if (type === "job") label = "Job";
  else if (type === "news") label = "News";
  else if (type === "company") label = "Company Registration";

  const statusLine = approved
    ? `${label} approved`
    : `${label} disapproved`;

  const displayTitle = title || companyName || "your submission";
  const preheader = `Your ${label} "${displayTitle}" has been ${approved ? "approved" : "disapproved"}.`;

  const body = `
    <p>Dear<strong>${companyName || " customer"}</strong>,</p>
    <p>Your ${label} for <strong>${displayTitle}</strong> has been ${approved ? "approved" : "disapproved"}.</p>
    <p>If you have any questions, feel free to reply to this email.</p>
  `;
  return baseTemplate(statusLine, body, preheader);
};

const buildApplicantUpdateEmail = ({
  applicantName,
  companyName,
  jobTitle,
  status,
  message,
}) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  const title = normalizedStatus === "rejected"
    ? "Job Application Update"
    : normalizedStatus === "accepted"
      ? "Job Application Accepted"
      : "Job Application Under Review";
  const preheader = `Your application for ${jobTitle || "this role"} at ${companyName || "InfoEthiopia"} is ${normalizedStatus || "updated"}.`;
  const defaultMessage = normalizedStatus === "rejected"
    ? `Thank you for applying for <strong>${jobTitle || "this role"}</strong>. After review, the company decided not to move forward with this application.`
    : normalizedStatus === "accepted"
      ? `Congratulations. Your application for <strong>${jobTitle || "this role"}</strong> has been accepted by <strong>${companyName || "the company"}</strong>.`
      : `Your application for <strong>${jobTitle || "this role"}</strong> is currently under review by <strong>${companyName || "the company"}</strong>.`;

  const body = `
    <p>Dear <strong>${applicantName || "Applicant"}</strong>,</p>
    <p>${defaultMessage}</p>
    ${message ? `<div style="margin-top:16px; padding:16px; border-radius:10px; background:#f3f4f6;">${message}</div>` : ""}
  `;

  return baseTemplate(title, body, preheader);
};

const sendMail = async ({ to, subject, html, from, replyTo }) => {
  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    replyTo,
  });
};

module.exports = {
  sendMail,
  buildResetCodeEmail,
  buildStatusEmail,
  buildApplicantUpdateEmail,
};
