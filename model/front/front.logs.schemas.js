const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logs = Schema(
	{
		jobId: {
			type: Schema.Types.ObjectId,
			required: [true, "Please provide job id"],
			ref :"jobs"
		},
		employeeId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref :"users"
		},
		contractId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref :"contract_manager"
		},
		startTime: {
			type: Date,
		},
		endTime: {
			type: Date,
		},
		logout: {
			type: Date,
		},
		created_at :{
			type 	: Date,
			default	: new Date()
		},
		modified_at :{
			type 	: Date,
			default	: new Date()
		}
	},
);

mongoose.model('logs', logs);
module.exports = mongoose.model('logs');
