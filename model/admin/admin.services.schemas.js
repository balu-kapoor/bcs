const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Services = Schema(
	{
		name: {
			type: String,
			required: [true, "Please provide name"],
		},
		description: {
			type: String,
		},
		duration: {
			type: Number,
			required:true
		},
		status :{
			type 	: Number,
			default	: ACTIVE
		},
	},
	{

		collection: 'service_manager',
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

mongoose.model('service_manager', Services);
module.exports = mongoose.model('service_manager');
