//env file (loads environment variables from a .env file into the process.env object)
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
//validator
const validator = require("express-validator");
//passport
const passport = require("passport");
const cors = require("cors");
//initialize app
const app = express();
//require passport
require("./config/passport");
//initialize database
require("./config/db");
//cors
app.use(cors({ origin: true }));
//cookie-parser
app.use(cookieParser());
//body-parser
app.use(express.json());
//express-validator
app.use(validator());
//express-session
app.use(
  //Note if you are using Session in conjunction with PassportJS, Passport will add an empty Passport object to the session for use after a user is authenticated, which will be treated as a modification to the session, causing it to be saved
  session({
    secret: process.env.PASSPORT_SESSION_SECRET, //secret used to sign the session ID cookie
    resave: false, //if its true-->Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: true, //Forces a session that is “uninitialized” to be saved to the store
    cookie: { secure: true },
  })
);
//always put passport middleware after session middleware
app.use(passport.initialize());
app.use(passport.session());

let PORT = 8080;

//routes
app.use("/user", require("./routes/user"));

app.get("/", (req, res) => {
  res.send("App is Running on The Server");
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
