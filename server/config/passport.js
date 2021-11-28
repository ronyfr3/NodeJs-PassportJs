const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
//userSchema Model
const User = require("../models/Users");

passport.serializeUser((user, done) => {
  //save only user id to the session
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  //retrieve user data from user.id
  User.findById(id, (err, user) => {
    //if user found by id then it will attach all user fields(name,email etc.) to user object then you can get username by req.user.username
    done(err, user);
  });
});

//passport middleware
//sign-up
passport.use(
  "local.signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, //this will pass user email password values to below callback
    },
    //callback
    //if you put "fullname or username" to the usernameField then below email will be replaced with username or fullname
    (req, email, password, done) => {
      //save user to database
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err); //this err is db err or connection err
        }
        //find if user already exists
        if (user) {
          return done(null, false, {
            email: "Email already exists",
          });
        }
        //else create new user
        let newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);

        newUser.save(function (err) {
          return done(null, newUser);
        });
      });
    }
  )
);

//sign-in

passport.use(
  "local.login",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true, //this will pass user email password values to below callback
    },
    //callback
    //if you put "fullname or username" to the usernameField then below email will be replaced with username or fullname
    (req, email, password, done) => {
      //save user to database
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err); //this err is db err or connection err
        }
        //find if user already exists

        if (!user || !user.validPassword(passwor)) {
          return done(null, false, {
            email: "Email doesn't exists or password is incorrect",
          });
        }
        return done(null, user);
      });
    }
  )
);
