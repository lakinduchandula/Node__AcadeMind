const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Faild!");
    error.statusCode = 422;
    error.data = errors.array();
    console.log("Error Email ==>  ", errors.array());
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then(encryptedPassword => {
      const user = new User({
        email: email,
        password: encryptedPassword,
        name: name,
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: "User Created!", userId: result._id });
    })
    .catch(error => {
      if (error) {
        error.statusCode = 500;
      }
      next(error); // this will work with the err
    });
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: "User updated." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 401;
        throw error;
      }
      loadUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isMatch => {
      if (!isMatch) {
        const error = new Error("Password is mismatch!");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: loadUser.email,
          userId: loadUser._id.toString(),
        },
        "lakinduchandulalakinduchadandula",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: loadUser._id.toString() });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); // this will work with the err;
    });
};
