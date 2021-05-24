// const _ = require('lodash');
// const moment = require('moment');
const HttpStatusCodes = require("http-status-codes");
const Joi = require("joi");
const bcrypt = require("bcryptjs");

const User = require("../../../models/User");
const Customer = require("../../../models/Customer");
const { ApiError } = require("../../../middleware/errors");

const userCreateSchema = {
  email: Joi.string()
    .email({ minDomainAtoms: 2 })
    .required(),

  userName: Joi.string().required(),
  name: Joi.string().required(),
  role: Joi.string().required(),
  phoneNumber: Joi.string().required()
};

function index(req, res, next) {
  res.send("test ok");
  // User.find({}).then(users => {
  //   res.json(users);
  // });
}
async function userList(req, res, next) {
  const pageCurrent = parseInt(req.query.pageCurrent) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const order = req.query.order || "desc";
  const field = req.query.field || "_id";

  var sort = "_id";
  if (
    (field == "email" && order == "ascend") ||
    (field == "userName" && order == "ascend") ||
    (field == "name" && order == "ascend") ||
    (field == "phoneNumber" && order == "ascend") ||
    (field == "role" && order == "ascend") ||
    (field == "createdAt" && order == "ascend")
  ) {
    sort = field;
  } else {
    sort = `-${field}`;
  }
  const user = await User.find({})
    .limit(pageSize)
    .skip((pageCurrent - 1) * pageSize)
    .sort(sort)
    .populate("role", ["roleName"]);

  let total = await new Promise((resolve, reject) => {
    User.countDocuments({}).exec((err, count) => {
      if (err) {
        reject(0);
      } else {
        resolve(count);
      }
    });
  });
  if (!user) {
    throw new ApiError({
      message: "There ara not user",
      code: HttpStatusCodes.BAD_REQUEST
    });
  }

  return res.json({
    userList: user,
    total,
    current: pageCurrent,
    limit: pageSize
  });
}

async function signUp(req, res, next) {
  const messages = {};
  const errors = {};
  const userData = req.body;
  userCreateSchema.password = Joi.string();
  userCreateSchema.confirmPassword = Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .options({
      language: {
        any: {
          allowOnly: "do not match"
        }
      }
    })
    .label("Confirm password")

    .min(6)
    .required();

  const validateResult = Joi.validate(req.body, userCreateSchema, {
    abortEarly: false
  });

  if (validateResult.error) {
    validateResult.error.details.map(index => {
      const name = index.path[0];
      const message = index.message.replace(/"/g, "");
      if (messages[name] == null) {
        messages[name] = message;
      }
    });
    errors.fe = messages;
    errors.message = "Validate from";
    errors.code = HttpStatusCodes.BAD_REQUEST;
    return next(errors);
  }
  delete userCreateSchema.password;
  delete userCreateSchema.confirmPassword;

  try {
    const user = await User.findOne({ email: userData.email });
    if (user) {
      throw new ApiError({
        message: "User with this email is already registered",
        code: HttpStatusCodes.CONFLICT,
        fe: { email: "Email is already used" }
      });
    }
    userData.password = bcrypt.hashSync(userData.password, 10);
    const newUser = new User(userData);
    newUser.save((err, data) => {
      if (err) {
        console.error("[ERROR]: Save User - ", err);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
          status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          message: "Save User fail"
        });
      }
      return res.json(data);
    });
  } catch (error) {
    return next(error);
  }
}

async function userUpdate(req, res, next) {
  const userData = req.body;
  const { id, checkBox } = req.body;
  const messages = {};
  const errors = {};
  userCreateSchema.id = Joi.string().required();
  userCreateSchema.checkBox = Joi.boolean();

  if (checkBox) {
    userCreateSchema.password = Joi.string().required();
    userCreateSchema.confirmPassword = Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .options({
        language: {
          any: {
            allowOnly: "do not match"
          }
        }
      })
      .label("Confirm password")

      .min(6)
      .required();
  } else {
    delete userCreateSchema.password;
    delete userCreateSchema.confirmPassword;
    delete req.body.password;
    delete req.body.confirmPassword;
  }
  const validateResult = Joi.validate(req.body, userCreateSchema, {
    abortEarly: false
  });

  if (validateResult.error) {
    validateResult.error.details.map(index => {
      const name = index.path[0];
      const message = index.message.replace(/"/g, "");
      if (messages[name] == null) {
        messages[name] = message;
      }
    });
    errors.fe = messages;
    errors.message = "Validate from";
    errors.code = HttpStatusCodes.BAD_REQUEST;
    return next(errors);
  }
  delete userCreateSchema.id;
  delete userCreateSchema.password;
  delete userCreateSchema.confirmPassword;

  try {
    await new Promise((rs, rj) => {
      User.findByIdAndUpdate(id, userData).exec((err, data) => {
        if (err) {
          rj(
            new ApiError({
              message: "Save user fail",
              code: HttpStatusCodes.CONFLICT,
              fe: {
                email: "Email duplicate"
              }
            })
          );
        }
        return rs(data);
      });
    });

    const user = await User.findById(id).populate("role", ["roleName"]);
    console.log("TCL: userUpdate -> user", user);

    res.json(user);
  } catch (error) {
    return next(error);
  }
}

async function userDelete(req, res, next) {
  const { id } = req.params;

  try {
    const user = await new Promise(async (rs, rj) => {
      await User.findByIdAndRemove(id, (err, data) => {
        err
          ? rj({ message: "User not found", code: HttpStatusCodes.BAD_REQUEST })
          : rs(data);
      });
    });
    if (!user) {
      throw new ApiError({
        message: "User not found",
        code: HttpStatusCodes.BAD_REQUEST
      });
    }
    res.json({ message: "Delete user successfully!" });
  } catch (error) {
    console.log("TCL: userDelete -> error", error);
    return next(error);
  }
}

function addUser(req, res, next) {
  const newUser = new User({
    username: "lam",
    email: "nhatlam@gmail.com",
    createdDate: new Date(),
    profile: {
      gender: "male",
      birthday: "2000"
    }
  });
  try {
    newUser.save((err, dataSave) => {
      if (err) {
        // return next(err);
        console.log("[ERROR]: Save User - ", err);
        return next("Save Customer Error !!!");
      }
      console.log("dataSave", dataSave);
      res.send("[SUCCESS]: Save User");
    });
  } catch (error) {
    res.send("[ERROR]: save error: ", error);
  }
}

module.exports = {
  index,
  addUser,
  signUp,
  userList,
  userUpdate,
  userDelete
};
