const asyncParallel = require("async/parallel");
const Service = require('../../../model/admin/admin.services.schemas');

function Services() {

  /**
   * Function for get service's Listing
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.getServicesListing = (req, res) => {
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

    var conditions = {};
    if (filterCondition.name) {
      conditions.name = new RegExp(clean_regex(filterCondition.name), "i");
    }
    
    // if (startDate && endDate) {
    //   conditions.created_at = { $gte: startDate, $lte: endDate };
    // }

    asyncParallel(
      {
        data: function (callback) {
          Service.find(
            conditions,
            {
              _id: 1,
              name: 1,
              description: 1,
              duration:1,
              status: 1,
              created_at: 1,
            },
            {sort: { created_at: SORT_DESC}, skip: skip, limit: limit},
            (err, result) => {
              /* send success response */
              callback(err, result);
            }
          );
        },
        records_filtered: function (callback) {
          Service.countDocuments(conditions, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        records_total: function (callback) {
          Service.countDocuments({}, (err, result) => {
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
  this.addService = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };

    /** save the data */
    try {
      let services = new Service(req.body);
      let errors    = services.validateSync();

      if (errors != undefined && errors.length > 0) 
        return res.status(INTERNAL).send(globalResponse);


      /** save the data to collections */
      let insertData = await services.save();

      if (insertData == null)
        return res.status(INTERNAL).send(globalResponse);

      globalResponse.status = STATUS_SUCCESS;
      globalResponse.message = "Service has been added";
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
   this.editService = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };
    if(req.method === "POST"){
      /** save the data */
      try {

        /** save the data to collections */
        let insertData = await Service.updateOne(
          {
            _id : req.body.id
          },{
            name : req.body.name,
            description : req.body.description,
            duration: req.body.duration,
            modified: new Date()
          }
        );
  
        if (insertData == null)
          return res.status(INTERNAL).send(globalResponse);
  
        globalResponse.status = STATUS_SUCCESS;
        globalResponse.message = "Service has been updated";
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
    }else{
      let id = req.query.id ? req.query.id : "";
      if(!id) return res.status(INTERNAL).send(globalResponse);

      let data = await Service.findById(id);
      globalResponse.status  = STATUS_SUCCESS;
      globalResponse.message = " service data";
      globalResponse.data    = data;
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

    let data = await Service.findById(userId);
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    let status = data.status === ACTIVE ? DEACTIVE : ACTIVE;
    Service.updateOne(
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
   * Function to delete serice
   *
   * @param
   */
   this.delete = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    let userId  = req.query.id ? req.query.id : "";
    if (!userId) return res.status(INTERNAL).send(globalResponse);

    let data = await Service.deleteOne({_id :userId});
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    globalResponse.status   = STATUS_SUCCESS;
    globalResponse.message  = "Deleted successfully";
    return res.status(OK).send(globalResponse);
  }; //end
}
module.exports = new Services();
