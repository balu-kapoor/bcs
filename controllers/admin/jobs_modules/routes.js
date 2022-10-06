const Jobs = require("./jobs.controllers");

/**Api to get jobs listing  from jobs collection */
app.post("/api/admin/jobs/listing", checkLoginAuth, (req, res, next) => {
    Jobs.getJobsListing(req, res, next);
});

/**Api to add job in job collection */
app.post("/api/admin/jobs/add",checkLoginAuth,(req, res, next) => {
    Jobs.createJob(req, res, next);
});

/**Api to edit job in jobs collection */
app.all("/api/admin/jobs/edit",checkLoginAuth,(req, res, next) => {
    Jobs.editJobs(req, res, next);
});

/**Api to view job in jobs collection */
app.get("/api/admin/jobs/view",checkLoginAuth,(req, res, next) => {
    Jobs.viewJobs(req, res, next);
});

/**Api to delete jobs in jobs collection */
app.get("/api/admin/jobs/delete",checkLoginAuth,(req, res, next) => {
    Jobs.deleteTask(req, res, next);
});

/**Api to update jobs in jobs collection */
app.get("/api/admin/jobs/updateStatus",checkLoginAuth,(req, res, next) => {
    Jobs.changeStatus(req, res, next);
});

/**Api to get contract list */
app.get("/api/admin/jobs/contracList",checkLoginAuth,(req, res, next) => {
    Jobs.contractDropdown(req, res, next);
});

/**Api to get employee list */
app.get("/api/admin/jobs/employeeList",checkLoginAuth,(req, res, next) => {
    Jobs.employeeDropdown(req, res, next);
});

/**Api to get service list */
app.get("/api/admin/jobs/serviceList",checkLoginAuth,(req, res, next) => {
    Jobs.serviceDropdown(req, res, next);
});


