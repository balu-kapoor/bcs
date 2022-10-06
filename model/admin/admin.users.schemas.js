const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = Schema(
	{
        firstName: {
			type: String,
        },
		lastName: {
			type: String,
        },
		email: {
			type: String,
		},
		mobile: {
			type: Number,
		},
		address:{
			type:String
		},
		image: {
			type     : String,
			default  : ""
        },
        status: {
			type	: Number,
            default	: ACTIVE,
		},
		is_deleted :{
			type 	: Number,
			default : NOT_DELETED
		},
		role_type :{
			type 	: Number,
			default : TYPE_USERS
		},
		token_key :{
			type 	: String,
			default : ""
        },
		employeeId :{
			type 	: String,
			default : ""
        }
	},
	{

		collection: 'users',
		timestamps: {
			createdAt: 'created_at',
			updatedAt: 'modified_at'
		},
		id: false,
		toJSON: {
			getters: true
		},
		toObject: {
			getters: true
		}
	}
);

mongoose.model('users', Users);
module.exports = mongoose.model('users');
