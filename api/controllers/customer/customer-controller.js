// const _ = require('lodash');
// const moment = require('moment');
const User = require("../../../models/User");
const Customer = require("../../../models/Customer");

function addCustomer(req, res, next) {
  console.log("TCL: addCustomer -> req", req.body);

  try {
    const body = req.body || {};
    // phai validate data roi moi gan' du lieu
    const newCustomer = new Customer({
      name: body.name,
      email: body.email,
      gender: body.gender,
      phone: body.phone,
      serviceRent: body.service,
      createdDate: new Date()
    });

    newCustomer.save((err, dataSave) => {
      if (err) {
        console.error("[ERROR]: Save customer - ", err);
        res.json({
          status: 500,
          message: "Save customer fail"
        });
        return;
      }
      res.json({
        status: 200,
        message: "Save customer success",
        dataSave
      });
    });
  } catch (error) {
    console.error("[ERROR]: Save customer - ", error);
    res.json({
      status: 500,
      message: "Save customer fail"
    });
  }
}

async function getAllCustomer(req, res, next) {
  const pageCurrent = parseInt(req.query.pageCurrent) || 1;
  const pageSize = parseInt(req.query.pageSize) || 3;

  try {
    let customerByPage = await new Promise((resolve, reject) => {
      Customer.find({})
        .limit(pageSize)
        .skip((pageCurrent - 1) * pageSize)
        .sort({ createdDate: "desc" })
        .then(customers => {
          if (customers) {
            resolve(customers);
          } else {
            reject({});
          }
        });
    });

    let totalCustomer = await new Promise((resolve, reject) => {
      Customer.countDocuments({}).exec((err, count) => {
        if (err) {
          reject(0);
        } else {
          resolve(count);
        }
      });
    });
    res.json({
      data: customerByPage,
      total: totalCustomer,
      message: "Get data customer success !"
    });
  } catch (error) {
    res.json({
      message: "[FAILURE]: get data customer"
    });
  }
}

function deleteCustomer(req, res, next) {
  const _id = req.body.id;
  Customer.findByIdAndRemove(_id, (err, customer) => {
    if (err) {
      res.json({
        status: 500,
        message: "Delete customer fail !"
      });
    }
    // console.log(customer);
    res.json({
      status: 200,
      message: "Delete customer success"
    });
  });
}

function editCustomer(req, res, next) {
  // add code edit
}

module.exports = {
  addCustomer,
  getAllCustomer,
  deleteCustomer,
  editCustomer
  // getCustomerById
};
