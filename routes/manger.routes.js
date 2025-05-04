const express = require('express');
const routes = express.Router();
const uploadImage = require("../middleware/uploadImage");
const { verifyManagerToken } = require('../middleware/verifyToken');
const { registerManager, loginManager, myProfile, changePassword , forgotPassword , resetPassword, addEmployee , viewAllEmployee, deleteEmployee , activateEmployee} = require('../controller/manager.controller');

routes.post("/register", uploadImage.single('profileImage'), registerManager);

routes.post("/login", loginManager);   

routes.get("/profile", verifyManagerToken, myProfile); 

routes.post("/change-password", verifyManagerToken, changePassword);

routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:managerId", resetPassword);

routes.post("/add-employee", verifyManagerToken, uploadImage.single('profileImage'), addEmployee)
routes.get("/view-employee", verifyManagerToken, viewAllEmployee)

routes.delete("/delete-employee/:id", verifyManagerToken, deleteEmployee);
routes.put("/activate-employee/:id", verifyManagerToken, activateEmployee);

module.exports = routes;