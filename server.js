const express = require("express");
const cors = require("cors");
const db = require("./models");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const app = express();
const morgan = require("morgan");

const authRoute = require("./router/auth.router");
const callCenterRoute = require("./router/callCenter.router");
const catagoryRoute = require("./router/catagory.router");
const companyRoute = require("./router/company.router");
const contactListRoute = require("./router/contactList.router");
const serviceRoute = require("./router/service.router");
const userRoute = require("./router/user.router");
const newsRoute = require("./router/news.router");

const issue2options = {
  origin: [
    "http://localhost:3000",
    "http://192.168.1.6:3000",
    "http://192.168.1.9:3003",
    "https://manageinfoethiopia.rcndc.com","http://infoethiopia.rcndc.com"
  ],
  allowedHeaders:
    "x-access-token, Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length,token",
  methods: ["GET", "PUT", "POST", "DELETE"],
  credentials: true,
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({ ...issue2options }));
app.use(express.static("uploads"));

app.use("/api", authRoute);
app.use("/api", callCenterRoute);
app.use("/api", catagoryRoute);
app.use("/api", companyRoute);
app.use("/api", contactListRoute);
app.use("/api", serviceRoute);
app.use("/api", userRoute);
app.use("/api", newsRoute);

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
    return err;
  }
};
startServer();
