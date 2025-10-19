//it work on mvc model
const Listing = require("../models/listing.js"); 
module.exports.index = async (req, res) => {
  const alllisting = await Listing.find({});
  res.render("listings/index.ejs", { alllisting});
};

module.exports.renderNewForm = (req, res) => {
 // console.log(req.user)
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path:'reviews',
    populate: {
      path: 'author', // Populate the author field in reviews
},
})
  .populate('owner');
  if (!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    // console.log(req.user)
    newListing.owner = req.user._id; // Set the owner to the logged-in user
    await newListing.save();
    req.flash('success', 'Successfully created a new listing!');
    res.redirect('/listings');
 };

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash('error', 'Listing not found');
    return res.redirect('/listings');
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing =async (req, res) => {
  let { id } = req.params;
 
  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  req.flash('success', 'Successfully updated the listing!');
  res.redirect(`/listings/${updatedListing._id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted the listing!');
  res.redirect('/listings');
};