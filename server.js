const express = require("express");
const cors = require("cors");
const db = require("./models");
const cookieParser = require("cookie-parser");
require("dotenv").config();
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
// ads route
const adRoute = require("./router/ad.router");

const issue2options = {
  origin: "*",
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
