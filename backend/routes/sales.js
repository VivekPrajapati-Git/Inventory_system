const express = require('express');
const router = express.Router();
const UserSales = require('../models/mongo_schema');
const supabase = require('../database/supabase_conn');


router.post('/log_sales', async (req, res) => {
    try {
        const { username, item, quantity, price, imageUrl } = req.body;
        const date = req.body.date || new Date().toISOString().split('T')[0];

        // 1. Log to MongoDB
        let record = await UserSales.findOne({ date, username });

        if (record) {
            record.items.push(item);
            record.quantities.push(quantity);
            record.prices.push(price);
            record.imageUrls.push(imageUrl);
            await record.save();
        } else {
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

        // 2. Decrement stock in Supabase
        const { data: stock, error: fetchErr } = await supabase
            .from('Stock')
            .select('quantity')
            .eq('name', item)
            .single();

        if (!fetchErr && stock) {
            await supabase
                .from('Stock')
                .update({ quantity: stock.quantity - quantity })
                .eq('name', item);
        }

        res.json({ message: "Sale logged successfully", record });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging sale");
    }
});

router.post('/log_sales_bulk', async (req, res) => {
    try {
        const { username, sales } = req.body; // sales: [{ item, quantity, price, imageUrl }]
        const date = req.body.date || new Date().toISOString().split('T')[0];

        if (!sales || !Array.isArray(sales) || sales.length === 0) {
            return res.status(400).send("Invalid sales data");
        }

        // 1. Log to MongoDB
        let record = await UserSales.findOne({ date, username });

        if (!record) {
            record = new UserSales({
                date,
                username,
                items: [],
                quantities: [],
                prices: [],
                imageUrls: []
            });
        }

        for (const sale of sales) {
            record.items.push(sale.item);
            record.quantities.push(sale.quantity);
            record.prices.push(sale.price);
            record.imageUrls.push(sale.imageUrl);
            
            // 2. Decrement stock in Supabase for each item
            const { data: stock, error: fetchErr } = await supabase
                .from('Stock')
                .select('quantity')
                .eq('name', sale.item)
                .single();

            if (!fetchErr && stock) {
                await supabase
                    .from('Stock')
                    .update({ quantity: stock.quantity - sale.quantity })
                    .eq('name', sale.item);
            }
        }

        await record.save();

        res.json({ message: "Bulk sales logged successfully", record });
    } catch (err) {
        console.error("Bulk log error:", err);
        res.status(500).send("Error logging bulk sales");
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
