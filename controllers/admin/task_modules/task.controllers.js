const asyncParallel = require("async/parallel");
const Tasks = require('../../../model/admin/admin.contract.schemas');
const Tasklogs = require('../../../model/admin/admin.task.logs.schemas');
const Service = require('../../../model/admin/admin.services.schemas');
const Users = require('../../../model/admin/admin.users.schemas');
const Jobs = require('../../../model/admin/admin.jobs.schemas')
function TaskManager() {

  /**
   * Function to get service list
   *
   * @param
   */
   this.getServiceDropDown = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    

    let data = await Service.find({status:ACTIVE});
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "List of services ";
    globalResponse.data     = data
    return res.status(OK).send(globalResponse);

  }; //end

/**
 * Function to get employee  list
 *
 * @param
 */
  this.getEmployeeLists = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    

    let data = await Users.find({status:ACTIVE,role_type:TYPE_USERS,is_deleted:NOT_DELETED},{_id:1,firstName:1,lastName:1});
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "List of employee ";
    globalResponse.data     = data
    return res.status(OK).send(globalResponse);
  }; 
//end

/**
 * Function to get employee  list
 *
 * @param
 */
 this.getClientLists = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    

    let data = await Users.find({status:ACTIVE,role_type:TYPE_VENDORS,is_deleted:NOT_DELETED},{_id:1,firstName:1,lastName:1});
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "List of client ";
    globalResponse.data     = data
    return res.status(OK).send(globalResponse);
  }; //end

  /**
   * Function for get task's Listing
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.getTasksListing = (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "No records found",
      data   : []
    };

    /** Filteration value */
    let limit = req.body.length ? parseInt(req.body.length) : DATATABLE_DEFAULT_LIMIT;
    let skip  = req.body.start  ? parseInt(req.body.start)  : DATATABLE_DEFAULT_SKIP;
    skip      = skip === 0 ? 0 : (skip - 1) * limit;

    let filterCondition = req.body.filter ? req.body.filter : {};

    // let startDate = filterCondition.start_date
    //   ? new Date(filterCondition.start_date)
    //   : null;
    // let endDate = filterCondition.end_date
    //   ? new Date(filterCondition.end_date)
    //   : null;

    var conditions = { };
    if (filterCondition.name) {
      conditions.name = new RegExp(clean_regex(filterCondition.name), "i");
    }
    // if (filterCondition.name) {
    // }
    // if (startDate && endDate) {
    //   conditions.created_at = { $gte: startDate, $lte: endDate };
    // }

    asyncParallel(
      {
        data: function (callback) {
            Tasks.find(
            conditions,
            {
              _id: 1,
              name: 1,
              clientId: 1,
              employee:1,
              service:1,
              status: 1,
              created_at: 1,
              isDone:1,
              isIssue:1
            },
            {sort: { created_at: SORT_DESC}, skip: skip, limit: limit}).populate('clientId').populate('employee.value').populate('service.value').exec
            ((err, result) => {
              /* send success response */
              callback(err, result);
            }
          );
        },
        records_filtered: function (callback) {
            Tasks.countDocuments(conditions, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        records_total: function (callback) {
            Tasks.countDocuments({}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
      },
      function (err, results) {
        if (err)
          return res.status(INTERNAL).send(globalResponse);

        (globalResponse.status = STATUS_SUCCESS),
          (globalResponse.message = "Records found");
        globalResponse.data = {
          records: results && results.data ? results.data : [],
          recordsFiltered:
            results && results.records_filtered ? results.records_filtered : 0,
          recordsTotal:
            results && results.records_total ? results.records_total : 0,
        };
        res.status(OK).send(globalResponse);
      }
    );
  }; //end

  /**
   * Function for get task's logs Listing
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.getTasksLogsListing = (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "No records found",
      data   : []
    };

    /** Filteration value */
    let limit = req.body.length ? parseInt(req.body.length) : DATATABLE_DEFAULT_LIMIT;
    let skip  = req.body.start  ? parseInt(req.body.start)  : DATATABLE_DEFAULT_SKIP;
    skip      = skip === 0 ? 0 : (skip - 1) * limit;

    let filterCondition = req.body.filter ? req.body.filter : {};

    // let startDate = filterCondition.start_date
    //   ? new Date(filterCondition.start_date)
    //   : null;
    // let endDate = filterCondition.end_date
    //   ? new Date(filterCondition.end_date)
    //   : null;

    var conditions = { };
    if (filterCondition.name) {
      conditions.name = new RegExp(clean_regex(filterCondition.name), "i");
    }
    // if (filterCondition.name) {
    // }
    // if (startDate && endDate) {
    //   conditions.created_at = { $gte: startDate, $lte: endDate };
    // }

    asyncParallel(
      {
        data: function (callback) {
          Tasklogs.find(
            conditions,
            {
              _id: 1,
              name: 1,
              taskId:1,
              contractId:1,
              employeeId:1,
              photos: 1,
              created_at: 1,
              isDone:1,
              isIssue:1,
              comment:1,
              reportTitle:1,
              reportDescription:1,
              startTime:1,
              endTime:1,
              type:1,
            },
            {sort: { created_at: SORT_DESC}, skip: skip, limit: limit}).populate('employeeId','_id firstName').populate('contractId','_id name').exec
            ((err, result) => {
              /* send success response */
              callback(err, result);
            }
          );
        },
        records_filtered: function (callback) {
          Tasklogs.countDocuments(conditions, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        records_total: function (callback) {
          Tasklogs.countDocuments({}, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
      },
      function (err, results) {
        if (err)
          return res.status(INTERNAL).send(globalResponse);

        (globalResponse.status = STATUS_SUCCESS),
          (globalResponse.message = "Records found");
        globalResponse.data = {
          records: results && results.data ? results.data : [],
          recordsFiltered:
            results && results.records_filtered ? results.records_filtered : 0,
          recordsTotal:
            results && results.records_total ? results.records_total : 0,
        };
        res.status(OK).send(globalResponse);
      }
    );
  }; //end

  /**
  * Function to get task report data and re-opend it
  *
  * @param
  */
  this.getTasksReported = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    if(req.method === 'POST'){
      let taskId = req.body.taskId ? req.body.taskId :"";
      /**send error response */
      if (!taskId) return res.status(INTERNAL).send(globalResponse);

      let deleteData = await Tasklogs.deleteOne({taskId : taskId});
      let upData     = await Jobs.updateOne({_id : taskId},{isIssue:NO,status:DEACTIVE});
      if(deleteData != null && upData != null){
          /**send success response */
          globalResponse.status   = STATUS_SUCCESS;
          globalResponse.message  = "Re-open the task successfully.";
          return res.status(OK).send(globalResponse);
      }else{
        return res.status(INTERNAL).send(globalResponse);
      }
    }else{
      let taskId = req.query.taskId ? req.query.taskId :"";
      /**send error response */
      if (!taskId) return res.status(INTERNAL).send(globalResponse);

      let data = await Tasklogs.findOne({taskId:taskId}).populate('taskId');
      if (data === null) return res.status(OK).send(globalResponse);
      
      /** append image url */
      let options ={
        fieldName :"name",
      }
      
      getMultipleImageURL(GET_TASK_IMAGE,data.photos,UPLOAD_TASK_IMAGE,options).then(response=>{
        data.photos = response
        /**send success response */
        globalResponse.status   = STATUS_SUCCESS;
        globalResponse.message  = "data";
        globalResponse.data     = data
        return res.status(OK).send(globalResponse);
      });
    }

}; //end


   /**
   * Function for add 
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.addTask = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };

    /** save the data */
    try {
      let task      = new Tasks(req.body);
      let errors    = task.validateSync();

      if (errors != undefined && errors.length > 0) 
        return res.status(INTERNAL).send(globalResponse);


      /** save the data to collections */
      let insertData = await task.save();

      if (insertData == null)
        return res.status(INTERNAL).send(globalResponse);

      globalResponse.status = STATUS_SUCCESS;
      globalResponse.message = "Task has been added";
      /** send success response */
      return res.status(CREATED).send(globalResponse);
    } catch (err) {
      if (err.name == "MongoError" && err.code == 11000)
        var message = "DUPLICATE_ENTRY";
      return res.status(INTERNAL).send({
        status: STATUS_ERROR,
        message: message == undefined ? err.message : message,
      });
    }
  }; //end

  /**
   * Function for edit 
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.editTask = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };

   if(req.method == "POST"){
     try {
        let data = await Tasks.updateOne({_id : req.body.id},{
          name : req.body.name,
          clientId: req.body.clientId,
          employee : req.body.employee,
          service: req.body.service,
          startTime : req.body.startTime
        },{upsert:false});

        if(!data) return res.status(INTERNAL).send(globalResponse);

        globalResponse.status  = STATUS_SUCCESS;
        globalResponse.message = "updated"
        return res.status(OK).send(globalResponse);
      
     } catch (err) {
       if (err.name == "MongoError" && err.code == 11000)
         var message = "DUPLICATE_ENTRY";
       return res.status(INTERNAL).send({
         status: STATUS_ERROR,
         message: message == undefined ? err.message : message,
       });
     }
   }else{
      let id = req.query.id ? req.query.id :"";
      if(!id) return res.status(INTERNAL).send(globalResponse)

      let data = await Tasks.findById(id).populate('employee.value').populate('service.value');
      globalResponse.status  = STATUS_SUCCESS;
      globalResponse.message = " Data";
      globalResponse.data    =  data;
      return res.status(OK).send(globalResponse);
   }
  }; //end
  
  /**
   * Function to change status  from active to deactive and vice-versa
   *
   * @param
   */
   this.changeStatus = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    let userId  = req.query.id ? req.query.id : "";
    if (!userId) return res.status(INTERNAL).send(globalResponse);

    let data = await Tasks.findById(userId);
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    let status = data.status === ACTIVE ? DEACTIVE : ACTIVE;
    Tasks.updateOne(
      { _id: userId },
      {
        status: status,
      },
      (err, response) => {
        if (response == null) return res.status(INTERNAL).send(globalResponse);
        
        globalResponse.status   = STATUS_SUCCESS;
        globalResponse.message  = "Status has been changed";
        return res.status(OK).send(globalResponse);
      }
    );
  }; //end

  /**
   * Function to delete 
   *
   * @param
   */
   this.deleteTask = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    let userId  = req.query.id ? req.query.id : "";
    if (!userId) return res.status(INTERNAL).send(globalResponse);

    let data = await Tasks.deleteOne({_id :userId});
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "Deleted successfully";
    return res.status(OK).send(globalResponse);
  }; //end
}
module.exports = new TaskManager();
