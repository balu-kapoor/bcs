var mongoose = require("mongoose");
var _db ;
const AppMode = process.env.APP_MODE;
const dbURL  = AppMode === "development" ? process.env.DATABASE_URL_DEVELOPMENT  : ( AppMode === "production" ? process.env.DATABASE_URL_PRODUCTION : process.env.DATABASE_URL_DEVELOPMENT)
const dbNAME = AppMode === "development" ? process.env.DATABASE_NAME_DEVELOPMENT : ( AppMode === "production" ? process.env.DATABASE_NAME_PRODUCTION : process.env.DATABASE_NAME_DEVELOPMENT)

//get db url and dbname from .env file
const mongoUrl = dbURL  || process.env.DATABASE_URL_DEVELOPMENT  ;
const dbName   = dbNAME || process.env.DATABASE_NAME_DEVELOPMENT ;

//connect to the mongodb
module.exports = {
    connectToServer : (callback)=>{
        mongoose.connect(mongoUrl,{useNewUrlParser:true,useUnifiedTopology: true},function (err,client) {
            if (err) {
                console.log("An error has occurred. mongodb not connected!");
                return callback(err);
            }
            console.log("Database is successfully connected!");
            
            callback(null);
        });
        mongoose.set("useFindAndModify", false);
        mongoose.set("useCreateIndex", true);
    },
}