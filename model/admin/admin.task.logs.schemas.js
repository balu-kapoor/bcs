const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Tasks = Schema(
	{
		taskId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref:"jobs"
		},
		employeeId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref:"users"
		},
		clientId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref:"users"
		},
		contractId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref:"contract_manager"
		},
		comment: {
			type: String,
		},
		description: {
			type: String,
		},
		reportTitle:{
			type:String
		},
		reportDescription:{
			type:String
		},
		timeTaken: {
			type:Number,
			default:0
		},
		startTime: {
			type        : Date,
		},
		type: {
			type        : String,
		},
        endTime: {
			type        : Date,
		},
		photos :[{
			name :{
				type:String
			}
		}],
		isIssue :{
			type 	: Boolean,
			default : false
		},
		isDone :{
			type 	: Boolean,
			default : false
		}
	},
	{

		collection: 'task_logs',
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

mongoose.model('task_logs', Tasks);
module.exports = mongoose.model('task_logs');
