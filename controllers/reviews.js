const Listing = require('../models/listing');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    // console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Set the author to the logged-in user's ID
    
    listing.reviews.push(newReview._id); // Push only the review's _id
    // console.log(newReview);
    await newReview.save();
    await listing.save();
    req.flash('success', 'Successfully added a new review!');
    res.redirect("/listings/" + listing._id);
   
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted the review!');
  res.redirect(`/listings/${id}`);
  // let redirectUrl = res.locals.redirectUrl || '/listings';
  // res.redirect( redirectUrl + `/listings/${id}`);
};