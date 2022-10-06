const Service = require("./services.controller");

/**Api to get service listing  from Service collection */
app.post("/api/admin/services/listing", checkLoginAuth, (req, res, next) => {
  Service.getServicesListing(req, res, next);
});

/**Api to add service in Service collection */
app.post("/api/admin/services/service/add",checkLoginAuth,(req, res, next) => {
  Service.addService(req, res, next);
});

/**Api to add service in Service collection */
app.all("/api/admin/services/service/edit",checkLoginAuth,(req, res, next) => {
  Service.editService(req, res, next);
});

/**Api to change status of service */
app.get("/api/admin/services/service/updateStatus",checkLoginAuth,(req, res, next) => {
  Service.changeStatus(req, res, next);
});


/**Api to change status of service */
app.get("/api/admin/services/service/delete",checkLoginAuth,(req, res, next) => {
  Service.delete(req, res, next);
});

