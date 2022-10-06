require("dotenv").config();
ADMIN_NAME = "admin";

WEBSITE_ROOT_PATH       = process.cwd() + "/";
WEBSITE_ADMIN_FULL_PATH = WEBSITE_ROOT_PATH + "controllers/admin/";
WEBSITE_FRONT_FULL_PATH = WEBSITE_ROOT_PATH + "controllers/front/";
BASE_URL                = 'http://52.56.53.165:443'

/**Image upload path */
IMAGE_FIELD_NAME     = "image"
NO_IMAGE_AVAILABLE   = BASE_URL +"/uploads/no_image_found.jpg";

//profile
UPLOAD_PROFILE_IMAGE = WEBSITE_ROOT_PATH + "public/uploads/profile/";
GET_PROFILE_IMAGE    = BASE_URL +"/uploads/profile/";
UPLOAD_PROFILE_NAME  = "profile";

//task
UPLOAD_TASK_IMAGE = WEBSITE_ROOT_PATH + "public/uploads/task/";
GET_TASK_IMAGE    = BASE_URL +"/uploads/task/";
UPLOAD_TASK_NAME  = "profile";
/* Image file allowed extensions */
ALLOWED_IMAGE_MIME_TYPES    = ['jpg', 'jpeg', 'png', 'pdf', 'doc'];

/* file allowed size in bytes */
DEFAULT_ALLOWED_FILE_SIZE   = 10 * 1024 * 1024;

/**STATUS CODE  */
OK           = 200;
CREATED      = 201;
BAD_REQUEST  = 400;
UNAUTHORIZED = 401;
INTERNAL     = 500;
NO_CONTENT   = 204;

/**COMMON CONSTANT */
SALT_ROUND     = 10;
ACTIVE         = 1;
DEACTIVE       = 0;
SEEN           = 1;
UNSEEN         = 0;
NOT_VERIFIED   = 0;
VERIFIED       = 1;
REJECTED       = 2;
PENDING        = 3;
NOT_DELETED    = 1;
DELETED        = 0;
STATUS_ERROR   = false;
STATUS_SUCCESS = true;
SALT_ROUNDS    = 10;
YES            = 1;
NO             = 0;
DEFAULT_RANGE  = 0;
REPEAT         = 'repeat';
NON_REPEAT     = 'non_repeat';

// weekday
weekday = new Array(7);
weekday[1]="monday";
weekday[2]="tuesday";
weekday[3]="wednesday";
weekday[4]="thursday";
weekday[5]="friday";
weekday[6]="saturday";
weekday[7]="sunday";

/**For Data table */
SORT_ASC                = 1;
SORT_DESC               = -1;
NUMERIC_FIELD           = "numeric_field";
OBJECT_ID_FIELD         = "object_id_field";
EXACT_FIELD             = "exact_field";
DATATABLE_DEFAULT_LIMIT = 10;
DATATABLE_DEFAULT_SKIP  = 0;

/**Role Id's and types*/
TYPE_ADMIN      = 1;
TYPE_SUB_ADMIN  = 2;
TYPE_USERS      = 3;
TYPE_VENDORS    = 4;

/**Notification Type*/
NOTIFICATION_VENDOR      = "VENDOR";
NOTIFICATION_LIST        = "LIST";
NOTIFICATION_PRODUCT     = "PRODUCT";
NOTIFICATION_POPUP       = "POPUP";
NOTIFICATION_STORE_POPUP = "STORE_POPUP";

/**MAximum Allowed input */
INPUT_MAX    = 150;
TEXTBOX_MAX  = 1000;
AGE_MAX      = 150;
AGE_MIN      = 12;
PASSWORD_MAX = 6;
PASSWORD_MIN = 16;
EMAIL_MAX    = 50;

/**JWT token constant */
TOKEN_EXPIRE    = "10h";
TOKEN_ALGORITHM = "RS256";
TOKEN_SECRET    = "jwtrs256";

/** REGEX GLOBAL */
//atleast alpha and atleast 1 numeric
ALPHANUMERIC_ONLY = /^[A-Z]+$/i;

VALID_EMAIL = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//min 6 length altleats 1number,1special,upper,lower case
VALID_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/i;

/** for clean_regex function in utilities */
NOT_ALLOWED_CHARACTARS_FOR_REGEX = {
    "{": true,
    "}": true,
    "[": true,
    "]": true,
    "-": true,
    "/": true,
    "\\": true,
    "(": true,
    ")": true,
    "*": true,
    "+": true,
    "?": true,
    ".": true,
    "^": true,
    $: true,
    "|": true,
};
