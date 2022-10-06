module.exports = {
    configure: (router) =>{
        app = router;
        
        /**Auth the all request before hitting routes spefied */
        checkLoginAuth = (req, res, next)=>{
            var globalResponse = {
                status  : STATUS_ERROR,
                message :'Access denied'
            }
            let token   = req.headers.tokenkey;
    
            if (typeof token !== typeof undefined) {
                /**JWT VERIFY */
                const verifiedToken =verifyToken(token);
                if(verifiedToken.err){
                    globalResponse.status  = STATUS_ERROR;
                    globalResponse.message = "Token expires"
                    return res.status(UNAUTHORIZED).send(globalResponse)
                }
                let userId = verifiedToken.decoded ? verifiedToken.decoded : "";
                if(userId){
                    next();
                }
            }else {
                /** send error response */
                res.status(UNAUTHORIZED).send(globalResponse)
            }
        } 

/******************************************Routes of admin controllers start ****************************************************************************/

        /**Auth's modules routes */
        require('../controllers/auth/routes');
        
        /**User's modules routes */
        require(WEBSITE_ADMIN_FULL_PATH +'users_modules/routes');

        /**Dashboard modules routes */
        require(WEBSITE_ADMIN_FULL_PATH +'dashboard/routes');

       /**Service modules routes */
       require(WEBSITE_ADMIN_FULL_PATH +'services/routes');

       /**Contracts modules routes */
       require(WEBSITE_ADMIN_FULL_PATH +'task_modules/routes');

       /**jobs modules routes */
       require(WEBSITE_ADMIN_FULL_PATH +'jobs_modules/routes');


/*********************************************************end of admin controllers ****************************************************************/
            
/********************************************************** Mobile API Routes start  ****************************************************************/
        /**Contracts modules routes */
        require(WEBSITE_FRONT_FULL_PATH +'employee/routes');
        
 /**********************************************************End Monile API Routes */
        
    /** default routes */
    app.all('/',(req,res)=>{
        res.render('home', { title: 'BCS Work and Task Management API' })
    });
    }
}