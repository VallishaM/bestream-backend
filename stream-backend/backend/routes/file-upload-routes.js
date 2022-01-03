const express = require("express");
const { upload } = require("../helpers/filehelper");
const {
	fileUpload,
	getallFiles,
} = require("../controllers/fileuploaderController");
const router = express.Router();

router.post("/uploadFile", upload.single("file"), fileUpload);
router.get("/getFiles", getallFiles);

module.exports = router;
