const express = require('express');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyManagerToken } = require('../middleware/verifyToken');

// Controller functions
const {
  registerManager,
  loginManager,
  logoutManager,
  myProfile,
  updateManagerProfile,
  changePassword,
  forgotPassword,
  resetPassword,

  // Employee management
  addEmployee,
  viewAllEmployee,
  getSingleEmployee,
  updateEmployee,
  deleteEmployee,
  activateEmployee,
  deactivateEmployee
} = require('../controller/manager.controller');

// Manager Auth Routes
routes.post("/register", uploadImage.single('profileImage'), registerManager);
routes.post("/login", loginManager);
routes.post("/logout", logoutManager);

// Manager Profile Routes
routes.get("/profile", verifyManagerToken, myProfile);
routes.put("/update-profile", verifyManagerToken, uploadImage.single('profileImage'), updateManagerProfile);

// Password Routes
routes.post("/change-password", verifyManagerToken, changePassword);
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:managerId", resetPassword);

// Employee CRUD Routes
routes.post("/add-employee", verifyManagerToken, uploadImage.single('profileImage'), addEmployee);
routes.get("/view-employee", verifyManagerToken, viewAllEmployee);
routes.get("/single-employee/:id", verifyManagerToken, getSingleEmployee);
routes.put("/update-employee/:id", verifyManagerToken, uploadImage.single('profileImage'), updateEmployee);
routes.delete("/delete-employee/:id", verifyManagerToken, deleteEmployee);
routes.put("/activate-employee/:id", verifyManagerToken, activateEmployee);
routes.post("/deactivate-employee/:id", verifyManagerToken, deactivateEmployee);

module.exports = routes;
