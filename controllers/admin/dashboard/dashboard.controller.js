const asyncParallel = require("async/parallel");
const Users         = require("../../../model/admin/admin.users.schemas");
const TaskLogs      = require('../../../model/admin/admin.task.logs.schemas');
const Contract      = require('../../../model/admin/admin.contract.schemas');
const Job = require('../../../model/admin/admin.jobs.schemas')
const mongoose = require('mongoose');
function Dashboard() {
  /**
   * Function to ge records count for dashboard
   *
   *
   */
  this.getDashboardData = (req, res) => {
    asyncParallel(
      {
        total_users: function (callback) {
          Users.countDocuments({}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        total_clients: function (callback) {
          Users.countDocuments({role_type:TYPE_VENDORS,is_deleted:NOT_DELETED}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        total_tasks: function (callback) {
          Job.countDocuments({}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        task_done: function (callback) {
          Job.countDocuments({status:ACTIVE}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        task_issue: function (callback) {
          Job.countDocuments({isIssue:YES}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        total_employees: function (callback) {
          Users.countDocuments({role_type:TYPE_USERS,is_deleted:NOT_DELETED}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
      },
      function (err, results) {
        if (err)
          return res.send(INTERNAL).send({
            status :  STATUS_ERROR,
            msg    :  "Something went wrong. Please try later",
          });

        res.status(OK).send({
          status          : STATUS_SUCCESS,
          total_users     : results && results.total_users     ? results.total_users      : 0,
          total_clients   : results && results.total_clients   ? results.total_clients    : 0,
          total_employees : results && results.total_employees ? results.total_employees  : 0,
          total_tasks     : results && results.total_tasks     ? results.total_tasks      : 0,
          task_done       : results && results.task_done       ? results.task_done        : 0,
          task_issue      : results && results.task_issue      ? results.task_issue       : 0,
        });
      }
    );
  }; //end

  /**
   * Functio to get calendar database
   * 
   * 
   */
  this.calendarData =async (req, res)=>{
    var globalResponse = {
      status : STATUS_ERROR,
      message: "No records found",
      data   : []
    };
    let filterCondition  = req.body.filerCondition ? req.body.filerCondition : {};
    /** Data manipulations */
    asyncParallel(
      {
        employee_Hours:  function (callback) {
          if(filterCondition && filterCondition.employeeId){
            let id = mongoose.Types.ObjectId(filterCondition.employeeId);
            TaskLogs.aggregate([    
              {$match:{employeeId:id}},         
              { $group:{
                _id:{ "employeeId":"$employeeId"  }, 
                "count":{$sum:1},
                "totalHour":{$sum:"$timeTaken"} 
              },
            }
            ]).exec((err,jobdata)=>{
             if(jobdata && jobdata.length>0){
               callback(null, jobdata);
             }else{
               /* send success response */
               callback(null, null);
             }
           })
          }else{
            callback(null,null);
          }
        },
        employeeClient_Hours:  function (callback) {
          if(filterCondition && filterCondition.employeeId && filterCondition.clientId){
            let id = mongoose.Types.ObjectId(filterCondition.employeeId);
            let id2 = mongoose.Types.ObjectId(filterCondition.clientId);
            TaskLogs.aggregate([    
              {$match:{employeeId:id,clientId:id2}},         
              { $group:{
                _id:{ "employeeId":"$employeeId"  }, 
                "count":{$sum:1},
                "totalHour":{$sum:"$timeTaken"} 
              },
            }
            ]).exec((err,jobdata)=>{
             if(jobdata && jobdata.length>0){
               callback(null, jobdata);
             }else{
               /* send success response */
               callback(null, null);
             }
           })
          }else{
            callback(null,null);
          }
        },
        employee_Filtered:  function (callback) {
          if(filterCondition && filterCondition.employeeId){
            let id = mongoose.Types.ObjectId(filterCondition.employeeId);
            TaskLogs.aggregate([ 
              {$match:{employeeId: id}},            
              { $group:{
                _id:{ "startTime":"$startTime"  }, 
                "count":{$sum:1},
                "totalHour":{$sum:"$timeTaken"} 
              },
            }
            ]).exec((err,jobdata)=>{
            let count = jobdata.length;
             let data = []
             if(jobdata && jobdata.length>0){
               jobdata.map((item)=>{
                 data.push({
                   id:item.totalHour ? (item.totalHour): 0,
                   title : item.totalHour ? parseFloat(item.totalHour).toFixed(2)+" Hours": 0,
                   start : item._id.startTime ? new Date(item._id.startTime) : null,
                   display:"block",
                   data:item
                 });
                 if(count === data.length){
                   callback(null, data);
                 }
               })
             }else{
               /* send success response */
               callback(null, null);
             }
           })
          }else{
            callback(null,null);
          }
        },
        client_filered: function (callback) {
          if(filterCondition && filterCondition.clientId){
            let id = mongoose.Types.ObjectId(filterCondition.clientId);
            TaskLogs.aggregate([             
              {$match:{clientId:id}},
              { $group:{
                _id:{ "startTime":"$startTime"  }, 
                "count":{$sum:1},
                "totalHour":{$sum:"$timeTaken"} 
              },
            }
            ]).exec((err,jobdata)=>{
            let count = jobdata.length;
             let data = []
             if(jobdata && jobdata.length>0){
               jobdata.map((item)=>{
                 data.push({
                   id:item.totalHour ? (item.totalHour): 0,
                   title : item.totalHour ? parseFloat(item.totalHour).toFixed(2): 0,
                   start : item._id.startTime ? new Date(item._id.startTime) : null,
                   display:"block",
                   data:item
                 });
                 if(count === data.length){
                   callback(null, data);
                 }
               })
             }else{
               /* send success response */
               callback(null, null);
             }
           })
          }else{
            callback(null,null);
          }
        },
        default: function (callback) {
          TaskLogs.aggregate([             
            { $group:{
              _id:{ "startTime":"$startTime"}, 
              "count":{$sum:1},
              "totalHour":{$sum:"$timeTaken"},
            },
          }
          ]).exec((err,jobdata)=>{
          let count = jobdata.length;
           let data = []
           if(jobdata && jobdata.length>0){
             jobdata.map((item)=>{
               data.push({
                 id:item.totalHour ? (item.totalHour): 0,
                 title : item.totalHour ? parseFloat(item.totalHour).toFixed(2)+" Hours": 0,
                 start : item._id.startTime ? new Date(item._id.startTime) : null,
                 display:"block",
                 data:item
               });
               if(count === data.length){
                 callback(null, data);
               }
             })
           }else{
             /* send success response */
             callback(null, null);
           }
         })
        },
        EmployeeClient_Filtered: function (callback) {
          if(filterCondition  && filterCondition.employeeId && filterCondition.clientId) {
            let id = mongoose.Types.ObjectId(filterCondition.employeeId);
            let id2 = mongoose.Types.ObjectId(filterCondition.clientId);
            TaskLogs.aggregate([       
              {$match:{employeeId: id, clientId: id2}},      
              { $group:{
                _id:{ "startTime":"$startTime"  }, 
                "count":{$sum:1},
                "totalHour":{$sum:"$timeTaken"} 
              },
            }
            ]).exec((err,jobdata)=>{
            let count = jobdata.length;
             let data = []
             if(jobdata && jobdata.length>0){
               jobdata.map((item)=>{
                 data.push({
                   id:item.totalHour ? (item.totalHour): 0,
                   title : item.totalHour ? parseFloat(item.totalHour).toFixed(2)+" Hours": 0,
                   start : item._id.startTime ? new Date(item._id.startTime) : null,
                   display:"block",
                   data:item
                 });
                 if(count === data.length){
                   callback(null, data);
                 }
               })
             }else{
               /* send success response */
               callback(null, null);
             }
           })
          }else{
            callback(null,null);
          }
        },
      },
      function (err, results) {
        if (err)
          return res.status(INTERNAL).send({
            status :  STATUS_ERROR,
            msg    :  "Something went wrong. Please try later",
            data   : []
          });

          /*** Send employee+clientId data response ***/
          if(filterCondition && filterCondition.employeeId && filterCondition.clientId ){
            return res.status(OK).send({
              status    : STATUS_SUCCESS,
              data      : results && results.EmployeeClient_Filtered ? results.EmployeeClient_Filtered : [{}],
              hours     :results && results.employeeClient_Hours ? results.employeeClient_Hours[0].totalHour :0
            });
          }
          /*** Send  response ***/
          if(filterCondition && filterCondition.clientId){
            return res.status(OK).send({
              status    : STATUS_SUCCESS,
              data      : results && results.client_filered ? results.client_filered : [{}]
            });
          }

        /*** Send  response ***/
        if(filterCondition && filterCondition.employeeId){
          return res.status(OK).send({
            status    : STATUS_SUCCESS,
            data      : results && results.employee_Filtered ? results.employee_Filtered : [{}],
            hours     :results && results.employee_Hours ? results.employee_Hours[0].totalHour :0
          });
        }
        /** default response status */
        return res.status(OK).send({
          status    : STATUS_SUCCESS,
          data      : results && results.default ? results.default : [{}]
        });
      }
    );
    

  };//end
}
module.exports = new Dashboard();
