if(process.env.NODE_ENV!=="production")
{
    require('dotenv').config();
}

const express=require('express');
const path=require('path');
const mongoose=require("mongoose");

const Expresserror=require('./utils/ExpressError');
const methodOverride=require('method-override');

const session = require('express-session');
const flash = require('connect-flash');
// const Joi=require('joi')
const ejsMate=require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const campgroundsRoutes = require('./routes/campground');
const reviewsRoutes = require('./routes/review');
const userRoutes=require('./routes/user');

const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// "mongodb://localhost:27017/yelp-camp"

mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify: false,
    useUnifiedTopology:true
});

const db=mongoose.connection; // shortcut db
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const app=express();
app.engine('ejs',ejsMate);
app.set('view engine','ejs')
app.set("views",path.join(__dirname,'views'))
// app.get('/',(req,res)=>{
//     res.send("Hello from yelp camp");
// })

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
        
    }
});


store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionConfig = {
    store,
    name:'session',
    secret:secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser=req.user;
    next();
})

// app.get('/fakeUser',async(req,res)=>{
//     const user=new User({email:'coli@gmail.com',username:'ns'});
//     const newUser=await User.register(user,'chicken');
//     res.send(newUser);
// })
const CSP = require('./csp');
app.use(helmet.contentSecurityPolicy(CSP));

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/',(req,res)=>
{
    res.render('home')
})




app.all('*',(req,res,next)=>{
   next(new Expresserror('Page Not found',404));
})

app.use((err,req,res,next)=>{
    const {statuscode=500,message="Something went Wrong"}=err
    if(!err.message)err.message="Oh No Something Went wrong!!"
    res.status(statuscode).render('error',{err});
   
})
const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running successfully on ${port}`);
})