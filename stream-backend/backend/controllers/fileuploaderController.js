const File = require("../models/file");

const fileUpload = async (req, res, next) => {
	try {
		const file = new File({
			fileName: req.file.originalname,
			filePath: req.file.path,
			fileType: req.file.mimetype,
			fileSize: fileSizeFormatter(req.file.size, 2), // 0.00
			username: req.body.username,
			likes: req.body.likes,
		});
		await file.save();
		res.status(201).send("File Uploaded Successfully");
	} catch (error) {
		res.status(400).send(error.message);
	}
};

const getallFiles = async (req, res, next) => {
	try {
		const files = await File.find();
		res.status(200).send(files);
	} catch (error) {
		res.status(400).send(error.message);
	}
};

const fileSizeFormatter = (bytes, decimal) => {
	if (bytes === 0) {
		return "0 Bytes";
	}
	const dm = decimal || 2;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
	const index = Math.floor(Math.log(bytes) / Math.log(1000));
	return (
		parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) +
		" " +
		sizes[index]
	);
};

module.exports = {
	fileUpload,
	getallFiles,
};
