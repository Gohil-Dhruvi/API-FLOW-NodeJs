const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Manager = require("../models/manager.model");
const nodemailer = require("nodemailer");

// Admin Controller Code

// Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;
    let imagePath = "";
    let admin = await Admin.findOne({ email: email, isDelete: false });
    if (admin) {
      return res.status(400).json({ message: "Admin Already Exist" });
    }

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    let hashPassword = await bcrypt.hash(password, 10);
    admin = await Admin.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
      gender,
      profileImage: imagePath,
    });

    return res.status(201).json({ message: "Admin Register Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email: email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    let matchPass = await bcrypt.compare(password, admin.password);
    if (!matchPass) {
      return res.status(400).json({ message: "Password is not matched" });
    }
    let payload = {
      adminId: admin._id,
    };
    let token = await jwt.sign(payload, "admin");
    return res
      .status(200)
      .json({ message: "Admin Login Success", adminToken: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin Logout
exports.logoutAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Admin Logout Success"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// Admin Profile
exports.myProfile = async (req, res) => {
  try {
    let admin = req.user;
    return res.status(200).json({ message: "Profile Success", data: admin });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
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

    const admin = await Admin.findByIdAndUpdate(req.user._id, updateData, { new: true });
    return res.status(200).json({ message: "Profile Update Success", data: admin });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin Change-password
exports.changePassword = async (req, res) => {
  try {
    const { current_pass, new_pass, confirm_pass } = req.body;
    let admin = req.user;
    let matchPass = await bcrypt.compare(current_pass, admin.password);
    if (!matchPass) {
      return res
        .status(400)
        .json({ message: "Current password is not matched" });
    }
    if (current_pass == new_pass) {
      return res
        .status(400)
        .json({ message: "Current password and New password is matched" });
    }
    if (new_pass != confirm_pass) {
      return res
        .status(400)
        .json({ message: "New password and Confirm password is not matched" });
    }

    let hashPassword = await bcrypt.hash(new_pass, 10);
    admin = await Admin.findByIdAndUpdate(
      admin._id,
      { password: hashPassword },
      { new: true }
    );

    return res.status(200).json({ message: "Password Change Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const resetLink = `http://localhost:9005/admin/reset-password/${admin._id}`;

    await transporter.sendMail({
      from: '"Admin Support" <gohildhruvi168529@gmail.com>',
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.status(200).json({ message: "Reset link sent to Admin's email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { new_pass, confirm_pass } = req.body;

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const hashedPassword = await bcrypt.hash(new_pass, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Manager Controller Code

// Add Manager
exports.addManager = async (req, res) => {
  try {
    let { firstname, lastname, email, password, gender, profileImage } = req.body;
    let manager = await Manager.findOne({ email: email, isDelete: false });

    if (manager) {
      return res.status(400).json({ message: "Manager already exist" });
    }

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }
    let hashPassword = await bcrypt.hash(password, 10);

    manager = await Manager.create({
      firstname,
      lastname,
      email,
      gender,
      password: hashPassword,
      profileImage,
    });
    return res.status(201).json({ message: "New Manager Added Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// View All Managers
exports.viewAllManager = async (req, res) => {
  try {
    let managers = await Manager.find({ isDelete: false });
    return res.status(200).json({ message: "All Manager Fetch Success", data: managers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Single Manager
exports.getSingleManager = async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) return res.status(404).json({ message: "Manager not found" });
    res.status(200).json({ manager });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update Manager
exports.updateManager = async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.profileImage = req.file.filename;
    const updated = await Manager.findByIdAndUpdate(req.params.id, data, { new: true });
    res.status(200).json({ message: "Manager updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Manager
exports.deleteManager = async (req, res) => {
  try {
    let id = req.params.id;
    let manager = await Manager.findOne({ _id: id, isDelete: false });
    if (!manager) {
      return res.status(404).json({ message: "Manager Not Found" });
    }
    manager = await Manager.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true }
    );
    return res.status(200).json({ message: "Delete Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Activate Manager
exports.activateManager = async (req, res) => {
  try {
    let id = req.params.id;
    let manager = await Manager.findById(id);
    if (!manager) {
      return res.status(404).json({ message: "Manager Not Found" });
    }
    if (manager.isDelete == false) {
      return res.status(404).json({ message: "Manager already Activated" });
    }
    manager = await Manager.findByIdAndUpdate(
      id,
      { isDelete: false },
      { new: true }
    );
    return res.status(200).json({ message: "Manager is Activated Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Deactivate Manager
exports.deactivateManager = async (req, res) => {
  try {
    const updated = await Manager.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.status(200).json({ message: "Manager deactivated", updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
