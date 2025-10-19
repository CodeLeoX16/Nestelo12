const mongoose = require('mongoose');
const review = require('./review');
const  Schema = mongoose.Schema;
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
   image: {
    type: String,
    default:
        "https://printawallpaper.com/wp-content/uploads/2020/07/Caribbean_Sea_Beach_D-768x512.jpg",
    set: (v) =>
        !v || v.trim() === ""
            ? "https://printawallpaper.com/wp-content/uploads/2020/07/Caribbean_Sea_Beach_D-768x512.jpg"
            : v
    },
    country:{
        type: String,
        required: true,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

});
// Middleware to delete reviews when a listing is deleted

listingSchema.post('findOneAndDelete', async (listings) => {
    if(!listings){
    await review.deleteMany({_id:{ $in: listings.reviews }});
    }
        
});
const Listing = mongoose.model('listing', listingSchema);
module.exports = Listing;