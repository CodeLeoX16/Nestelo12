const Listing = require('./models/listing');
const Review = require('./models/review');
const { listingSchema,reviewSchema} = require('./schema.js');
const ExpressError = require('./utility/expressError.js');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //redirect ural save
    req.session.redirectUrl= req.originalUrl;
    req.flash('error', 'You must be logged in to do that!');
    return res.redirect('/login');
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

//give authentcation fr edit and delete to dont give any one access to edit or drlrtr through hp sctoch
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing =await Listing.findById(id);
  if(!listing.owner._id.equals(res.locals.currentUser._id)) {
    req.flash('error', 'You do not have permission to edit this listing as you are not the owner!');
    return res.redirect(`/listings/${id}`);
  }
  next();
};

// Middleware to validate listing data
module.exports.validateListing  = (req, res, next) => {
  let {error}= listingSchema.validate(req.body);
    if(error){
         let errMsg=error.details.map((el)=>el.message).join(',');
            throw new ExpressError(errMsg, 400);
    }
   else{ 
    next();
   }
};

//validate review data
module.exports.validateReview = (req, res, next) => {
  let {error}= reviewSchema.validate(req.body);
      if(error){
           let errMsg=error.details.map((el)=>el.message).join(',');
              throw new ExpressError(errMsg, 400);
      }
     else{
      next();
     }
  };

//if review owner is not the same as logged in user then dont allow to delete or edit
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash('error', 'You are not author of this review!');
    return res.redirect(`/listings/${id}`);
  }
  next();
};
