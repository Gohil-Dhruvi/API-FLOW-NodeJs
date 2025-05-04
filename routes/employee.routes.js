const express = require('express');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyEmployeeToken } = require('../middleware/verifyToken');
const { registerEmployee, loginEmployee, myProfile, changePassword , forgotPassword , resetPassword } = require('../controller/employee.controller');

routes.post("/register", uploadImage.single('profileImage'), registerEmployee);

routes.post("/login", loginEmployee);

routes.get("/profile", verifyEmployeeToken, myProfile);

routes.post("/change-password", verifyEmployeeToken, changePassword);

routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:employeeId", resetPassword); 

module.exports = routes;
