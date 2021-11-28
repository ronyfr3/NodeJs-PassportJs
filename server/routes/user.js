const express = require("express");
const router = express.Router();
const passport = require("passport");
const crypto = require("crypto"); //for create random token
const User = require("../models/Users");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const async = require('async');

//signup
router.post(
  "/signup",
  validate,
  passport.authenticate("local.signup", {
    successRedirect: "/signin",
    failureRedirect: "/signup",
  })
);
function validate(req, res, next) {
  //validate fullname is not empty
  req.checkBody("fullname", "Fullname is required").notEmpty();
  //check length of fullname
  req
    .checkBody("fullname", "Fullname must not be less than 5")
    .isLength({ min: 5 });
  //check email required
  req.checkBody("email", "Email is required").notEmpty();
  //check email is valid
  req.checkBody("email", "Email is Invalid").isEmail();
  //check password required
  req.checkBody("password", "Password is required").notEmpty();
  //check password length
  req
    .checkBody("password", "Password must be less than 5")
    .isLength({ min: 5 });
  //check password must contain lowercase & upper case characters
  req
    .check("password", "Password must contain at least 1 Number")
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
  //errors will be save inside the errors
  let errors = req.validationErrors();
  if (errors) {
    let messages = [];
    errors.forEach((error) => {
      messages.push(error.message);
    });
    res.status(500).json({ messages });
    res.redirect("/signup");
  } else {
    return next();
  }
}
//login
router.post(
  "/login",
  loginvalidate,
  passport.authenticate("local.login", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),(req,res)=>{
    if(req.body.rememberme) {
      req.session.cookie.maxAge = 30*24*60*60*10000 //30days
    }else{
      req.session.cookie.expires = null;
    }
    res.redirect('/')
  }
);
//logout
router.get("/logout",(req,res)=>{
  req.logout()
  req.session.destroy(err=>{
    res.redirect('/')
  })
})

function loginvalidate(req, res, next) {
  //validate fullname is not empty

  req.checkBody("email", "Email is required").notEmpty();
  //check email is valid
  req.checkBody("email", "Email is Invalid").isEmail();
  //check password required
  req.checkBody("password", "Password is required").notEmpty();
  //check password length
  req
    .checkBody("password", "Password must be less than 5")
    .isLength({ min: 5 });
  //check password must contain lowercase & upper case characters
  req
    .check("password", "Password must contain at least 1 Number")
    .matches(/^(?=.*\d)(?=.*[a-z])[0-9a-z]{5,}$/, "i");
  //errors will be save inside the errors
  let login_errors = req.validationErrors();
  if (login_errors) {
    let messages = [];
    errors.forEach((error) => {
      messages.push(error.message);
    });
    res.status(500).json({ messages });
    res.redirect("/signup");
  } else {
    return next();
  }
}
//nodemailer
const data = [];
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  "988548419813-f5u7s6ltu1k971qcf95nqp4eqqcsibcf.apps.googleusercontent.com",
  "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",
  "https://developers.google.com/oauthplayground"
);
oauth2Client.setCredentials({
  refresh_token:
    "1//046I1_Um2xr_5CgYIARAAGAQSNwF-L9IrfHBUjOoFOQsb4-9v0NY66LQapj8X1Bd9i6JS9XjhiR9vaA8_jJZlgoLnJmh8k6dZdok",
});
const access_token = oauth2Client.getAccessToken();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "rakib.fstackdev@gmail.com",
    pass: "hello_world12345",
    clientId:
      "988548419813-f5u7s6ltu1k971qcf95nqp4eqqcsibcf.apps.googleusercontent.com",
    clientSecret: "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",
    refreshToken:
      "1//046I1_Um2xr_5CgYIARAAGAQSNwF-L9IrfHBUjOoFOQsb4-9v0NY66LQapj8X1Bd9i6JS9XjhiR9vaA8_jJZlgoLnJmh8k6dZdok",
    accessToken: access_token,
  },
});
transporter.verify((err, success) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is ready to take messages: ${success}`);
  }
});
//forget password reset
router.post("/forgot", (req, res, next) => {
  async.waterfall(
    [
      function (callback) {
        crypto.randomBytes(20, (err, buf) => {
          let randomToken = buf.toString("hex");
          callback(err, randomToken);
        });
      },
      //find if user email is already exists
      function (randomToken, callback) {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            res.status(500).json({ msg: "No account with that email" });
            return res.redirect("/forgot");
          }
          //after send token to set email token expires date
          user.passwordResetToken = randomToken;
          user.passwordResetExpires = Date.now() + 60 * 60 * 1000; //1h
          user.save((err) => {
            callback(err, randomToken, user);
          });
        });
      },

      //send email function
      function (randomToken, user, callback) {
        data.push(req.body);
        let mailOptions = {
          from: req.body.email,
          to: "rakib.fstackdev@gmail.com,babamarony@gmail.com,rakib.devatmern@gmail.com",
          subject: "Account activation link",
          html: `
          <h1>Please use the following link to activate your account</h1>
          <p>${process.env.CLIENT_URL}/user/reset/${randomToken}</p>
          <hr />
          <p>This email may contain sensetive information</p>
          <p>${process.env.CLIENT_URL}</p>
        `,
        };
        transporter.sendMail(mailOptions, function (err, res) {
          return callback(err, user);
        });
      },
    ],
    (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/forgot");
    }
  );
});



module.exports = router;
