const mongoose = require("mongoose");
const Review = require("./review");
const User = require("./user");
const { authorize } = require("passport");
const { ref } = require("joi");
const Schema = mongoose.Schema;

// The below variable will be passed along our virtuals because the data which is converted to json does not carry the virtual with it
// unless its specified which is what we are doing here. Here are some lines from mongoose documentation:
// By default, Mongoose does not include virtuals when you convert a document to JSON. For example, 
// if you pass a document to Express' res.json() function, virtuals will not be included by default.
const opts = {toJSON: {virtuals: true}};

const ImageSchema = new Schema({
    url: String,
    filename: String,
})

ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload", "/upload/w_200");
})

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
}, opts)

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...</p>
    `;
})

CampgroundSchema.post("findOneAndDelete",async function(doc) {
    if (doc){
        await Review.deleteMany({_id: {$in: doc.reviews}});
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema);