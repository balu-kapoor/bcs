const asyncParallel = require("async/parallel");
const Jobs = require("../../../model/admin/admin.jobs.schemas")
const Contracts = require('../../../model/admin/admin.contract.schemas')

function JobsManager() {

  /**
   * Function for get job's Listing
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.getJobsListing = (req, res) => {
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
          Jobs.find(
            conditions,
            {
              _id: 1,
              employeeId:1,
              serviceId:1,
              jobType:1,
              contractId:1,
              isDaily:1,
              repeatDays:1,
              status: 1,
              created_at: 1,
              modified_at: 1,
              isIssue:1,
            },
            {sort: { modified_at: SORT_DESC}, skip: skip, limit: limit}).populate('employeeId','firstName employeeId _id').populate('contractId').populate('serviceId').exec
            ((err, result) => {
              /* send success response */
              callback(err, result);
            }
          );
        },
        records_filtered: function (callback) {
            Jobs.countDocuments(conditions, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        records_total: function (callback) {
            Jobs.countDocuments({}, (err, result) => {
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
   * Function for add 
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.createJob = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };

    /** save the data */
    try {
      let task      = new Jobs(req.body);
      let errors    = task.validateSync();

      if (errors != undefined && errors.length > 0) 
        return res.status(INTERNAL).send(globalResponse);

      let data = await Contracts.findById(req.body.contractId);
      task.clientId = data.clientId ? data.clientId : null;
      task.created_at= new Date();
      task.modified_at= new Date();
      /** save the data to collections */
      let insertData = await task.save();

      if (insertData == null)
        return res.status(INTERNAL).send(globalResponse);

      globalResponse.status = STATUS_SUCCESS;
      globalResponse.message = "Job has been added";
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
   this.editJobs = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };

   if(req.method == "POST"){
     try {
        let data = await Jobs.updateOne({_id : req.body.id},{
          contractId : req.body.contractId,
          employeeId : req.body.employeeId,
          serviceId  : req.body.serviceId,
          jobType    : req.body.jobType,
          repeatDays : req.body.repeatDays,
          isDaily    : req.body.isDaily,
          modified_at: new Date()
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

      let data = await Jobs.findById(id);
      globalResponse.status  = STATUS_SUCCESS;
      globalResponse.message = " Data";
      globalResponse.data    =  data;
      return res.status(OK).send(globalResponse);
   }
  }; //end

  /**
   * Function for edit 
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.viewJobs = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };
    let id = req.query.id ? req.query.id :"";
    if(!id) return res.status(INTERNAL).send(globalResponse)

    let data = await Jobs.findById(id).populate('contractId','_id name').populate('employeeId','_id firstName').populate('serviceId','_id name');
    globalResponse.status  = STATUS_SUCCESS;
    globalResponse.message = " Data";
    globalResponse.data    =  data;
      return res.status(OK).send(globalResponse);
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

    let data = await Jobs.findById(userId);
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    let status = data.status === ACTIVE ? DEACTIVE : ACTIVE;
    Jobs.updateOne(
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

    let data = await Jobs.deleteOne({_id :userId});
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "Deleted successfully";
    return res.status(OK).send(globalResponse);
  }; //end

   /**
   * Function to get contract list
   *
   * @param
   */
  this.contractDropdown = async (req, res) => {
      var globalResponse = {
        status  : STATUS_ERROR,
        message : "Something wents wrong. Please try again later.",
      };
      
  
      let data = await Contracts.find({status:ACTIVE},{_id:1,name:1});
      if (data == null) return res.status(INTERNAL).send(globalResponse);
  
      globalResponse.status   = STATUS_SUCCESS;
      globalResponse.message  = "List of contracts ";
      globalResponse.data     = data
      return res.status(OK).send(globalResponse);
  
    }; //end
  /**
   * Function to get employee contract list
   *
   * @param
   */
  this.employeeDropdown = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    let contractId = req.query.contractId ? req.query.contractId :"";

    let data = await Contracts.findOne({_id: contractId},{_id:1,name:1,employee:1}).populate('employee.value', '_id firstName');
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "List of employee ";
    globalResponse.data     = data
    return res.status(OK).send(globalResponse);

  }; //end

  /**
   * Function to get service contract list
   *
   * @param
   */
   this.serviceDropdown = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    let contractId = req.query.contractId ? req.query.contractId :"";

    let data = await Contracts.findOne({_id: contractId},{_id:1,name:1,service:1}).populate('service.value', '_id name');
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "List of services ";
    globalResponse.data     = data
    return res.status(OK).send(globalResponse);

  }; //end
}
module.exports = new JobsManager();
