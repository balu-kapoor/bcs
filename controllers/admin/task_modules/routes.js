const Task = require("./task.controllers");

/**Api to get task listing  from task collection */
app.post("/api/admin/tasks/listing", checkLoginAuth, (req, res, next) => {
    Task.getTasksListing(req, res, next);
});

/**Api to get task logs listing  from task collection */
app.post("/api/admin/tasks/logs/listing", checkLoginAuth, (req, res, next) => {
    Task.getTasksLogsListing(req, res, next);
});

/**Api to get task reported details and re-opend it */
app.all("/api/admin/tasks/logs/getreported", checkLoginAuth, (req, res, next) => {
    Task.getTasksReported(req, res, next);
});

/**Api to add task in task collection */
app.post("/api/admin/tasks/task/add",checkLoginAuth,(req, res, next) => {
    Task.addTask(req, res, next);
});

/**Api to edit task in task collection */
app.all("/api/admin/tasks/task/edit",checkLoginAuth,(req, res, next) => {
    Task.editTask(req, res, next);
});

/**Api to get employee dropdown list from users collection */
app.get("/api/admin/contracts/get/employeelist", checkLoginAuth, (req, res, next) => {
    Task.getEmployeeLists(req, res, next);
  });
  
/**Api to get client dropdown list from users collection */
app.get("/api/admin/contracts/get/clientlist", checkLoginAuth, (req, res, next) => {
    Task.getClientLists(req, res, next);
});

/**Api to get service dropdown list from services collection */
app.get("/api/admin/contracts/get/servicelist", checkLoginAuth, (req, res, next) => {
    Task.getServiceDropDown(req, res, next);
});

/**Api to delete task in task collection */
app.get("/api/admin/tasks/task/delete",checkLoginAuth,(req, res, next) => {
    Task.deleteTask(req, res, next);
});

/**Api to update taks in task collection */
app.get("/api/admin/tasks/task/updateStatus",checkLoginAuth,(req, res, next) => {
    Task.changeStatus(req, res, next);
});


