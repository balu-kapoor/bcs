const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Contract = Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide name"],
		},
		startDate: {
			type: Date,
			default:""
		},
		endDate: {
			type: Date,
			default:""
		},
		clientId: {
			type: mongoose.Schema.Types.ObjectId,
            required:true,
			ref:"users"
		},
		jobId: {
			type: mongoose.Schema.Types.ObjectId,
			ref:"jobs"
		},
        employee: [
			{
				value:{
					type: mongoose.Schema.Types.ObjectId,
					required:true,
					ref:"users"
				}
			}
		],
        service:  [
			{
				value:{
					type: mongoose.Schema.Types.ObjectId,
					required:true,
					ref:"service_manager"
				}
			}
		],
		isDone:{
			type : Number,
			default: NO
		},
		isIssue:{
			type : Number,
			default: NO
		},
		address: {
			type: String,
		},
		date: {
			type: Date,
		},
		description: {
			type: String,
		},
		status :{
			type 	: Number,
			default	: ACTIVE
		}
	},
	{

		collection: 'contract_manager',
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

mongoose.model('contract_manager', Contract);
module.exports = mongoose.model('contract_manager');
