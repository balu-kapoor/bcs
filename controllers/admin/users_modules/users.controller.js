const asyncParallel = require("async/parallel");
const Admin         = require("../../../model/admin/admin.users.schemas");
const AdminSchema   = require("../../../model/admin/admin.admins.schemas");
const bcrypt = require('bcrypt');
function User() {

  /**
   * Function for get client's Listing
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.getClientsListing = (req, res, next) => {
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

    var conditions = { role_type: TYPE_VENDORS ,is_deleted: NOT_DELETED };
    if (filterCondition.firstName) {
      conditions.firstName = new RegExp(clean_regex(filterCondition.firstName), "i");
    }
    if (filterCondition.email) {
      conditions.email = new RegExp(clean_regex(filterCondition.email), "i");
    }
    // if (startDate && endDate) {
    //   conditions.created_at = { $gte: startDate, $lte: endDate };
    // }

    asyncParallel(
      {
        data: function (callback) {
          Admin.find(
            conditions,
            {
              _id: 1,
              firstName: 1,
              status: 1,
              created_at: 1,
              email:1,
              image:1,
              address:1
            },
            {sort: { firstName: SORT_ASC}, skip: skip, limit: limit},
            (err, result) => {

              getuploadedImageURL(GET_PROFILE_IMAGE,result, UPLOAD_PROFILE_IMAGE).then((resultData) => {
                callback(err, resultData);
              });
             
            }
          );
        },
        records_filtered: function (callback) {
          Admin.countDocuments(conditions, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        records_total: function (callback) {
          Admin.countDocuments({role_type: TYPE_VENDORS,is_deleted: NOT_DELETED}, (err, result) => {
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
   * Function for get employee's Listing
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.getEmployeeListing = (req, res, next) => {
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

    var conditions = { role_type: TYPE_USERS,is_deleted: NOT_DELETED };
    if (filterCondition.firstName) {
      conditions.firstName = new RegExp(clean_regex(filterCondition.firstName), "i");
    }
    if (filterCondition.id) {
      conditions.employeeId = new RegExp(clean_regex(filterCondition.id), "i");
    }
    // if (startDate && endDate) {
    //   conditions.created_at = { $gte: startDate, $lte: endDate };
    // }

    asyncParallel(
      {
        data: function (callback) {
          Admin.find(conditions,{_id: 1,image:1,firstName: 1,lastName: 1,status: 1,created_at: 1,image:1,employeeId:1},
            {sort: { firstName: SORT_ASC}, skip: skip, limit: limit},
            (err, result) => {
              getuploadedImageURL(GET_PROFILE_IMAGE,result, UPLOAD_PROFILE_IMAGE).then((resultData) => {
                callback(err, resultData);
              });
            }
          );
        },
        records_filtered: function (callback) {
          Admin.countDocuments(conditions, (err, result) => {
            /* send success response */
            callback(err, result);
          });
        },
        records_total: function (callback) {
          Admin.countDocuments({role_type: TYPE_USERS,is_deleted: NOT_DELETED}, (err, result) => {
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
   * Function for add client in user collection
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.addClient = async (req, res) => {
    var globalResponse = {
      status: STATUS_ERROR,
      message: "Something is went wrong . Please try again later",
    };

    /** save the data */
    try {
      let customers = new Admin(req.body);
      let errors    = customers.validateSync();

      if (errors != undefined && errors.length > 0) 
        return res.status(INTERNAL).send(globalResponse);

      /** check dulicated entry */
      let found  = await Admin.countDocuments({email:req.body.email});
      let mobile = await Admin.countDocuments({email:parseInt(req.body.mobile)});

      if(found >0 || mobile >0){
        var message = "DUPLICATE_ENTRY";
        return res.status(INTERNAL).send({
          status: STATUS_ERROR,
          message: message,
        });
      }

      customers.firstName = req.body.name;
      customers.lastName  = "";
      customers.image = "";
      customers.role_type= TYPE_VENDORS;
      if (typeof req.body.image != typeof undefined) {
        let imageFile = await uploadImageFile( req.body.image, UPLOAD_PROFILE_IMAGE,UPLOAD_PROFILE_NAME);
        
        if (imageFile.status) {
          customers.image = imageFile.file_name;
        }
      }

      /** save the data to collections */
      let insertData = await customers.save();

      if (insertData == null)
        return res.status(INTERNAL).send(globalResponse);

      globalResponse.status = STATUS_SUCCESS;
      globalResponse.message = "Customer has been added";
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
   * Function for add employee in user collection
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
    this.addEmployee = async (req, res) => {
      var globalResponse = {
        status: STATUS_ERROR,
        message: "Something is went wrong . Please try again later",
      };
  
      /** save the data */
      try {
        let customers = new Admin(req.body);
        let errors    = customers.validateSync();
  
        if (errors != undefined && errors.length > 0) 
          return res.status(INTERNAL).send(globalResponse);
  
        customers.image = "";
        customers.email = "";
        if (typeof req.body.image != typeof undefined) {
          let imageFile = await uploadImageFile( req.body.image, UPLOAD_PROFILE_IMAGE,UPLOAD_PROFILE_NAME);
          
          if (imageFile.status) {
            customers.image = imageFile.file_name;
          }
        }
        let uniqueId = randomString(10);
        customers.employeeId = uniqueId.toLowerCase();
        /** save the data to collections */
        let insertData = await customers.save();
  
        if (insertData == null)
          return res.status(INTERNAL).send(globalResponse);
  
        globalResponse.status = STATUS_SUCCESS;
        globalResponse.message = "Employee has been added";
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
   * Function for update client in user collection
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
  this.editClient = async (req, res) => {
    var globalResponse = {
      status: STATUS_ERROR,
      message: "Something wents wrong. Please try again later.",
    };
    if (req.method === "POST") {
      try {
        let customers = new Admin(req.body);
        let errors = customers.validateSync();

        if (errors != undefined && errors.length > 0) {
          globalResponse.message =
            "Field validation failed. Please enter correct data";
          return res.status(INTERNAL).send(globalResponse);
        }
        /** save the data */
        let originalData = await Admin.findById(req.body.user_id);

         /** check dulicated entry */
        let found  = await Admin.countDocuments({email:req.body.email});
        let mobile = await Admin.countDocuments({email:parseInt(req.body.mobile)});

        if(found >1 || mobile >1){
          var message = "DUPLICATE_ENTRY";
          return res.status(INTERNAL).send({
            status: STATUS_ERROR,
            message: message,
          });
        }
        customers.image = originalData.image;
        if (typeof req.body.image != typeof undefined) {
          let imageFile = await uploadImageFile(
            req.body.image,
            UPLOAD_PROFILE_IMAGE,
            UPLOAD_PROFILE_NAME
          );
          if (imageFile.status) {
            customers.image = imageFile.file_name;
            if(originalData.image)
            unLinkFile(UPLOAD_PROFILE_IMAGE, originalData.image);
          }
        }
        
        let updateData = await Admin.updateOne(
          {
            _id: req.body.user_id,
          },
          {
            firstName: req.body.name ? req.body.name : originalData.firstName,
            email: req.body.email ? req.body.email : originalData.email,
            address: req.body.address ? req.body.address : "",
            mobile: req.body.mobile ? req.body.mobile : "",
            image: customers.image,
            modified_at: getUtcDate(),
          },
          { new: false }
        );

        if (updateData == null) {
          globalResponse.status = STATUS_ERROR;
          globalResponse.message = "Failed to update menu";
          return res.status(INTERNAL).send(globalResponse);
        }
        globalResponse.status = STATUS_SUCCESS;
        globalResponse.message = "Data has been updated";
        return res.status(OK).send(globalResponse);
      } catch (err) {
        if (err.name == "MongoError" && err.code == 11000)
          var message = "DUPLICATE_ENTRY";
        return res.status(INTERNAL).send({
          status: STATUS_ERROR,
          message: message == undefined ? err.message : message,
        });
      }
    } else {
      let userId = req.query.id ? req.query.id : "";
      if (!userId) return res.status(OK).send(globalResponse);
      try {
        let data = await Admin.findById(
          {
            _id: userId,
          }
        );
        if (data == null) return res.status(OK).send(globalResponse);
        getuploadedImageURL(
          GET_PROFILE_IMAGE,
          [data],
          UPLOAD_PROFILE_IMAGE
        ).then((result) => {
          globalResponse.status = STATUS_SUCCESS;
          globalResponse.message = "User data";
          globalResponse.data = data && result ? result[0] : data;

          return res.status(OK).send(globalResponse);
        });
      } catch (err) {
        if (err.name == "MongoError" && err.code == 11000)
          var message = "DUPLICATE_ENTRY";
        return res.status(INTERNAL).send({
          status: STATUS_ERROR,
          message: message == undefined ? err.message : message,
        });
      }
    }
  }; //end

  /**
   * Function for update employee in user collection
   *
   * @param req As Request Data
   * @param res As Reponse Data
   *
   */
   this.editEmployee = async (req, res) => {
    var globalResponse = {
      status: STATUS_ERROR,
      message: "Something wents wrong. Please try again later.",
    };
    if (req.method === "POST") {
      try {
        let customers = new Admin(req.body);
        let errors = customers.validateSync();

        if (errors != undefined && errors.length > 0) {
          globalResponse.message =
            "Field validation failed. Please enter correct data";
          return res.status(INTERNAL).send(globalResponse);
        }
        /** save the data */
        let originalData = await Admin.findById(req.body.user_id);
        customers.image = originalData.image;
        if (typeof req.body.image != typeof undefined) {
          let imageFile = await uploadImageFile(
            req.body.image,
            UPLOAD_PROFILE_IMAGE,
            UPLOAD_PROFILE_NAME
          );
          if (imageFile.status) {
            customers.image = imageFile.file_name;
            if(originalData.image)
            unLinkFile(UPLOAD_PROFILE_IMAGE, originalData.image);
          }
        }
        
        let updateData = await Admin.updateOne(
          {
            _id: req.body.user_id,
          },
          {
            firstName: req.body.firstName ? req.body.firstName : originalData.firstName,
            lastName: req.body.lastName ? req.body.lastName : originalData.lastName,
            email: req.body.email ? req.body.email : "",
            mobile: req.body.mobile ? req.body.mobile : "",
            image: customers.image,
            modified_at: getUtcDate(),
          },
          { new: false }
        );

        if (updateData == null) {
          globalResponse.status = STATUS_ERROR;
          globalResponse.message = "Failed to update menu";
          return res.status(INTERNAL).send(globalResponse);
        }
        globalResponse.status = STATUS_SUCCESS;
        globalResponse.message = "Data has been updated";
        return res.status(OK).send(globalResponse);
      } catch (err) {
        if (err.name == "MongoError" && err.code == 11000)
          var message = "DUPLICATE_ENTRY";
        return res.status(INTERNAL).send({
          status: STATUS_ERROR,
          message: message == undefined ? err.message : message,
        });
      }
    } else {
      let userId = req.query.id ? req.query.id : "";
      if (!userId) return res.status(OK).send(globalResponse);
      try {
        let data = await Admin.findById(
          {
            _id: userId,
          }
        );
        if (data == null) return res.status(OK).send(globalResponse);
        getuploadedImageURL(
          GET_PROFILE_IMAGE,
          [data],
          UPLOAD_PROFILE_IMAGE
        ).then((result) => {
          globalResponse.status = STATUS_SUCCESS;
          globalResponse.message = "User data";
          globalResponse.data = data && result ? result[0] : data;

          return res.status(OK).send(globalResponse);
        });
      } catch (err) {
        if (err.name == "MongoError" && err.code == 11000)
          var message = "DUPLICATE_ENTRY";
        return res.status(INTERNAL).send({
          status: STATUS_ERROR,
          message: message == undefined ? err.message : message,
        });
      }
    }
  }; //end

  /**
  * Function to update admin profile
  *
  * @param {*} req
  * @param {*} res
  * @returns Json
  */
 this.adminProfile = async (req, res) => {
   var globalResponse = {
     status  : STATUS_ERROR,
     message : "Something wents wrong. Please try again later.",
   };
   if(req.method === "POST"){
     try {
       /** save the data */
       let originalData = await AdminSchema.findById(req.body.id);
       let reqData      = {};
 
       reqData.image = originalData.image;
       
       if (typeof req.body.image != typeof undefined) {
         let imageFile = await uploadImageFile(req.body.image, UPLOAD_PROFILE_IMAGE,UPLOAD_PROFILE_NAME);
         if (imageFile.status) {
           reqData.image = imageFile.file_name;
           if (originalData.image)
             unLinkFile(UPLOAD_PROFILE_IMAGE, originalData.image);
         }
       }
 
       let updateData = await AdminSchema.updateOne(
         {
           _id: req.body.id,
         },
         {
           name       : req.body.name  ? req.body.name  : originalData.name,
           username   : req.body.email ? req.body.email : originalData.email,
           image      : reqData.image,
           modified_at: new Date(),
         },
         { new: false }
       );
 
       if (updateData == null) {
         return res.status(INTERNAL).send(globalResponse);
       }
       /** send success response */
       globalResponse.status  = STATUS_SUCCESS;
       globalResponse.message = "Data has been updated";
       return res.status(OK).send(globalResponse);
     } catch (err) {
       if (err.name == "MongoError" && err.code == 11000)
         var message = "DUPLICATE_ENTRY";
       return res.status(INTERNAL).send({
         status : STATUS_ERROR,
         message: message == undefined ? err.message : message,
       });
     }
   }else{
     let userId = req.query.id ? req.query.id : "";
     let data= await AdminSchema.findById(userId,{_id:1,name:1,username:1,image:1});
     if(data == null) return res.status(INTERNAL).send(globalResponse);

     /** append profile url path */
     getuploadedImageURL(GET_PROFILE_IMAGE,[data], UPLOAD_PROFILE_IMAGE).then((result) => {
       globalResponse.status   =  STATUS_SUCCESS;
       globalResponse.message  =  "User data";
       globalResponse.data     =  data && result ? result[0] : data;

       return res.status(OK).send(globalResponse);
     });

   }
 }; //end

  /***
   * Function to delete user data from collection
   *
   * @param req As Request Data
   * @param res As Response Data
   */
  this.deleteUser = async (req, res) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Something wents wrong. Please try again later.",
    };
    let userId = req.query.id ? req.query.id : "";
    
    if (!userId) return res.status(INTERNAL).send(globalResponse);
    
    try {
      let data = await Admin.findById({ _id: userId });
      unLinkFile(UPLOAD_PROFILE_IMAGE, data.image);

      await Admin.updateOne(
        {
          _id: userId,
        },
        { is_deleted: DELETED, image: "" }
      );

      globalResponse.status  = STATUS_SUCCESS;
      globalResponse.message = "Deleted successfully";
      
      return res.status(OK).send(globalResponse);
    
    } catch (err) {
      return res.status(INTERNAL).send({
        status  :  STATUS_ERROR,
        message :  "Something wents wrong. Please try again later.",
      });
    }
  }; //end

  /**
   * Function to change status of user
   *
   * @param
   */
  this.changeUserStatus = async (req, res) => {
    var globalResponse = {
      status  : STATUS_ERROR,
      message : "Something wents wrong. Please try again later.",
    };
    let userId  = req.query.id ? req.query.id : "";
    if (!userId) return res.status(OK).send(globalResponse);

    let data = await Admin.findById(userId);
    if (data == null) return res.status(INTERNAL).send(globalResponse);

    let status = data.status === ACTIVE ? DEACTIVE : ACTIVE;
    Admin.updateOne(
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
   * Function to change password
   *
   */
  this.changePassword = async (req, res) => {
    try {
      var userId = req.body.user_id ? (req.body.user_id) : "";

      if (req.body.old_password) {
        var OldPass = await AdminSchema.findOne({ _id: req.body.user_id });
        var resultPass = await bcrypt.compare(
          req.body.old_password,
          OldPass.password
        );
        if (!resultPass) {
          /**send errors response */
          return res
            .status(INTERNAL)
            .send({ status: STATUS_ERROR, message: "Invalid password." });
        }
      }
      /** BCRYPT PASS */
      if (req.body.new_password != undefined) {
        let hashPassword = await bcrypt.hash(req.body.new_password, SALT_ROUND);
        await AdminSchema.updateOne({ _id: userId }, { password: hashPassword });
      }

      return res
        .status(OK)
        .send({ status: STATUS_SUCCESS, message: "changed successfully" });
    }catch (error) {
      return res.status(INTERNAL).send({
        status: STATUS_ERROR,
        message: error.message,
      });
    }
  }; //end

}
module.exports = new User();
