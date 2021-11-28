const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post(
  '/signup',
  passport.authenticate('local.signup', {
    successRedirect: '/signin',
    failureRedirect: '/signup',
  }),(req,res) => {res.status(200).send("done")}
);

module.exports = router;
