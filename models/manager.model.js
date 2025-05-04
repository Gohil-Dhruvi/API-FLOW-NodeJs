const mongoose = require('mongoose');

const managerSchema = mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    profileImage: {
        type: String,
    },
    isDelete: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

const Manager = mongoose.model('Manager', managerSchema);
module.exports = Manager;