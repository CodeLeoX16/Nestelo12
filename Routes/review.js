const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utility/wrapAsync.js');
const ExpressError = require('../utility/expressError.js');
// const { reviewSchema } = require('../schema.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
// const { isLoggedIn } = require('../../middleware.js');
const { validateReview, isLoggedIn ,isReviewAuthor} = require('../middleware.js');

const reviewController = require('../controllers/reviews.js');



//reviews post route
router.post("",
  isLoggedIn,
  validateReview,wrapAsync(reviewController.createReview)
);




//reviews delete route
router.delete('/:reviewId',
  isLoggedIn,
  isReviewAuthor,
   wrapAsync(reviewController.deleteReview)
);

module.exports = router;