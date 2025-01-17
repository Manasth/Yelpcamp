const express = require("express");
const router = express.Router();
const {campgroundSchema} = require("./../schemas.js");
const ExpressError = require("./../utils/ExpressError.js");
const Campground = require("./../models/campground");
const {isLoggedIn, validateCampground, isAuthor} = require("../middleware");
const catchAsync = require("./../utils/catchAsync.js");
const campgrounds = require("../controllers/campgrounds.js");
const multer  = require('multer');
const {storage} = require("../cloudinary");
const upload = multer({ storage })

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn , isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;