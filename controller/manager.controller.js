const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Manager = require("../models/manager.model");
const Employee = require("../models/employee.model");
const nodemailer = require("nodemailer");

// Register Manager
exports.registerManager = async (req, res) => {
  try {
    const { firstname, lastname, email, password, gender } = req.body;
    let imagePath = "";
    let manager = await Manager.findOne({ email: email, isDelete: false });
    if (manager) {
      return res.status(400).json({ message: "Manager Already Exist" });
    }

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    let hashPassword = await bcrypt.hash(password, 10);
    manager = await Manager.create({
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


exports.loginManager = async (req, res) => {
     try {
    const { email, password } = req.body;
    let manager = await Manager.findOne({ email: email, isDelete: false });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found." });
    }

    let matchPass = await bcrypt.compare(password, manager.password);
    if (!matchPass) {
      return res.status(400).json({ message: "Password is not matched" });
    }
    let payload = {
      managerId: manager._id,
    };
    let token = await jwt.sign(payload, "manager");
    return res
      .status(200)
      .json({ message: "Manager Login Success", managerToken: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Manager Profile
exports.myProfile = async (req, res) => {
  try {
    let manager = req.user;
    return res.status(200).json({ message: "Profile Success", data: manager });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Manager Change-password
exports.changePassword = async (req, res) => {
  try {
    const { current_pass, new_pass, confirm_pass } = req.body;
    let manager = req.user;
    let matchPass = await bcrypt.compare(current_pass, manager.password);
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
    manager = await Manager.findByIdAndUpdate(
      manager._id,
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
    const manager = await Manager.findOne({ email });

    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const resetLink = `http://localhost:9005/manager/reset-password/${manager._id}`;

    await transporter.sendMail({
      from: '"Manager Support" <gohildhruvi168529@gmail.com>',
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.status(200).json({ message: "Reset link sent to Manager's email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { new_pass, confirm_pass } = req.body;

    if (new_pass !== confirm_pass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const hashedPassword = await bcrypt.hash(new_pass, 10);
    manager.password = hashedPassword;
    await manager.save();

    // Store a cookie after successful password reset
    res.cookie("manager_reset", true, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    let { firstname, lastname, email, password, gender, profileImage } =
      req.body;
    let employee = await Employee.findOne({ email: email, isDelete: false });

    if (employee) {
      return res.status(400).json({ message: "Employee already exist" });
    }

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }
    let hashPassword = await bcrypt.hash(password, 10);

    employee = await Employee.create({
      firstname,
      lastname,
      email,
      gender,
      password: hashPassword,
      profileImage,
    });
    await sendMail(email, password);
    return res.status(201).json({ message: "New Employee Added Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.viewAllEmployee = async (req, res) => {
  try {
    let employees = await Employee.find({ isDelete: false });
    res.cookie("hello", "employee");
    res.cookie("hello1", "employee");
    return res
      .status(200)
      .json({ message: "All Employee Fetch Success", data: employees });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    let id = req.params.id;
    let employee = await Employee.findOne({ _id: id, isDelete: false });
    if (!employee) {
      return res.status(404).json({ message: "Employee Not Found" });
    }
    employee = await Employee.findByIdAndUpdate(
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


exports.activateEmployee = async (req, res) => {
  try {
    let id = req.params.id;
    // let employee = await Employee.findOne({ _id: id, isDelete: true });
    // if (!employee) {
    //   return res.status(404).json({ message: "Employee Not Found || Employee already Activated" });
    // }
    let employee = await Employee.findById(id);
    if(!employee){
      return res.status(404).json({ message: "Employee Not Found" });
    }
    if(employee.isDelete == false){
      return res.status(404).json({ message: "Employee already Activated" });
    }
    employee = await Employee.findByIdAndUpdate(
      id,
      { isDelete: false },
      { new: true }
    );
    return res.status(200).json({ message: "Employee is Activated Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
