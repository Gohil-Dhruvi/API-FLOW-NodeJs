const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Manager = require("../models/manager.model");
const nodemailer = require("nodemailer");

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

    // Store a cookie after successful password reset
    res.cookie("admin_reset", true, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addManager = async (req, res) => {
  try {
    let { firstname, lastname, email, password, gender, profileImage } =
      req.body;
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
    await sendMail(email, password);
    return res.status(201).json({ message: "New Manager Added Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.viewAllManager = async (req, res) => {
  try {
    let managers = await Manager.find({ isDelete: false });
    res.cookie("hello", "admin");
    res.cookie("hello1", "admin");
    return res
      .status(200)
      .json({ message: "All Manager Fetch Success", data: managers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

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


exports.activateManager = async (req, res) => {
  try {
    let id = req.params.id;
    // let manager = await Manager.findOne({ _id: id, isDelete: true });
    // if (!manager) {
    //   return res.status(404).json({ message: "Manager Not Found || Manager already Activated" });
    // }
    let manager = await Manager.findById(id);
    if(!manager){
      return res.status(404).json({ message: "Manager Not Found" });
    }
    if(manager.isDelete == false){
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
