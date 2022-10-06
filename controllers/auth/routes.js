const Auth = require("./auth.controllers");

/**Api to login admin */
app.post("/auth/login/admin", (req, res, next) => {
    Auth.adminlogin(req, res, next);
});
/**Api to login employee */
app.post("/auth/login/employee", (req, res, next) => {
    Auth.employeeLogin(req, res, next);
});