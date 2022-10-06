const Dashboard = require('./dashboard.controller');

/**Routes to get dashboard count */
app.get('/api/admin/dashboard',checkLoginAuth,(req,res,next)=>{
    Dashboard.getDashboardData(req,res);
});

/**Routes to get calendar data */
app.post('/api/admin/dashboard/calendar',checkLoginAuth,(req,res,next)=>{
    Dashboard.calendarData(req,res);
});