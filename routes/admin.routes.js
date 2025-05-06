const express = require('express');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyAdminToken } = require('../middleware/verifyToken');

// Import all controller functions
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  myProfile,
  updateAdminProfile,
  changePassword,
  forgotPassword,
  resetPassword,

  // Manager management
  addManager,
  viewAllManager,
  getSingleManager,
  updateManager,
  deleteManager,
  activateManager,
  deactivateManager
} = require('../controller/admin.controller');

// Admin Auth Routes
routes.post("/register", uploadImage.single('profileImage'), registerAdmin);
routes.post("/login", loginAdmin);
routes.post("/logout", logoutAdmin);

// Admin Profile Routes
routes.get("/profile", verifyAdminToken, myProfile);
routes.put("/update-profile", verifyAdminToken, uploadImage.single('profileImage'), updateAdminProfile);

// Password Routes
routes.post("/change-password", verifyAdminToken, changePassword);
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:adminId", resetPassword);

// Manager CRUD Routes
routes.post("/add-manager", verifyAdminToken, uploadImage.single('profileImage'), addManager);
routes.get("/view-manager", verifyAdminToken, viewAllManager);
routes.get("/single-manager/:id", verifyAdminToken, getSingleManager);
routes.put("/update-manager/:id", verifyAdminToken, uploadImage.single('profileImage'), updateManager);
routes.delete("/delete-manager/:id", verifyAdminToken, deleteManager);
routes.put("/activate-manager/:id", verifyAdminToken, activateManager);
routes.post("/deactivate-manager/:id", verifyAdminToken, deactivateManager);

module.exports = routes;
