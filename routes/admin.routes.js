const express = require('express');
const { registerAdmin, loginAdmin, myProfile, changePassword,forgotPassword, resetPassword, addManager, viewAllManager, deleteManager, activateManager } = require('../controller/admin.controller');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyAdminToken } = require('../middleware/verifyToken');

routes.post("/register", uploadImage.single('profileImage'), registerAdmin);

routes.post("/login", loginAdmin);   

routes.get("/profile", verifyAdminToken, myProfile); 

routes.post("/change-password", verifyAdminToken, changePassword);

routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:adminId", resetPassword); 

routes.post("/add-manager", verifyAdminToken, uploadImage.single('profileImage'), addManager)
routes.get("/view-manager", verifyAdminToken, viewAllManager)
routes.delete("/delete-manager/:id", verifyAdminToken, deleteManager);
routes.put("/activate-manager/:id", verifyAdminToken, activateManager);

module.exports = routes;