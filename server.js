const express = require("express");
const cors = require("cors");
const db = require("./models");
const cookieParser = require("cookie-parser");
require("./config/loadEnv");
const app = express();
const morgan = require("morgan");
// authentication route
const authRoute = require("./router/auth.router");
// call center route
const callCenterRoute = require("./router/callCenter.router");
// category route
const catagoryRoute = require("./router/catagory.router");
// company route
const companyRoute = require("./router/company.router");
// contact list route
const contactListRoute = require("./router/contactList.router");
// company service route
const serviceRoute = require("./router/service.router");
// user route
const userRoute = require("./router/user.router");
// news route
const newsRoute = require("./router/news.router");
// job route
const jobRoute = require("./router/job.router");
// ads route
const adRoute = require("./router/ad.router");

const rootHealthHtml = Buffer.from(
  "<!doctype html><html><head><title>InfoEthiopia Backend</title></head><body>InfoEthiopia Backend is running.</body></html>"
);

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://managecompany.infoethiopia.net",
  "https://infoethiopia.net",
  "https://www.infoethiopia.net",
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultAllowedOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed."));
  },
  allowedHeaders:
    "x-access-token, Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length, token",
  methods: ["GET", "PUT", "POST", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.disable("x-powered-by");
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));

app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.get("/", (req, res) => {
  res.status(200);
  res.setHeader("Content-Type", "text/html");
  res.send(rootHealthHtml);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(express.static("uploads"));
app.use("/api/images", express.static("uploads/images"));

app.use("/api", authRoute);
app.use("/api", callCenterRoute);
app.use("/api", catagoryRoute);
app.use("/api", companyRoute);
app.use("/api", contactListRoute);
app.use("/api", serviceRoute);
app.use("/api", userRoute);
app.use("/api", newsRoute);
app.use("/api", jobRoute);
app.use("/api", adRoute);
const startServer = async () => {
  try {
    db.sequelize.authenticate().then(() => {
      app.listen(process.env.PORT || 8000, () => {
        console.log(
          `Server ready at http://localhost:${process.env.PORT || 8000}`
        );
      });
    });
  } catch (err) {
    console.log(err);
    return err;
  }
};
startServer();
