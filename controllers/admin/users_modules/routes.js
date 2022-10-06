const Users = require("./users.controller");

/**Api to get client listing from users collection */
app.post("/api/admin/users/client/listing", checkLoginAuth, (req, res, next) => {
  Users.getClientsListing(req, res, next);
});

/**Api to get employee listing from users collection */
app.post("/api/admin/users/employee/listing", checkLoginAuth, (req, res, next) => {
  Users.getEmployeeListing(req, res, next);
});

/**Api to add client in users collection */
app.post("/api/admin/users/client/add",checkLoginAuth,(req, res, next) => {
  Users.addClient(req, res, next);
});

/**Api to edit client in users collection */
app.all("/api/admin/users/client/edit",checkLoginAuth,(req, res, next) => {
  Users.editClient(req, res, next);
});


/**Api to edit admin profile */
app.all("/api/admin/profile/update",checkLoginAuth,(req, res, next) => {
  Users.adminProfile(req, res, next);
});

/**Api to add employee in users collection */
app.post("/api/admin/users/employee/add",checkLoginAuth,(req, res, next) => {
  Users.addEmployee(req, res, next);
});

/**Api to edit employee in users collection */
app.all("/api/admin/users/employee/edit",checkLoginAuth,(req, res, next) => {
  Users.editEmployee(req, res, next);
});

/**Api to update user status in users collection */
app.get("/api/admin/user/change/user/status",checkLoginAuth,(req, res, next) => {
  Users.changeUserStatus(req, res, next);
});

/**Api to delete user from user collection */
app.get("/api/admin/users/delete/user",checkLoginAuth,(req, res, next) => {
  Users.deleteUser(req, res, next);
});

/**Api to  user change password in admin module */
app.post("/api/admin/profile/update/password", checkLoginAuth, (req, res, next) => {
  Users.changePassword(req, res, next);
});
