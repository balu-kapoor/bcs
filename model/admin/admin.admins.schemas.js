const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Admin = Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        unique: true,
        required: true,
    },
    image: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

mongoose.model("admins", Admin);
module.exports = mongoose.model("admins");