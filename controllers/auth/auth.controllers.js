const bcrypt = require("bcrypt");
const Admin = require("../../model/admin/admin.admins.schemas");
const Users = require('../../model/admin/admin.users.schemas');
const Logs = require('../../model/front/front.employee.logs');
const Jobs = require('../../model/admin/admin.jobs.schemas');
const TaskLogs = require('../../model/admin/admin.task.logs.schemas')
const asyncParallel = require("async/parallel");
function Auth() {
  /**
   * Function for login admin
   *
   * @param req As Request Data
   * @param res As Reponse Data
   * @param next As Callback argument to middleware function
   */
  this.adminlogin = async (req, res, next) => {
    var globalResponse = {
      status : STATUS_ERROR,
      message: "Unauthorized access",
    };
    /** Validate the request body */
    req.checkBody({
      username: {
        notEmpty: true,
        isEmail: {
          errorMessage: "Please enter a valid email address.",
        },
        errorMessage: "Please provide email address.",
      },
      password: {
        notEmpty: true,

        errorMessage: "Please provide password.",
      },
    });

    let errors = parseErrors(req.validationErrors());

    /**If error in request body send error */
    globalResponse.error = errors;
    if (errors) return res.status(UNAUTHORIZED).send(globalResponse);

    /**Check the username andd password from db and validate it */
    Admin.findOne(
      { username: req.body.username.toLowerCase()},
      (findErr, findRes) => {
        if (!findRes || findErr)
        return res.status(UNAUTHORIZED).send(globalResponse);

        let hashPass = findRes.password;
        let plainPass = req.body.password;
        
        bcrypt.compare(plainPass, hashPass, async (err, result) => {
          if (!result)
            return res.status(UNAUTHORIZED).send(globalResponse);

          /**generate jwt token */
          let tokenId = generateToken(findRes._id);
          await Admin.updateOne(
            {
              _id: findRes._id,
            },
            { token_key: tokenId }
          );
          getuploadedImageURL(
            GET_PROFILE_IMAGE,
            [findRes],
            UPLOAD_PROFILE_IMAGE
          ).then((result) => {
            // return false;
            let userData = {
              user_type: findRes.role_type,
              token: tokenId,
              _id: findRes._id,
              profile_url: result.image,
              name: "admin",//result.name,
              user_type: 'admin'
            };
            
            return res.status(OK).send({ status: STATUS_SUCCESS, data: userData })
          });
          // let userData = {
          //   user_type: findRes.role_type,
          //   token: tokenId,
          //   _id: findRes._id,
          //   // profile_url: result[0].image,
          //   // name: result[0].name
          //   profile_url: '',
          //   name: 'admin'
          // };
          
          // return res.status(OK).send({ status: STATUS_SUCCESS, data: userData })
        });
      }
    );
    // let userData = {
    //   user_type: 'admin',
    //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiNjAxYjk3Mjk1NDFmNTUwYjVjZWM3YWJhIiwiaWF0IjoxNjE5MDY1MjIwfQ.6Bt3jy6xidlYFlKddvVh2jGdxMYkU9zipSty10AKjYQ',
    //   _id: 55,
    //   profile_url: '',
    //   name: 'admin'
    // };
    // return res.status(OK).send({ status: STATUS_SUCCESS, data: userData })

  }; //end

  /**
   * Function for login employee
   *
   * @param req As Request Data
   * @param res As Reponse Data
   * @param next As Callback argument to middleware function
   */
   this.employeeLogin = async (req, res, next) => {
    var globalResponse = {
      status     : STATUS_ERROR,
      message    : "Unauthorized access",
      statusCode : UNAUTHORIZED
    };
    /** Validate the request body */
    req.checkBody({
      username: {
        notEmpty: true,
      }
    });

    let errors = parseErrors(req.validationErrors());

    /**If error in request body send error */
    globalResponse.error = errors;
    if (errors) return res.status(UNAUTHORIZED).send(globalResponse);

    /**Check the username andd password from db and validate it */
    Users.findOne(
      { employeeId: req.body.username.toLowerCase(),role_type:TYPE_USERS},
      async(findErr, findRes) => {
        if (!findRes || findErr)
        return res.status(UNAUTHORIZED).send(globalResponse);

       /**generate jwt token */
       let tokenId = generateToken(findRes._id);
       await Users.updateOne(
         {
           _id: findRes._id,
         },
         { token_key: tokenId }
       );
       getuploadedImageURL(
         GET_PROFILE_IMAGE,
         [findRes],
         UPLOAD_PROFILE_IMAGE
       ).then(async (result) => {
         let userData = {
           token      : tokenId,
           id         : findRes._id,
           profileUrl : result[0].image,
         };
         /**Update login time in employee logs collections */
         let userId      = findRes._id ? findRes._id :"";
         let dataToInsert ={
           login       : new Date(),
           employeeId  : userId,
           logout      : "",
         };
         try {
           //save logn datas
          let insertJobs = new Logs(dataToInsert)
          await insertJobs.save();

          /** create logs at each time */
          let currentDay = weekday[new Date().getUTCDay()];

          asyncParallel({
            dailyLogs :(callback)=>{
              let conditions = {
                isDaily:YES,employeeId:userId, status:DEACTIVE, 
              };
              Jobs.find(conditions).populate('contractId','name startDate endDate description address clientId').exec(async(err,response)=>{
                let responseData = response;
                if(responseData && responseData.length>0){
                  let count = responseData.length;
                  let multipleLog =[];
                  responseData.map(async(items)=>{
                    let logData ={
                      startTime : new Date(),
                      taskId :items._id,
                      contractId:items.contractId._id ? items.contractId._id : null,
                      employeeId :userId,
                      type:items.jobType,
                      clientId :items.contractId.clientId ? items.clientId._id : null,
                    };
                    multipleLog.push(logData);
                    let logss = new TaskLogs(logData);
                    let data = await logss.save();
                    if(count === multipleLog.length){
                      callback(err,data)
                    }
                  });
                }else{
                  callback(err,null)
                }
              });
            },
            weeklyLogs:(callback)=>{
              let conditions1 = {
                isDaily:NO,
                repeatDays: {$in : [currentDay]},
                employeeId:userId, status:DEACTIVE, 
              };
              Jobs.find(conditions1).populate('contractId','name startDate endDate description address clientId').exec(async(err,response)=>{
                let responseData = response;
                if(responseData && responseData.length>0){
                  let count = responseData.length;
                  let multipleLog =[];
                  responseData.map(async(items)=>{
                    let logData ={
                      startTime : new Date(),
                      taskId :items._id,
                      contractId:items.contractId._id ? items.contractId._id : null,
                      employeeId :userId,
                      type:items.jobType,
                      clientId :items.contractId.clientId ? items.clientId._id : null,
                    };
                    multipleLog.push(logData);
                    let logss = new TaskLogs(logData);
                    let data = await logss.save();
                    if(count === multipleLog.length){
                      callback(err,data)
                    }
                  });
                }else{
                  callback(err,null)
                }
              });
            }
          },(err, result)=>{
            if(err) return res.status(INTERNAL).send(globalResponse);

          /**send success response */
          globalResponse.status     = STATUS_SUCCESS;
          globalResponse.statusCode = OK;
          globalResponse.message    = "Logged successfully.";
          globalResponse.data       = userData;
          return res.status(OK).send(globalResponse);

          });
         } catch (error) {
            return res.status(INTERNAL).send(globalResponse);
         }
         
       });
      }
    );
  }; //end
}
module.exports = new Auth();
