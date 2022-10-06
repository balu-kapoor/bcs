const Logs          = require("../../../model/front/front.employee.logs");
const Users         = require('../../../model/admin/admin.users.schemas');
const TaskManager   = require('../../../model/admin/admin.contract.schemas');
const TaskLogs      = require('../.././../model/admin/admin.task.logs.schemas');
const Jobs          = require('../.././../model/admin/admin.jobs.schemas');
const asyncParallel = require("async/parallel");

function EmployeeApi() {

  /**
   * Function to ge records count for dashboard
   *
   *
   */
   this.getDashboardData = (req, res) => {
    var globalResponse = {
      status    : STATUS_ERROR,
      message   : "Something is went wrong . Please try again later",
      statusCode: INTERNAL
    };
    let id = req.query.id ? req.query.id :""
    
    asyncParallel(
      {
        lastLogin: function (callback) {
          Logs.findOne({employeeId:id},{_id :1,logout:1,login:1}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        completedTask: function (callback) {
          Jobs.countDocuments({employeeId:id , status:ACTIVE}, (err, result) => {
            /* send success response */
            callback(err, result ? result : 0);
          });
        },
        openTask: function (callback) {
          TaskManager.countDocuments({employee:{$elemMatch:{value:id}}, status:DEACTIVE,startDate: new Date()}, (err, result) => {
            /* send success response */
            callback(err, result ? result : 0);
          });
        },
        hoursToday: function (callback) {
          Logs.findOne({employeeId:id}, (err, result) => {
            /* send success response */
            callback(err, result && result.workingHour ? result.workingHour : 0);
          });
        },
      },
      function (err, results) {
        if (err)
          return res.status(INTERNAL).send(globalResponse);
        
          /**sen success response */
        globalResponse.status     = STATUS_SUCCESS;
        globalResponse.message    = "Employee dashboard count";
        globalResponse.data       = results;
        globalResponse.statusCode = OK;
        res.status(OK).send(globalResponse);
      }
    );
  }; //end

  /**
   * Function for get open task of employee
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.getOpenTasksList = async (req, res) => {
    var globalResponse = {
      status: STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
      statusCode:INTERNAL
    };
    let id = req.query.id ? req.query.id :"";
    if(!id) return res.status(INTERNAL).send(globalResponse);
    /** save the data */
    try {
      
      Jobs.find({employeeId:id,status:DEACTIVE,isDaily:YES},{_id:1, contractId:1}).populate('contractId','name startDate endDate description address').exec((err,response)=>{
        
        /** if daily job type found */
        if(response && response.length >=1){
  
          globalResponse.status     = STATUS_SUCCESS;
          globalResponse.message    = "Employee open task list";
          globalResponse.statusCode = OK;
          globalResponse.data       = response;
          return res.status(OK).send(globalResponse);
        }else{
          //check the repeat days for employee
          let currentDay = weekday[new Date().getUTCDay()];
          let conditions = {
            repeatDays: {$in : [currentDay]},
            employeeId:id, status:DEACTIVE, isDaily:NO
          };
          Jobs.find(conditions,{_id:1, contractId:1}).populate('contractId','name startDate endDate description address').exec((err,response)=>{
            globalResponse.status     = STATUS_SUCCESS;
            globalResponse.message    = "Employee open task list";
            globalResponse.statusCode = OK;
            globalResponse.data       = response;
            return res.status(OK).send(globalResponse);
          });
        }
      });
    } catch (err) {
      return res.status(INTERNAL).send({
        status: STATUS_ERROR,
        message: err.message,
        statusCode:INTERNAL
      });
    }
  }; //end

  /**
   * Function for get active task of employee
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.getActiveTasksList = async (req, res) => {
    var globalResponse = {
      status: STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
      statusCode:INTERNAL
    };
    let id = req.query.id ? req.query.id :"";
    if(!id) return res.status(INTERNAL).send(globalResponse);
    /** save the data */
    try {
      
      Jobs.find({employeeId:id,status:DEACTIVE},{_id:1, contractId:1}).populate(
        {
          path: 'contractId',
          match: { startDate: new Date()},
          select:{name:1,address:1,startDate:1,endDate:1},
      }
      ).exec((err,response)=>{
        if(response != null){
  
          globalResponse.status     = STATUS_SUCCESS;
          globalResponse.message    = "Employee open task list";
          globalResponse.statusCode = OK;
          globalResponse.data       = response;
        }
        return res.status(OK).send(globalResponse);
        
      });
    } catch (err) {
      return res.status(INTERNAL).send({
        status: STATUS_ERROR,
        message: err.message,
        statusCode:INTERNAL
      });
    }
  }; //end

  /**
   * Functiom to signoff the task
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  this.signoffTask = async(req,res,next)=>{
    var globalResponse = {
      status    : STATUS_ERROR,
      message   : "Something is went wrong . Please try again later",
      statusCode: INTERNAL
    };
    let taskId  = req.body.taskId     ? req.body.taskId     : "";
    // let userId  = req.body.employeeId ? req.body.employeeId : "";
    if(!taskId) return res.status(INTERNAL).send(globalResponse);
    try {
      
      let documentFile    = (req.files && req.files.photos) ? req.files.photos  : "";
      let docLength       = (req.files && req.files.photos) ? req.files.photos.length : 0;
      var fileName        = [];
      asyncParallel({
        multiple_responce: function (callback) {
          if(req.files && req.files.photos.constructor === Array){
            req.files.photos.map(async(file)=>{
              await moveUploadedFile(file, { file_path: UPLOAD_TASK_IMAGE}).then((imageResponce) => {
                if (imageResponce.status == STATUS_SUCCESS) 
                fileName.push({name :imageResponce.file_name});
              });
              if(fileName.length == docLength){
                callback(null,fileName)
              }
            });
          }else{
            callback(null,null)
          }
        },
        single_response : function(callback){
          if (documentFile != "" && documentFile.constructor ===Object) {
            moveUploadedFile(documentFile, { file_path: UPLOAD_TASK_IMAGE}).then((imageResponce) => {
                /* send success responce */
                if (imageResponce.status == STATUS_SUCCESS){
                  callback(null, [{name:imageResponce.file_name}]);
                }else{
                  callback(imageResponce.err, null);
                }
              });
            } else {
              callback(null, null);
            }
          }
       },async function (err, results) {
          let taskLogs = {}
          taskLogs.photos = results && results.single_response ? results.single_response : (results && results.multiple_responce ? results.multiple_responce : "" )
        
          let findTaskdata = await TaskLogs.findOne({taskId: taskId});
          let timeDiff = (new Date().getTime() - new Date(findTaskdata.startTime).getTime());

          timeDiff = (timeDiff / 1000 % 60);

          //convert in hours
          let timediffHr = (timeDiff / 3600);

          taskLogs.isDone   = YES;
          taskLogs.isIssue  = NO;
          taskLogs.endTime  = new Date();
          taskLogs.timeTaken= timediffHr
        
          let data = await TaskLogs.updateOne({taskId: taskId},{$set:taskLogs});
          await Jobs.updateOne({taskId: taskId},{$set:{status:ACTIVE}});
          if(data === null) return res.status(INTERNAL).send(globalResponse);

          /**send success response */
          globalResponse.status     = STATUS_SUCCESS;
          globalResponse.message    = "Task has been signed off."
          globalResponse.statusCode = OK;
          return res.status(OK).send(globalResponse)
      });
    } catch (err) {
      return res.status(INTERNAL).send({
        status      : STATUS_ERROR,
        message     : err.message,
        statusCode  : INTERNAL
      });
    }
  };//end

  /**
   * Functiom to report issue the task
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
   this.reportTask = async(req,res,next)=>{
    var globalResponse = {
      status    : STATUS_ERROR,
      message   : "Something is went wrong . Please try again later",
      statusCode: INTERNAL
    };
    let taskId  = req.body.taskId     ? req.body.taskId     : "";
    if(!taskId) return res.status(INTERNAL).send(globalResponse);
    try {

      let documentFile    = (req.files && req.files.photos) ? req.files.photos  : "";
      let docLength       = (req.files && req.files.photos) ? req.files.photos.length : 0;
      var fileName        = [];
      asyncParallel({
        multiple_responce: function (callback) {
          if(req.files && req.files.photos.constructor === Array){
            req.files.photos.map(async(file)=>{
              await moveUploadedFile(file, { file_path: UPLOAD_TASK_IMAGE}).then((imageResponce) => {
                if (imageResponce.status == STATUS_SUCCESS) 
                fileName.push({name :imageResponce.file_name});
              });
              if(fileName.length == docLength){
                callback(null,fileName)
              }
            });
          }else{
            callback(null,null)
          }
        },
        single_response : function(callback){
          if (documentFile != "" && documentFile.constructor ===Object) {
            moveUploadedFile(documentFile, { file_path: UPLOAD_TASK_IMAGE}).then((imageResponce) => {
                /* send success responce */
                if (imageResponce.status == STATUS_SUCCESS){
                  callback(null, [{name:imageResponce.file_name}]);
                }else{
                  callback(imageResponce.err, null);
                }
              });
            } else {
              callback(null, null);
            }
          }
       },async function (err, results) {
         let taskLogs  = {};
          taskLogs.photos = results && results.single_response ? results.single_response : (results && results.multiple_responce ? results.multiple_responce : "" )
         
          let findTaskdata = await TaskLogs.findOne({taskId: taskId});
          let timeDiff = (new Date().getTime() - new Date(findTaskdata.startTime).getTime());
          timeDiff = Math.floor(timeDiff / 1000 % 60);
          //convert in hours
          timeDiff = (timeDiff / 1000 % 60);

          //convert in hours
          let timediffHr = (timeDiff / 3600);

          taskLogs.isDone   = YES;
          taskLogs.isIssue  = YES;
          taskLogs.endTime  = new Date();
          taskLogs.timeTaken= timediffHr

          let data = await TaskLogs.updateOne({taskId: taskId},{$set:taskLogs});
          await Jobs.updateOne({taskId: taskId},{$set:{status:ACTIVE,isIssue:YES}});
          if(data === null) return res.status(INTERNAL).send(globalResponse);

          /**send success response */
          globalResponse.status     = STATUS_SUCCESS;
          globalResponse.message    = "Task has been reported."
          globalResponse.statusCode = OK;
          return res.status(OK).send(globalResponse)
      });
    } catch (err) {
      return res.status(INTERNAL).send({
        status      : STATUS_ERROR,
        message     : err.message,
        statusCode  : INTERNAL
      });
    }
  };//end

  /**
   * Function for get completed task list of employee
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.getCompletedTasksList = async (req, res) => {
    var globalResponse = {
      status    : STATUS_ERROR,
      message   : "Something is went wrong . Please try again later",
      statusCode: INTERNAL
    };
    let id = req.query.id ? req.query.id :"";
    if(!id) return res.status(INTERNAL).send(globalResponse);
    /** save the data */
    try {
      Jobs.find({employeeId:id, status:DEACTIVE},{_id :1,employeeId:1,contractId:1}).populate('contractId', 'name address startDate endDate').exec((err,response)=>{
        if(response != null){
  
          globalResponse.status     = STATUS_SUCCESS;
          globalResponse.message    = "Employee task lists";
          globalResponse.data       = response;
          globalResponse.statusCode = OK
        }
        return res.status(OK).send(globalResponse); 
      });
    } catch (err) {
      return res.status(INTERNAL).send({
        status    : STATUS_ERROR,
        message   : err.message,
        statusCode: INTERNAL
      });
    }
  }; //end

  /**
   * Function for get task list of employee
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.getTaskDetails = async (req, res) => {
    var globalResponse = {
      status: STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };
    let id = req.query.taskId ? req.query.taskId :"";
    if(!id) return res.status(INTERNAL).send(globalResponse);
    /** save the data */
    try {
      let data = await Jobs.findOne({_id:id},{_id:1, contractId:1}).populate('contractId' ,'name description address startDate endDate');
      if(data != null){
        globalResponse.status  = STATUS_SUCCESS;
        globalResponse.message = "Task details";
        globalResponse.data    = data;
      }
      return res.status(OK).send(globalResponse);
    } catch (err) {
      return res.status(INTERNAL).send({
        status: STATUS_ERROR,
        message: err.message
      });
    }
  }; //end
  
  /**
   * Function to logout users 
   * 
   */
  this.getEmployeeLogout= async(req,res)=>{
    var globalResponse = {
      status     : STATUS_ERROR,
      message    : "Something is went wrong . Please try again later",
      statusCode : INTERNAL
    };
    let id = req.query.id ? req.query.id :"";
    if(!id) return res.status(INTERNAL).send(globalResponse);
    /** save the data */
    try {
      let uptddata = await Users.findOneAndUpdate({employeeId : id},{
        token_key :""
      });

      let logsdata = await Logs.findOne({employeeId:id},{_id :1,login:1,logout:1});
      let logoutTime = logsdata.logout ? logsdata.logout : new Date()

      let todayHour = ((logoutTime.getTime() - logsdata.login.getTime()) / 1000);
 
      let data = await Logs.updateOne({employeeId : uptddata.employeeId},{
        logout :logoutTime,
        workingHour :todayHour 
      });

      if(data != null || uptddata != null){
        globalResponse.status     = STATUS_SUCCESS;
        globalResponse.message    = "Employee logout successfully";
        globalResponse.statusCode = OK;
        return res.status(OK).send(globalResponse);
      }
      return res.status(INTERNAL).send(globalResponse);
      
    } catch (err) {
      return res.status(INTERNAL).send({
        status     : STATUS_ERROR,
        statusCode : INTERNAL,
        message    : err.message
      });
    }
  };//end
}
module.exports = new EmployeeApi();
