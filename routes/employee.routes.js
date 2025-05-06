const express = require('express');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyEmployeeToken } = require('../middleware/verifyToken');

// Import all controller functions
const {
  registerEmployee,
  loginEmployee,
  logoutEmployee,
  myProfile,
  updateEmployeeProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getMyManager
} = require('../controller/employee.controller');

// Employee Auth Routes
routes.post("/register", uploadImage.single('profileImage'), registerEmployee);
routes.post("/login", loginEmployee);
routes.post("/logout", logoutEmployee);

// Employee Profile Routes
routes.get("/profile", verifyEmployeeToken, myProfile);
routes.put('/update-profile', verifyEmployeeToken, uploadImage.single('profileImage'), updateEmployeeProfile);

// Password Routes
routes.post("/change-password", verifyEmployeeToken, changePassword);
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:employeeId", resetPassword);

// Manager Route for Employee
routes.get("/my-manager", verifyEmployeeToken, getMyManager);

module.exports = routes;
