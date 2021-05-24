const Joi = require("joi");
const HttpStatusCodes = require("http-status-codes");

const Role = require("../../../models/Role");
const { ApiError } = require("../../../middleware/errors");

const roleCreateSchema = {
  roleName: Joi.string().required()
};

module.exports = {
  addRole: async (req, res, next) => {
    const messages = {};
    const errors = {};
    const dataRole = req.body;

    const validateResult = Joi.validate(req.body, roleCreateSchema, {
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
    try {
      const role = await Role.findOne(dataRole);
      if (role) {
        throw new ApiError({
          message: "Role is already",
          code: HttpStatusCodes.CONFLICT,
          fe: { role: "Role is already used" }
        });
      }
      const newRole = new Role(dataRole);
      newRole.save((err, data) => {
        if (err) {
          console.log("TCL: Error", err);
          return res.json({
            status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: "Save Role fail"
          });
        }
        return res.json(data);
      });
    } catch (error) {
      return next(error);
    }
  },
  getRolles: async (req, res, next) => {
    try {
      const role = await Role.find();
      if(!role){
        throw new ApiError({
          message: "Role not found",
          code: HttpStatusCodes.BAD_REQUEST,
          fe: { role: "Role not found" }
        });
      }
      res.json(role)
    } catch (error) {
      
    }
    
  }
};
