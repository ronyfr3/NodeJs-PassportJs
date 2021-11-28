const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    //required: true //for google and facebook password isn't required
  },
  role: {
    type: String,
    default: 'user',
  },
  passwordResetToken: {
    type: String,
    default: '',
  },
  passwordResetExpires: {
    type: Date,
    default: Date.now(),
  },
});
userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};
//compare the password
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', userSchema);
