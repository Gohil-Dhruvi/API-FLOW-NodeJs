const express = require('express');

const port = 9005;
const app = express();
const dbConnect = require('./config/dbConnection');
const morgan = require('morgan');
const cors = require('cors');

// middleware
app.use(cors());
app.use(express.urlencoded());
app.use(morgan("dev"))

// routes
app.use("/", require("./routes/index.routes"));

app.listen(port, ()=> {
    console.log(`Server start at http://localhost:${port}`);
})