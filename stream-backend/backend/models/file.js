const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const fileSchema = new Schema(
	{
		fileName: {
			type: String,
			required: true,
		},
		filePath: {
			type: String,
			required: true,
		},
		fileType: {
			type: String,
			required: true,
		},
		fileSize: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		likes: {
			type: Object,
			required: false,
		},
		comments: {
			type: Object,
			required: false,
		},
		caption: {
			type: String,
			required: false,
			trim: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
