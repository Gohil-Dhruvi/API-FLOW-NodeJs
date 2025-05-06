const Employee = require("../models/employee.model");
const Manager = require("../models/manager.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

// ------------------ Register Employee ------------------

exports.registerEmployee = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;

    let existingEmployee = await Employee.findOne({ email, isDelete: false });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee Already Exists" });
    }

    let profileImage = "";
    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await Employee.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      gender,
      profileImage,
    });

    return res.status(201).json({ message: "Employee Register Success" });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Employee Login ------------------
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email, isDelete: false });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, employee.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const payload = { employeeId: employee._id };
    const token = jwt.sign(payload, "employee", { expiresIn: "1d" });

    return res.status(200).json({ message: "Employee Login Success", employeeToken: token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Logout Employee ------------------
exports.logoutEmployee = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "Employee Logout Success" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ------------------ Get Employee Profile ------------------
exports.myProfile = async (req, res) => {
  try {
    const employee = req.user;
    return res.status(200).json({ message: "Profile Success", data: employee });
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Update Employee Profile ------------------
exports.updateEmployeeProfile = async (req, res) => {
  try {
    const { firstname, lastname, gender } = req.body;
    const updateData = { firstname, lastname, gender };

    if (req.file) {
      updateData.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(req.user._id, updateData, { new: true });
    return res.status(200).json({ message: "Profile Update Success", data: updatedEmployee });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Change Password ------------------
exports.changePassword = async (req, res) => {
  try {
    const { current_pass, new_pass, confirm_pass } = req.body;
    const employee = req.user;

    const isMatch = await bcrypt.compare(current_pass, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    if (current_pass === new_pass) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    const hashedPassword = await bcrypt.hash(new_pass, 10);
    await Employee.findByIdAndUpdate(employee._id, { password: hashedPassword });

    return res.status(200).json({ message: "Password Change Success" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Forgot Password ------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "gohildhruvi168529@gmail.com",
    pass: "yzepdjxowvqfhzvs", // ⚠️ Avoid storing in plain code, use env variables
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const resetLink = `http://localhost:9005/employee/reset-password/${employee._id}`;

    await transporter.sendMail({
      from: '"Employee Support" <gohildhruvi168529@gmail.com>',
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    return res.status(200).json({ message: "Reset link sent to employee's email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Reset Password ------------------
exports.resetPassword = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { new_pass, confirm_pass } = req.body;

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const hashedPassword = await bcrypt.hash(new_pass, 10);
    employee.password = hashedPassword;
    await employee.save();

    res.cookie("employee_reset", true, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ------------------ Get Manager for Employee ------------------
exports.getMyManager = async (req, res) => {
  try {
    const employee = req.user;
    const manager = await Manager.findById(employee.managerId);

    if (!manager) {
      return res.status(404).json({ success: false, message: "Manager not found" });
    }

    return res.status(200).json({ success: true, manager });
  } catch (error) {
    console.error("Get Manager Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
