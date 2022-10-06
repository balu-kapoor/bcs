const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Jobs = Schema(
	{
		employeeId: {
			type: mongoose.Schema.Types.ObjectId,
            required:true,
			ref:"users"
		},
        contractId: {
			type: mongoose.Schema.Types.ObjectId,
            required:true,
			ref:"contract_manager"
		},
        serviceId: {
			type: mongoose.Schema.Types.ObjectId,
            required:true,
			ref:"service_manager"
		},
		clientId: {
			type: Schema.Types.ObjectId,
			ref :"users"
		},
		jobType:{
			type : String,
			default: REPEAT
		},
        isDaily:{
			type : Number,
			default: YES
		},
		repeatDays: {
				type: Schema.Types.Array
		},
		isIssue: {
			type:Number,
			default	: NO
		},
		status: {
			type:Number,
			default	: DEACTIVE
		}
	},
	{

		collection: 'jobs',
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

mongoose.model('jobs', Jobs);
module.exports = mongoose.model('jobs');
