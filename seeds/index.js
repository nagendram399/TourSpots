const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const dotenv = require("dotenv");

dotenv.config();
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price=Math.floor(Math.random() * 50)+10;
        const camp = new Campground({
            author:'60eaeb8e39543807c0691774',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
         
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas eligendi commodi excepturi nobis nostrum. Necessitatibus corporis, aperiam deserunt aliquam tempore incidunt, cupiditate unde, fugiat quo sapiente nesciunt. Vel, labore velit.',
            price,
            images: [
                {
                    
                    url: 'https://res.cloudinary.com/imageloader/image/upload/v1626008204/YelpCamp/jeremy-brady-vK26p2SFX3E-unsplash_w8iqlx.jpg',
                    filename: 'YelpCamp/qaqrxijv468dq598e2iv'
                  },
                  {
                 
                    url: 'https://res.cloudinary.com/imageloader/image/upload/v1626008083/YelpCamp/florian-wehde-szpz0b1Q6IE-unsplash_dlwmku.jpg',
                    filename: 'YelpCamp/yj2kymex2jt9dxd83apr'
                  }
              ],
              geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            }

        
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})