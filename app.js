if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const mongoSanitize = require('express-mongo-sanitize');


const userRoutes = require("./router/users.js");
const campgroundsRoutes = require("./router/campgrounds.js");
const reviewsRoutes = require("./router/reviews.js");

const MongoStore = require("connect-mongo");

const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.get("/fakeUser", async (req, res) => {
    const user = new User({email: "mikeee@gmail.com", username: "mikeeee"});
    const newUser = await User.register(user, "chicken");
    res.send(newUser);
})

app.use("/", userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);


app.get("/", (req, res) => {
    res.render("home");
})

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = "Oh No, Something Went Wrong";
    res.status(statusCode).render("error", {err});
})

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
})

// app.get("/makecampground", async (req, res) => {
    //     const camp = new Campground({
        //         title: "My Backyard",
        //         description: "cheap camping!"
        //     });
        //     await camp.save();
        //     res.send(camp);
        // })



        // const validateCampground = (req, res, next) => {
//     const {error} = campgroundSchema.validate(req.body);
//     if (error){
//         const msg = error.details.map(el => el.message).join(",");
//         throw new ExpressError(msg, 400);
//     } else{
//         next();
//     }
// }

// const validateReview = (req, res, next) => {
//     const {error} = reviewSchema.validate(req.body);
//     if(error){
//         const msg = error.details.map(el => el.message).join(",");
//         throw new ExpressError(msg, 400);
//     } else{
//         next();
//     }
// }