const Joi = require('joi');

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow('', null), // Allow empty string or null
    price: Joi.number().required(),
    location: Joi.string().required(),
    country: Joi.string().required() // <-- Add this line
  }).required()
});

module.exports = { listingSchema };

// This schema validates that the review object contains the required fields
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required()
  }).required()
});