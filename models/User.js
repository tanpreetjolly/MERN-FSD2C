const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); //Imports the 'bcryptjs' library, which is used for hashing passwords securely.

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide Name'],
    minlength: 3,
    maxlength: 40,
  },
  email: {
    type: String,
    required: [true, 'Please provide E-Mail'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, //email validation
      'Please provide valid E-Mail',
    ],
    unique: true, //technically not a validator, creates a unique index
  },
  password: {
    type: String,
    required: [true, 'Please provide Password'],
    minlength: 4,
  },
});

userSchema.pre('save', async function (next) {

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt); //the password is hashed
});

userSchema.methods.createJWT = function () {
  return jwt.sign(
    { userID: this._id, name: this.name },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};
userSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};
module.exports = mongoose.model('User', userSchema);