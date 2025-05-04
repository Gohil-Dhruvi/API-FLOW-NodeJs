const express = require('express');
const routes = express.Router();

routes.use("/admin", require("./admin.routes"))
routes.use("/manager", require("./manger.routes"))
routes.use("/employee", require("./employee.routes"))

module.exports = routes;