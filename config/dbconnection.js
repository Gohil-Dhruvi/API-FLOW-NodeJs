const mongoose = require('mongoose');

const dbconnection = ()=>{
    mongoose.connect("mongodb+srv://dhruvi1685:dhruvi123@cluster0.mw1ii.mongodb.net/API-FLOW")
    .then(()=>{
        console.log("Database connected successfully");
    }).catch((error)=>{
        console.log("Database connection error",error);
        
    })
}
module.exports = dbconnection();