const express = require('express');
const router = express.Router();
const UserSales = require('../models/mongo_schema');

router.post('/log_sales', async (req, res) => {
    try {
        // Expected body: { username, item, quantity, price, imageUrl, date: "2026-04-29" }
        const { username, item, quantity, price, imageUrl } = req.body;
        // Use provided date or today's date formatted as YYYY-MM-DD
        const date = req.body.date || new Date().toISOString().split('T')[0];

        // Find existing record for this user on this date
        let record = await UserSales.findOne({ date, username });

        if (record) {
            // Append to arrays
            record.items.push(item);
            record.quantities.push(quantity);
            record.prices.push(price);
            record.imageUrls.push(imageUrl);
            await record.save();
        } else {
            // Create new record
            record = new UserSales({
                date,
                username,
                items: [item],
                quantities: [quantity],
                prices: [price],
                imageUrls: [imageUrl]
            });
            await record.save();
        }

        res.json({ message: "Sale logged successfully", record });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging sale");
    }
});

router.get('/get_sales', async (req, res) => {
    try {
        const sales = await UserSales.find({}).sort({ date: -1 });

        // We need to flatten this for the frontend to display individual sales easily, 
        // or just return as is and frontend handles it. 
        // The previous frontend expected an array of flat objects {id, username, item, quantity, price, imageUrl, date}
        // Let's flatten it here so frontend doesn't break too much.
        let flattenedSales = [];
        sales.forEach(record => {
            for (let i = 0; i < record.items.length; i++) {
                flattenedSales.push({
                    id: record._id.toString() + '_' + i,
                    date: record.date,
                    username: record.username,
                    item: record.items[i],
                    quantity: record.quantities[i],
                    price: record.prices[i],
                    imageUrl: record.imageUrls[i]
                });
            }
        });

        // Sort by id to have some consistent ordering, or by date
        res.json(flattenedSales);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching sales");
    }
});

module.exports = router;
