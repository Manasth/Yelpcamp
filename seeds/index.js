const mongoose = require("mongoose");
const cities = require("./cities")
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");

if(process.env.NODE_ENV !== "production"){
  require("dotenv").config();
}

mongoose.connect( process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: "6788ae07f91ec2cdb369ef14",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dxogkm0nz/image/upload/v1722189507/YelpCamp/niearu7uu9vzy9vzye6d.jpg',
                  filename: 'YelpCamp/niearu7uu9vzy9vzye6d',
                },
                {
                  url: 'https://res.cloudinary.com/dxogkm0nz/image/upload/v1722189509/YelpCamp/fdmmmgnuynuynfrynpye.jpg',
                  filename: 'YelpCamp/fdmmmgnuynuynfrynpye',
                }
              ],
            description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sint ut explicabo cumque ipsam iusto nobis neque. Sed molestiae magni asperiores alias, minima maxime adipisci. Quidem sapiente vero laboriosam perspiciatis reiciendis?",
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});