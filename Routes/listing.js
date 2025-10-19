const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const wrapAsync = require('../utility/wrapAsync.js');
const { listingSchema} = require('../schema.js');
const ExpressError = require('../utility/expressError.js');
// const { isLoggedIn,isOwner,validateListing } = require('../../middleware.js');
// ...existing code...
const { isLoggedIn,isOwner,validateListing } = require('../middleware.js');

const listingcontroller = require('../controllers/listings.js');
// ...existing code...

// const listingcontroller = require('../../controllers/listings.js');

router.route("/")
  .get(  
  wrapAsync(listingcontroller.index)
  ) 
  .post(
    validateListing,
    isLoggedIn,
   wrapAsync(listingcontroller.createListing)
  )
// New route
router.get('/new',
  isLoggedIn,listingcontroller.renderNewForm
); 
router.route("/:id")
  .get(
    wrapAsync(listingcontroller.showListing)
  )
  .put(
    validateListing,
    isLoggedIn,
    isOwner,
    wrapAsync(listingcontroller.updateListing)
  )
  .delete(isLoggedIn,isOwner, 
  wrapAsync( listingcontroller.deleteListing))



// Edit route
router.get('/:id/edit',isLoggedIn,isOwner,
   wrapAsync(listingcontroller.renderEditForm)
);


module.exports = router;