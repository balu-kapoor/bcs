const jwt           = require('jsonwebtoken');
const  fs           = require('fs');
const formidable    = require('formidable');
const clone         = require("clone");
const dateFormat    = require("dateformat");
const { unlink, stat, existsSync, mkdirSync, mkdir } = require("fs");

/** Generate token with expiresIn  */
generateToken = (tokenId)=>{
 var token = jwt.sign(
    {
    data: tokenId
    }, TOKEN_SECRET);
    return token;
};

/** verify token whether its valid or expire  */
verifyToken = (token)=>{
   var tokenValue =  jwt.verify(token, TOKEN_SECRET,(err,decoded)=>{
        return {"err" : err,'decoded': decoded}
    });
   return tokenValue
};

/**  parse validation errors */
parseErrors = (errors)=>{
    let oldErrors = [];
    let newErrors = [];
    if (errors && errors.constructor === Array) {
        errors.map(record=>{
            if (oldErrors.indexOf(record.param) === -1) {
                newErrors.push(record);
                oldErrors.push(record.param);
            }
        });
        return newErrors;
    }else {
        return null;
    }
};
/**  parse validation errors */
parseValidationErrors = (errors)=>{
    let oldErrors   = [];
    let newErrors   = [];
    let responseErr = [];
    if (errors && errors.constructor === Array) {
        errors.map(record=>{
            
            if (oldErrors.indexOf(record.param) === -1) {
                newErrors.push(record);
                oldErrors.push(record.param);
            }
        });
        if(newErrors && newErrors.constructor === Array){
            newErrors.map(record =>{
                responseErr.push({message : record.msg})
            });
        }
        return responseErr;
    }else {
        return null;
    }
};

/**  This function use for escape not allowed characters. */
clean_regex = (string)=>{
    var escaped = "";
    if (NOT_ALLOWED_CHARACTARS_FOR_REGEX && NOT_ALLOWED_CHARACTARS_FOR_REGEX.length > 0) {
        for (let i in string) {
            if (dispatch[string[i]]) escaped += "\\";
            escaped += string[i];
        }
        return escaped;
    }
    return string;
};


/**Date Time Global */
getUtcDate = (date,format) =>{
    const time = require('date-and-time');
    if(date){
        var now = new Date(date);
    }else{
        const dateTime = new Date();
        var now = time.format(dateTime, 'YYYY/MM/DD HH:mm:ss');
    }
    if(format){
        let date = require('date-and-time');
        const pattern = date.compile(format);
        return date.format(now,pattern);
    }else{
        return now;
    }
}//end getUtcdate()

/** define storage to store uploaded images
*   Note : We dont upload file to database ,we uploads only path name to database
*/
uploadImageFile = (image,path,name)=>{
    return new Promise((resolve)=> {
        if(!image || !path){
            return resolve({
                status      : STATUS_ERROR,
            });
        }
        let base64String = image;
        // Remove header;
        let base64Image = base64String.split(';base64,').pop() ;
        let uploadPath  = path;
        let fileName    = name+`${Date.now()}`

        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) return resolve({status :STATUS_ERROR});
             
            fs.writeFile(uploadPath+`${fileName}.jpg`, base64Image, {encoding: 'base64'}, function(err) {
                if (err) return resolve({status :STATUS_ERROR});
                resolve({
                    status : STATUS_SUCCESS,
                    file_name :fileName
                })
            }); 
        });
    });
};//end

getuploadedImageURL = (path,result,findPath)=>{
    return new Promise(resolve=>{
        if(result){
            result.map((item,index) =>{
                if(item && item.image != undefined){
                    let pathImage = findPath+item.image+".jpg";
                    if( fs.existsSync(pathImage)){
                        result[index].image = path+''+item.image+'.jpg'
                    }else{
                        result[index].image = path+"no_image_found.jpg"
                    }
                }else{
                    result[index].image = path+"no_image_found.jpg"
                }
            });
            return resolve(result);
        }
        return resolve(result);
    })
}//end

getMultipleImageURL = (path,result,findPath,options)=>{
    var fieldName = options.fieldName ? options.fieldName :"image";

    return new Promise(resolve=>{
        if(result && result.length >0){
            result.map((item,index) =>{
                if(item && item[fieldName] != undefined){
                    let pathImage = findPath+item[fieldName];
                    if( fs.existsSync(pathImage)){
                        result[index][fieldName] = path+''+item[fieldName]
                    }else{
                        result[index][fieldName] = path+"no_image_found.jpg"
                    }
                }else{
                    result[index][fieldName] = path+"no_image_found.jpg"
                }
            });
            return resolve(result);
        }
        return resolve(result);
    })
}
/** 
 * delete image from folder
 */
unLinkFile = (findPath,name)=>{
    return new Promise(resolve=>{
        if(name){
            let pathImage = findPath+name+`.jpg`;
            fs.unlink(`${pathImage}`,(err,response)=>{
               if(err) return resolve(false)
                return resolve(true);
            })
        }
        return resolve(false);
    })
}
/**
 * Generate a random string
 * 
 * @param length of string (eg : randomString(6))
 */
randomString = (length) =>{
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}//end

/**
 * Form data handle
 */
formData = (req,res)=>{
    const form = formidable({ multiples: true });
 return new Promise( resolve=>{
     form.parse(req, (err, fields, files) => {
     if (err) {
       return resolve({status : STATUS_ERROR,body :{}});
     }
     return resolve({status:STATUS_SUCCESS ,body:fields,files:files})
 })

  });
}//end

moveUploadedFile = (file, options) =>{
    return new Promise(resolve => {
        /* Use the mv() method to place the file somewhere on your server */
        let fileData    = file.name                         ? file.name.split(".")          : [];
        let imageName   = file.name                         ? file.name                     : "";
        let imageSize   = file.size                         ? file.size                     : "";
        let extension   = fileData                          ? fileData.pop().toLowerCase()  : "";
        let filePath    = (options && options.file_path)    ? options.file_path             : "";
        let oldPath     = (options && options.old_path)     ? options.old_path              :  "";
        let allowedExtensions = (options && options.allowed_extensions && (options.allowed_extensions.constructor() == Array) && (options.allowed_extensions.length > 0)) ? options.allowed_extensions:  ALLOWED_IMAGE_MIME_TYPES;
        let allowedFileSize = (options && options.allowed_file_size && (options.allowed_file_size.constructor() == Number)) ? options.allowed_file_size:  DEFAULT_ALLOWED_FILE_SIZE;
       
        /* Check file type and Send error response */
        if (allowedExtensions.indexOf(extension) == -1)
            return resolve({ status: STATUS_ERROR , err: "Selected file type is not allowed."});

        /* Check file size and Send error response */
        if (imageSize > allowedFileSize)
            return resolve({ status: STATUS_ERROR , err: "Selected file is too big."});

        /* Create new folder of this month */
        let newFolder = (newDate("", "mmm") + newDate("", "yyyy")).toUpperCase() + "/";
        createFolder(filePath + newFolder).then(res=>{
            if (res.status == STATUS_ERROR) 
                return  resolve({status: STATUS_ERROR, err: "File upload path not found or cannot created."})                
            
            /* Changing file name */
            let newFileName  = newFolder + Date.now() + "-" + changeFileName(imageName);
            let uploadedFile = filePath + newFileName;

            /* Moving uploaded file to server */
            file.mv(uploadedFile, function (err) {
                if (err) return resolve({ status: STATUS_ERROR,  err: "Error in file upload. Please try again." });
                    resolve({ status: STATUS_SUCCESS, file_name: newFileName }); 
            }); 
        }); 
    });  
}

/**
 *  Function to create a new folder
 *
 * @param path	As	folder path
 *
 * @return Object
 */
 createFolder = (path) => {
    return new Promise(resolve => {
        let filePathData = path.split('/');
        if (filePathData.length > 0) {
            mkdir(path, { recursive: true }, (err) => {
                if (err) resolve({ status: STATUS_ERROR , err: err});

                /** Send success response **/
                resolve({ status: STATUS_SUCCESS });
            });
        }else{
            /** Send success response **/
            resolve({ status: STATUS_SUCCESS });
        }
    });
}// end createFolder()

/**
 * Function for change file name
 *
 * @param fileName AS File Name
 *
 * @return filename
 */
 changeFileName = (fileName) => {
    let fileData = (fileName) ? fileName.split('.') : [];
    let extension = (fileData) ? fileData.pop() : '';
    fileName = fileName.replace('.' + extension, '');
    fileName = fileName.replace(RegExp('[^0-9a-zA-Z\.]+', 'g'), '');
    fileName = fileName.replace('.', '');
    return fileName + '.' + extension;
}//end changeFileName();

/**
 * Function to get date in any format
 * @param date 		as	Date object
 * @param format 	as 	Date format
 * @return date string
 */
 newDate = (date, format) => {
    if (date) {
        var now = new Date(date);
    } else {
        var now = new Date();
    }
    if (format) {
        return dateFormat(now, format);
    } else {
        return now;
    }
}//end newDate();
/**
 * Function for remove file from root path
 *
 * @param options As data in file root path
 *
 * @return json
 */
removeFile = (options) => {
    return new Promise(resolve => {
        var filePath = (options.file_path) ? options.file_path : "";
        let response = {
            status: STATUS_SUCCESS
        };

        if (filePath != "") {
            /** remove file **/
            unlink(filePath, (err) => {
                if (!err) {
                    /** Send success response **/
                    resolve(response);
                } else {
                    /** Send error response **/
                    response.status = STATUS_ERROR;
                    resolve(response);
                }
            });
        } else {
            /** Send error response **/
            response.status = STATUS_ERROR;
            resolve(response);
        }
    })
}//end removeFile()

/**
 * Function to Make full image path and check file is exist or not
 *
 * @param options As data in Object format (like :-  file url,file path,result,database field name)
 *
 * @return json
 */
 appendFileExistData = (options) => {
    return new Promise(resolve  => {
        var fileUrl             = (options.file_url)            ? options.file_url              : "";
        var filePath            = (options.file_path)           ? options.file_path             : "";
        var result              = (options.result)              ? clone(options.result)         : "";
        var databaseField       = (options.database_field)      ? options.database_field        : "";
        var image_placeholder   = (options.image_placeholder)   ? options.image_placeholder     : IMAGE_FIELD_NAME;
        var noImageAvailable    = (options.no_image_available)  ? options.no_image_available    : NO_IMAGE_AVAILABLE;
        
        if (result.length > 0) {
            let index = 0;
            result.forEach((record, recordIndex) => {
                var file = (record[databaseField] != '' && record[databaseField] != undefined) ? filePath + record[databaseField] : '';
                result[recordIndex][image_placeholder] = noImageAvailable;

                /** Set check file data **/
                let checkFileData = {
                    "file"                  : file,
                    "file_url"              : fileUrl,
                    "image_name"            : record[databaseField],
                    "record_index"          : recordIndex,
                    "no_image_available"    : noImageAvailable
                }

                checkFileExist(checkFileData).then((fileResponse) => {
                    let recordIndexResponse = (typeof fileResponse.record_index !== typeof undefined) ? fileResponse.record_index : "";
                    let imageResponse       = (fileResponse.file_url) ? fileResponse.file_url : "";
                    result[recordIndexResponse][image_placeholder] = imageResponse;

                    if (result.length - 1 == index) {
                        /** Send response **/
                        resolve({result: result});
                    }
                    index++;
                });
            });
        } else {
            /** Send response **/
            resolve({result: result});
        }
    });
}//End appendFileExistData()
checkFileExist = (options)      => {
    return new Promise(resolve  => {
        var file                = (options.file)                ? options.file                  : "";
        var fileUrl             = (options.file_url)            ? options.file_url              : "";
        var imageName           = (options.image_name)          ? options.image_name            : "";
        var recordIndex         = (typeof options.record_index !== typeof undefined) ? options.record_index : "";
        var noImageAvailable    = (options.no_image_available)  ? options.no_image_available    : "";

        stat(file, (err, stat) => {
            if (!err) {
                /** Send response **/
                resolve({
                    file_url: fileUrl + imageName,
                    record_index: recordIndex
                });
            } else {
                /** Send response **/
                resolve({
                    file_url: (noImageAvailable) ? noImageAvailable : NO_IMAGE_AVAILABLE,
                    record_index: recordIndex
                });
            }
        });
    })
}//end checkFileExist()