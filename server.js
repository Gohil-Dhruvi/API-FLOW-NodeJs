const express = require('express');

const port = 9005;
const app = express();
const dbConnect = require('./config/dbConnection');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require("cookie-parser");

// middleware
app.use(cors());
app.use(express.urlencoded());
app.use(morgan("dev"))
app.use(cookieParser());

// routes
app.use("/", require("./routes/index.routes"));

app.listen(port, ()=> {
    console.log(`Server start at http://localhost:${port}`);
})