const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    serviceRent: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    createdDate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('customers', CustomerSchema);