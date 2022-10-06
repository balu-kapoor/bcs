const Employee = require('./front.employee.controllers');

/**Api to get employee dashboard details */
app.get('/api/front/employee/dashboard/count',checkLoginAuth,(req,res)=>{
    Employee.getDashboardData(req,res);
});

/**Api to signoff the task */
app.post('/api/front/employee/task/signoff',checkLoginAuth,(req,res,next)=>{
    Employee.signoffTask(req,res,next);
});
/**Api to report the task */
app.post('/api/front/employee/task/report',checkLoginAuth,(req,res,next)=>{
    Employee.reportTask(req,res,next);
});

/**Api to get employee open task List */
app.get('/api/front/employee/active/task',checkLoginAuth,(req,res)=>{
    Employee.getActiveTasksList(req,res);
});

/**Api to get employee open task List */
app.get('/api/front/employee/open/task',checkLoginAuth,(req,res)=>{
    Employee.getOpenTasksList(req,res);
});

/**Api to get employee completed task details */
app.get('/api/front/employee/completed/task/list',checkLoginAuth,(req,res)=>{
    Employee.getCompletedTasksList(req,res);
});

/**Api to get employee task details of single task **/
app.get('/api/front/employee/task/details',checkLoginAuth,(req,res)=>{
    Employee.getTaskDetails(req,res);
});

/**Api to logout employee  */
app.get('/api/front/employee/logout',checkLoginAuth,(req,res)=>{
    Employee.getEmployeeLogout(req,res);
});