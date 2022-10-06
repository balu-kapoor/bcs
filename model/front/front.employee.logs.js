const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmpLogs = Schema(
	{
		login: {
			type: Date,
		},
		logout: {
			type: Date,
		},
		workingHour :{
			type: Number,
			default:0
		},
		employeeId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref :"users"
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

mongoose.model('employee_logs', EmpLogs);
module.exports = mongoose.model('employee_logs');
