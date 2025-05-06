const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Manager = require("../models/manager.model");
const Employee = require("../models/employee.model");
const nodemailer = require("nodemailer");

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "gohildhruvi168529@gmail.com",
    pass: "yzepdjxowvqfhzvs",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// ------------------- MANAGER SECTION -------------------

// Register Manager
exports.registerManager = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : "";
    let manager = await Manager.findOne({ email, isDelete: false });
    if (manager) {
      return res.status(400).json({ message: "Manager Already Exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await Manager.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
      gender,
      profileImage: imagePath,
    });

    return res.status(201).json({ message: "Manager Register Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login Manager
exports.loginManager = async (req, res) => {
  try {
    const { email, password } = req.body;
    const manager = await Manager.findOne({ email, isDelete: false });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    const match = await bcrypt.compare(password, manager.password);
    if (!match) return res.status(400).json({ message: "Password is not matched" });

    const token = jwt.sign({ managerId: manager._id }, "manager");
    return res.status(200).json({ message: "Manager Login Success", managerToken: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Manager Logout
exports.logoutManager = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Manager Logout Success"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Manager Profile
exports.myProfile = async (req, res) => {
  try {
    let manager = req.user;
    return res.status(200).json({
      message: "Profile Success",
      data: manager
    });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// Update Profile
exports.updateManagerProfile = async (req, res) => {
  try {
    const { firstname, lastname, gender } = req.body;
    let updateData = {
      firstname,
      lastname,
      gender,
    };

    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const manager = await Manager.findByIdAndUpdate(req.user._id, updateData, { new: true });
    return res.status(200).json({ message: "Profile Update Success", data: manager });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { current_pass, new_pass, confirm_pass } = req.body;
    const manager = req.user;

    const isMatch = await bcrypt.compare(current_pass, manager.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "New and Confirm password do not match" });
    }

    const hashPassword = await bcrypt.hash(new_pass, 10);
    await Manager.findByIdAndUpdate(manager._id, { password: hashPassword });

    return res.status(200).json({ message: "Password Change Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const manager = await Manager.findOne({ email });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    const resetLink = `http://localhost:9005/manager/reset-password/${manager._id}`;
    await transporter.sendMail({
      from: '"Manager Support" <gohildhruvi168529@gmail.com>',
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click the link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.status(200).json({ message: "Reset link sent to Manager's email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { new_pass, confirm_pass } = req.body;
    if (new_pass !== confirm_pass) return res.status(400).json({ message: "Passwords do not match" });

    const manager = await Manager.findById(managerId);
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    manager.password = await bcrypt.hash(new_pass, 10);
    await manager.save();

    res.cookie("manager_reset", true, { httpOnly: true, maxAge: 86400000 });
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------- EMPLOYEE SECTION -------------------

// Add Employee
exports.addEmployee = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const existing = await Employee.findOne({ email, isDelete: false });
    if (existing) return res.status(400).json({ message: "Employee already exists" });

    const hashPassword = await bcrypt.hash(password, 10);
    const newEmployee = await Employee.create({
      firstname,
      lastname,
      email,
      gender,
      password: hashPassword,
      profileImage: imagePath,
    });

    res.status(201).json({ message: "New Employee Added Success", data: newEmployee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// View All Employees
exports.viewAllEmployee = async (req, res) => {
  try {
    const employees = await Employee.find({ isDelete: false });
    res.status(200).json({ message: "All Employee Fetch Success", data: employees });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Single Employee
exports.getSingleEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, isDelete: false });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({ message: "Employee Fetched", data: employee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    const { firstname, lastname, gender } = req.body;
    let imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData = { firstname, lastname, gender };
    if (imagePath) updateData.profileImage = imagePath;

    const updated = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ message: "Employee Updated", data: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Employee (Soft Delete)
exports.deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await Employee.findOne({ _id: id, isDelete: false });
    if (!employee) return res.status(404).json({ message: "Employee Not Found" });

    await Employee.findByIdAndUpdate(id, { isDelete: true });
    res.status(200).json({ message: "Employee Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Activate Employee
exports.activateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee Not Found" });
    if (!employee.isDelete) return res.status(400).json({ message: "Employee Already Active" });

    employee.isDelete = false;
    await employee.save();

    res.status(200).json({ message: "Employee Activated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Deactivate Employee
exports.deactivateEmployee = async (req, res) => {
  try {
    const id = req.params.id;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: "Employee Not Found" });
    if (employee.isDelete) return res.status(400).json({ message: "Employee Already Deactivated" });

    employee.isDelete = true;
    await employee.save();

    res.status(200).json({ message: "Employee Deactivated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
