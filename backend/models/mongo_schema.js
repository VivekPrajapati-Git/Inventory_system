const mongoose = require('mongoose');

// We require mongo_conn just to ensure the connection is established if this model is loaded first
require('./mongo_conn');

const UserSalesSchema = new mongoose.Schema({
    date: { type: String, required: true }, // e.g. "2026-04-29"
    username: { type: String, required: true },
    items: [String],
    imageUrls: [String],
    prices: [Number],
    quantities: [Number]
});

const UserSales = mongoose.model('UserSales', UserSalesSchema);

module.exports = UserSales;