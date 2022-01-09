const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

require("dotenv").config();

const app = express();
app.use(cors());
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

var gfs;

const connection = mongoose.connection;
connection.once("open", () => {
	console.log("MongoDB database connection established successfully");
	gfs = Grid(connection.db, mongoose.mongo);
	gfs.collection("imageUpload");
});

let storage = new GridFsStorage({
	url: uri,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			const fileInfo = {
				filename: file.originalname,
				bucketName: "imageUpload",
			};
			resolve(fileInfo);
		});
	},
});
const upload = multer({ storage });

app.post("/upload", upload.single("upload"), (req, res) => {
	res.json({ file: req.file });
});

app.get("/files", (req, res) => {
	gfs.files.find().toArray((err, files) => {
		//check if files exist
		if (!files || files.length == 0) {
			return res.status(404).json({
				err: "No files exist",
			});
		}
		// files exist
		return res.json(files);
	});
});

app.get("/files/:filename", (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
		//check if files exist
		if (!file || file.length == 0) {
			return res.status(404).json({
				err: "No files exist",
			});
		}
		//file exist
		return res.json(file);
	});
});

app.get("/image/:filename", async (req, res) => {
	gfs.files.findOne({ filename: req.params.filename }).then((file) => {
		if (!file || file.length == 0) {
			return res.status(404).json({
				err: "No files exist",
			});
		}
		//check if image
		if (
			file.contentType === "image/jpeg" ||
			file.contentType === "image/png"
		) {
			//read output to browser
			const readStream = gfs.createReadStream(file.filename);
			readStream.pipe(res);
		} else {
			res.status(404).json({
				err: "Not an image",
			});
		}
	});
});

app.delete("/files/:id", (req, res) => {
	gfs.remove(
		{ _id: req.params.id, root: "imageUpload" },
		(err, gridStore) => {
			if (err) {
				return res.status(404).json({ err: err });
			}
			res.redirect("/");
		}
	);
});

const usersRouter = require("./routes/users");
const fileRouter = require("./routes/file-upload-routes");

app.use("/users", usersRouter);

app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});
