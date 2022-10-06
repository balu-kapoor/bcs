/** This is root file of our node application */
const express = require('express');
const expressValidator = require('express-validator');
const app =express();
const fileUpload        = require("express-fileupload")
const bodyParser = require('body-parser');

/** Import all custom files */
require('./config/global_constants');
require('dotenv').config();
require('ejs');
require('./utility');
app.use(fileUpload({ parseNested: true }))
const path = require('path')
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

/** enable cors to fetch api call from cross origin */
const cors = require('cors');
app.use(cors());
app.use(expressValidator());

/**  view engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.resolve('./public')));

/**  Connection of our database */
const connection    = require('./config/connection');
connection.connectToServer((err)=>{
    if (err) throw err;
    //configure our routes with database
    const routes = require('./routes/web');
    routes.configure(app);
});

/** start server listen on specified host and server */
const port = process.env.PORT || PORT;
const host = process.env.HOST || HOST_NAME;
app.listen(port, function () {
    console.log(`Server is runing on http://${host}:${port}`);
});
//end